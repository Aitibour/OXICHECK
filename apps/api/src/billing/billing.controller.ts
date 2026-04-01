import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Req,
  Res,
  RawBodyRequest,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { Role } from '@hotelcheckin/shared';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { BillingService } from './billing.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ChangeTierDto } from './dto/change-tier.dto';
import { UsageQueryDto } from './dto/usage-query.dto';
import { STRIPE_PROVIDER } from './billing.constants';

@ApiTags('Billing')
@Controller('v1/billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(
    private readonly billingService: BillingService,
    private readonly configService: ConfigService,
    @Inject(STRIPE_PROVIDER) private readonly stripe: Stripe,
  ) {}

  // ─── Customer ──────────────────────────────────────────────────────

  @Post('customers')
  @UseGuards(RolesGuard)
  @Roles(Role.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe customer for an organization' })
  async createCustomer(@Body() dto: CreateCustomerDto) {
    return this.billingService.createCustomer(
      dto.organizationId,
      dto.email,
      dto.name,
    );
  }

  // ─── Subscription ─────────────────────────────────────────────────

  @Get('subscription')
  @UseGuards(RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER, Role.GENERAL_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current organization subscription' })
  async getSubscription(@CurrentUser('organizationId') organizationId: string) {
    return this.billingService.getSubscription(organizationId);
  }

  @Post('subscription')
  @UseGuards(RolesGuard)
  @Roles(Role.PROPERTY_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subscription' })
  async createSubscription(@Body() dto: CreateSubscriptionDto) {
    return this.billingService.createSubscription(dto.organizationId, dto.tier);
  }

  @Patch('subscription/tier')
  @UseGuards(RolesGuard)
  @Roles(Role.PROPERTY_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change subscription tier' })
  async changeTier(
    @CurrentUser('organizationId') organizationId: string,
    @Body() dto: ChangeTierDto,
  ) {
    return this.billingService.changeSubscriptionTier(
      organizationId,
      dto.newTier,
    );
  }

  @Delete('subscription')
  @UseGuards(RolesGuard)
  @Roles(Role.PROPERTY_OWNER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription at period end' })
  async cancelSubscription(
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.billingService.cancelSubscription(organizationId);
  }

  // ─── Usage ─────────────────────────────────────────────────────────

  @Get('usage')
  @UseGuards(RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER, Role.GENERAL_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get usage for current billing period' })
  async getCurrentUsage(
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.billingService.getCurrentPeriodUsage(organizationId);
  }

  @Get('usage/history')
  @UseGuards(RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER, Role.GENERAL_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get historical usage with date range' })
  async getUsageHistory(
    @CurrentUser('organizationId') organizationId: string,
    @Query() query: UsageQueryDto,
  ) {
    return this.billingService.getUsageSummary(
      organizationId,
      new Date(query.periodStart),
      new Date(query.periodEnd),
      query.propertyId,
    );
  }

  // ─── Webhook ───────────────────────────────────────────────────────

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = this.configService.get<string>(
      'stripe.webhookSecret',
    );

    if (!sig || !webhookSecret) {
      throw new BadRequestException('Missing Stripe signature or webhook secret');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody!,
        sig,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err}`);
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    await this.billingService.handleWebhook(event);

    res.json({ received: true });
  }
}
