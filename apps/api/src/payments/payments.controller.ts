import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { RawBodyRequest } from '@nestjs/common';
import Stripe from 'stripe';
import { Role } from '@hotelcheckin/shared';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { STRIPE_PROVIDER } from '../billing/billing.constants';
import { PaymentsService } from './payments.service';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';
import { CreatePreAuthDto } from './dto/create-pre-auth.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';

@ApiTags('Payments')
@Controller('v1/payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
    @Inject(STRIPE_PROVIDER) private readonly stripe: Stripe,
  ) {}

  // ─── Hosted Checkout Session (public — guest token) ────────────────────────

  @Post('session')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a Stripe Checkout Session (hosted page) for a reservation',
  })
  async createPaymentSession(@Body() dto: CreatePaymentSessionDto) {
    return this.paymentsService.createPaymentSession(
      dto.reservationId,
      dto.amountInCents,
      dto.currency,
      dto.returnUrl,
    );
  }

  // ─── Pre-Authorization (public — guest token) ──────────────────────────────

  @Post('pre-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a Stripe PaymentIntent with manual capture (pre-authorization)',
  })
  async createPreAuth(@Body() dto: CreatePreAuthDto) {
    return this.paymentsService.createPreAuthorization(
      dto.reservationId,
      dto.amountInCents,
      dto.currency,
    );
  }

  // ─── Capture (FRONT_DESK_SUPERVISOR+) ────────────────────────────────────

  @Post(':id/capture')
  @UseGuards(RolesGuard)
  @Roles(
    Role.FRONT_DESK_SUPERVISOR,
    Role.GENERAL_MANAGER,
    Role.PROPERTY_OWNER,
    Role.PLATFORM_ADMIN,
  )
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Capture a pre-authorized payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async capturePayment(@Param('id') id: string) {
    return this.paymentsService.capturePayment(id);
  }

  // ─── Refund (GENERAL_MANAGER+) ────────────────────────────────────────────

  @Post(':id/refund')
  @UseGuards(RolesGuard)
  @Roles(Role.GENERAL_MANAGER, Role.PROPERTY_OWNER, Role.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Issue a full or partial refund for a captured payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async refundPayment(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
  ) {
    return this.paymentsService.refundPayment(id, dto.amountInCents);
  }

  // ─── List by Reservation (FRONT_DESK_AGENT+) ─────────────────────────────

  @Get('reservation/:reservationId')
  @UseGuards(RolesGuard)
  @Roles(
    Role.FRONT_DESK_AGENT,
    Role.FRONT_DESK_SUPERVISOR,
    Role.GENERAL_MANAGER,
    Role.REVENUE_MANAGER,
    Role.PROPERTY_OWNER,
    Role.PLATFORM_ADMIN,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all payments for a reservation' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  async getPaymentsByReservation(@Param('reservationId') reservationId: string) {
    return this.paymentsService.getPaymentsByReservation(reservationId);
  }

  // ─── List by Property (GENERAL_MANAGER+) ─────────────────────────────────

  @Get('property/:propertyId')
  @UseGuards(RolesGuard)
  @Roles(
    Role.GENERAL_MANAGER,
    Role.REVENUE_MANAGER,
    Role.PROPERTY_OWNER,
    Role.PLATFORM_ADMIN,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all payments for a property with optional filters' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  async getPaymentsByProperty(
    @Param('propertyId') propertyId: string,
    @Query() query: PaymentQueryDto,
  ) {
    return this.paymentsService.getPaymentsByProperty(propertyId, query);
  }

  // ─── Payment Summary (GENERAL_MANAGER+) ──────────────────────────────────

  @Get('summary/:propertyId')
  @UseGuards(RolesGuard)
  @Roles(
    Role.GENERAL_MANAGER,
    Role.REVENUE_MANAGER,
    Role.PROPERTY_OWNER,
    Role.PLATFORM_ADMIN,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aggregate payment totals for a property within a date range' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  async getPaymentSummary(
    @Param('propertyId') propertyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1)); // default: start of current month
    const end = endDate ? new Date(endDate) : new Date();

    return this.paymentsService.getPaymentSummary(propertyId, start, end);
  }

  // ─── Stripe Payment Webhook (public — signature verified) ────────────────

  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stripe payment webhook endpoint (signature-verified)',
  })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');

    if (!sig || !webhookSecret) {
      throw new BadRequestException(
        'Missing Stripe signature header or webhook secret configuration',
      );
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody!,
        sig,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(`Payment webhook signature verification failed: ${err}`);
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    await this.paymentsService.handleStripePaymentWebhook(event);

    res.json({ received: true });
  }
}
