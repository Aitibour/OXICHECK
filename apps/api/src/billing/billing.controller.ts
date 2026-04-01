import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { InvoiceService } from './invoice.service';
import { TierManagementService } from './tier-management.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ChangeTierDto } from './dto/change-tier.dto';
import { UsageQueryDto } from './dto/usage-query.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { CostEstimateDto } from './dto/cost-estimate.dto';
import { STRIPE_PROVIDER } from './billing.constants';

@ApiTags('Billing')
@Controller('v1/billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(
    private readonly billingService: BillingService,
    private readonly invoiceService: InvoiceService,
    private readonly tierManagementService: TierManagementService,
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

  // ─── Invoices ──────────────────────────────────────────────────────

  @Get('invoices')
  @UseGuards(RolesGuard)
  @Roles(Role.PROPERTY_OWNER, Role.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List invoice history from Stripe' })
  async getInvoices(
    @CurrentUser('organizationId') organizationId: string,
    @Query() query: InvoiceQueryDto,
  ) {
    return this.invoiceService.getInvoiceHistory(
      organizationId,
      query.limit,
      query.startingAfter,
    );
  }

  @Get('invoices/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.PROPERTY_OWNER, Role.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single invoice details from Stripe' })
  async getInvoice(@Param('id') stripeInvoiceId: string) {
    return this.invoiceService.getInvoiceById(stripeInvoiceId);
  }

  @Get('invoices/:id/pdf')
  @UseGuards(RolesGuard)
  @Roles(Role.PROPERTY_OWNER, Role.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate and download invoice as HTML (printable to PDF)' })
  async getInvoicePdf(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') _stripeInvoiceId: string,
    @Query('periodStart') periodStartStr: string,
    @Query('periodEnd') periodEndStr: string,
    @Res() res: Response,
  ) {
    if (!periodStartStr || !periodEndStr) {
      throw new BadRequestException('periodStart and periodEnd query params are required');
    }

    const periodStart = new Date(periodStartStr);
    const periodEnd = new Date(periodEndStr);

    const { html, metadata } = await this.invoiceService.generateInvoice(
      organizationId,
      periodStart,
      periodEnd,
    );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${metadata.invoiceNumber}.html"`,
    );
    res.send(html);
  }

  // ─── Overage ───────────────────────────────────────────────────────

  @Get('overage')
  @UseGuards(RolesGuard)
  @Roles(Role.PROPERTY_OWNER, Role.GENERAL_MANAGER, Role.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current period overage status' })
  async getCurrentOverage(
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const subscription = await this.billingService.getSubscription(organizationId);
    return this.invoiceService.calculateOverage(
      organizationId,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd,
    );
  }

  // ─── Tiers ─────────────────────────────────────────────────────────

  @Get('tiers')
  @UseGuards(RolesGuard)
  @Roles(Role.PROPERTY_OWNER, Role.GENERAL_MANAGER, Role.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all available tiers with pricing' })
  async getAvailableTiers() {
    return this.tierManagementService.getAvailableTiers();
  }

  @Get('tiers/recommendation')
  @UseGuards(RolesGuard)
  @Roles(Role.PROPERTY_OWNER, Role.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI-driven tier recommendation based on trailing usage' })
  async getTierRecommendation(
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.tierManagementService.evaluateTierFit(organizationId);
  }

  // ─── Cost Estimate ─────────────────────────────────────────────────

  @Get('estimate')
  @UseGuards(RolesGuard)
  @Roles(Role.PROPERTY_OWNER, Role.GENERAL_MANAGER, Role.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estimate monthly cost for a tier + projected usage' })
  async estimateCost(@Query() query: CostEstimateDto) {
    return this.tierManagementService.estimateMonthlyCost(
      query.tier,
      query.projectedMonthlyUsage,
    );
  }
}
