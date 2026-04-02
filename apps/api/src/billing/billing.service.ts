import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import Stripe from 'stripe';
import {
  prisma,
  BillingTier,
  SubscriptionStatus,
  UsageEventType,
} from '@hotelcheckin/database';
import { STRIPE_PROVIDER, TIER_CONFIG } from './billing.constants';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(@Inject(STRIPE_PROVIDER) private readonly stripe: Stripe) {}

  /**
   * Create a Stripe customer for an organization and persist the customer ID.
   */
  async createCustomer(
    organizationId: string,
    email: string,
    name: string,
  ): Promise<{ stripeCustomerId: string }> {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }

    if (org.stripeCustomerId) {
      throw new BadRequestException(
        'Organization already has a Stripe customer',
      );
    }

    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: { organizationId },
    });

    await prisma.organization.update({
      where: { id: organizationId },
      data: { stripeCustomerId: customer.id },
    });

    this.logger.log(
      `Created Stripe customer ${customer.id} for org ${organizationId}`,
    );

    return { stripeCustomerId: customer.id };
  }

  /**
   * Create a Stripe subscription for an organization.
   */
  async createSubscription(organizationId: string, tier: BillingTier) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    });

    if (!org) {
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }

    if (!org.stripeCustomerId) {
      throw new BadRequestException(
        'Organization must have a Stripe customer before creating a subscription',
      );
    }

    if (org.subscription) {
      throw new BadRequestException('Organization already has an active subscription');
    }

    const tierConfig = TIER_CONFIG[tier];

    // Create a Stripe subscription with the tier price
    const stripeSubscription = await this.stripe.subscriptions.create({
      customer: org.stripeCustomerId,
      items: [
        {
          price_data: {
            currency: 'cad',
            product: undefined,
            unit_amount: tierConfig.monthlyPrice,
            recurring: { interval: 'month' },
          } as any,
        },
      ],
      metadata: { organizationId, tier },
    });

    const periodStart = new Date(stripeSubscription.current_period_start * 1000);
    const periodEnd = new Date(stripeSubscription.current_period_end * 1000);

    const subscription = await prisma.subscription.create({
      data: {
        organizationId,
        stripeSubscriptionId: stripeSubscription.id,
        tier,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        annualCheckInAllowance: tierConfig.annualAllowance,
      },
    });

    // Update org billing tier
    await prisma.organization.update({
      where: { id: organizationId },
      data: { billingTier: tier },
    });

    this.logger.log(
      `Created subscription ${stripeSubscription.id} (${tier}) for org ${organizationId}`,
    );

    return subscription;
  }

  /**
   * Cancel an organization's subscription at the end of the current billing period.
   */
  async cancelSubscription(organizationId: string) {
    const subscription = await this.getActiveSubscription(organizationId);

    if (subscription.stripeSubscriptionId) {
      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.CANCELLED },
    });

    this.logger.log(`Cancelled subscription for org ${organizationId}`);

    return updated;
  }

  /**
   * Change the subscription tier (upgrade or downgrade).
   */
  async changeSubscriptionTier(organizationId: string, newTier: BillingTier) {
    const subscription = await this.getActiveSubscription(organizationId);
    const tierConfig = TIER_CONFIG[newTier];

    if (subscription.tier === newTier) {
      throw new BadRequestException('Organization is already on this tier');
    }

    if (subscription.stripeSubscriptionId) {
      // Retrieve the Stripe subscription to get the item ID
      const stripeSub = await this.stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
      );

      const itemId = stripeSub.items.data[0]?.id;
      if (itemId) {
        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          items: [
            {
              id: itemId,
              price_data: {
                currency: 'cad',
                product: undefined,
                unit_amount: tierConfig.monthlyPrice,
                recurring: { interval: 'month' },
              } as any,
            },
          ],
          metadata: { organizationId, tier: newTier },
          proration_behavior: 'create_prorations',
        });
      }
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        tier: newTier,
        annualCheckInAllowance: tierConfig.annualAllowance,
      },
    });

    await prisma.organization.update({
      where: { id: organizationId },
      data: { billingTier: newTier },
    });

    this.logger.log(
      `Changed subscription tier from ${subscription.tier} to ${newTier} for org ${organizationId}`,
    );

    return updated;
  }

  /**
   * Get the current subscription with usage stats for an organization.
   */
  async getSubscription(organizationId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for organization ${organizationId}`,
      );
    }

    const usage = await this.getCurrentPeriodUsage(organizationId);

    return {
      ...subscription,
      usage,
      tierConfig: TIER_CONFIG[subscription.tier],
    };
  }

  /**
   * Record a usage event for an organization.
   * If the event is PRE_CHECK_COMPLETED and total exceeds the tier allowance,
   * logs an overage warning.
   */
  async recordUsage(
    organizationId: string,
    propertyId: string,
    eventType: UsageEventType,
  ) {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for organization ${organizationId}`,
      );
    }

    const record = await prisma.usageRecord.create({
      data: {
        organizationId,
        propertyId,
        eventType,
        count: 1,
        periodStart: subscription.currentPeriodStart,
        periodEnd: subscription.currentPeriodEnd,
      },
    });

    // Check for overage on check-in events
    if (eventType === UsageEventType.PRE_CHECK_COMPLETED) {
      const totalCheckIns = await prisma.usageRecord.aggregate({
        where: {
          organizationId,
          eventType: UsageEventType.PRE_CHECK_COMPLETED,
          periodStart: { gte: subscription.currentPeriodStart },
          periodEnd: { lte: subscription.currentPeriodEnd },
        },
        _sum: { count: true },
      });

      const total = totalCheckIns._sum.count ?? 0;

      if (total > subscription.annualCheckInAllowance) {
        const overageCount = total - subscription.annualCheckInAllowance;
        const tierConfig = TIER_CONFIG[subscription.tier];

        this.logger.warn(
          `Overage detected for org ${organizationId}: ${overageCount} check-ins over ` +
            `${subscription.annualCheckInAllowance} allowance. ` +
            `Overage rate: $${tierConfig.overagePerUnit}/unit`,
        );

        // Report overage usage to Stripe if subscription exists
        if (subscription.stripeSubscriptionId) {
          try {
            await this.stripe.subscriptionItems.createUsageRecord(
              subscription.stripeSubscriptionId,
              {
                quantity: 1,
                timestamp: Math.floor(Date.now() / 1000),
                action: 'increment',
              },
            );
          } catch (error) {
            // Overage reporting to Stripe is best-effort; log and continue
            this.logger.error(
              `Failed to report overage to Stripe for org ${organizationId}`,
              error,
            );
          }
        }
      }
    }

    return record;
  }

  /**
   * Aggregate usage by event type and optionally by property for a given period.
   */
  async getUsageSummary(
    organizationId: string,
    periodStart: Date,
    periodEnd: Date,
    propertyId?: string,
  ) {
    const where: Record<string, unknown> = {
      organizationId,
      periodStart: { gte: periodStart },
      periodEnd: { lte: periodEnd },
    };

    if (propertyId) {
      where.propertyId = propertyId;
    }

    const byEventType = await prisma.usageRecord.groupBy({
      by: ['eventType'],
      where,
      _sum: { count: true },
    });

    const byProperty = await prisma.usageRecord.groupBy({
      by: ['propertyId', 'eventType'],
      where,
      _sum: { count: true },
    });

    return {
      periodStart,
      periodEnd,
      byEventType: byEventType.map((r) => ({
        eventType: r.eventType,
        total: r._sum.count ?? 0,
      })),
      byProperty: byProperty.map((r) => ({
        propertyId: r.propertyId,
        eventType: r.eventType,
        total: r._sum.count ?? 0,
      })),
    };
  }

  /**
   * Get usage for the current billing period.
   */
  async getCurrentPeriodUsage(organizationId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for organization ${organizationId}`,
      );
    }

    return this.getUsageSummary(
      organizationId,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd,
    );
  }

  /**
   * Process incoming Stripe webhook events.
   */
  async handleWebhook(event: Stripe.Event) {
    this.logger.log(`Processing Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        this.logger.log(`Invoice paid: ${invoice.id}`);
        if (invoice.subscription) {
          await this.syncSubscriptionStatus(invoice.subscription as string);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        this.logger.warn(`Invoice payment failed: ${invoice.id}`);
        if (invoice.subscription) {
          await this.syncSubscriptionStatus(invoice.subscription as string);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.syncSubscriptionStatus(subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionDeleted(subscription.id);
        break;
      }

      default:
        this.logger.log(`Unhandled webhook event type: ${event.type}`);
    }
  }

  /**
   * Sync local subscription status from Stripe.
   */
  async syncSubscriptionStatus(stripeSubscriptionId: string) {
    const stripeSub =
      await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

    const localSub = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (!localSub) {
      this.logger.warn(
        `No local subscription found for Stripe sub ${stripeSubscriptionId}`,
      );
      return;
    }

    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      past_due: SubscriptionStatus.PAST_DUE,
      canceled: SubscriptionStatus.CANCELLED,
      trialing: SubscriptionStatus.TRIALING,
    };

    const newStatus = statusMap[stripeSub.status] ?? localSub.status;

    await prisma.subscription.update({
      where: { id: localSub.id },
      data: {
        status: newStatus,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      },
    });

    this.logger.log(
      `Synced subscription ${stripeSubscriptionId} — status: ${newStatus}`,
    );
  }

  // ─── Private Helpers ────────────────────────────────────────────────

  private async getActiveSubscription(organizationId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for organization ${organizationId}`,
      );
    }

    return subscription;
  }

  private async handleSubscriptionDeleted(stripeSubscriptionId: string) {
    const localSub = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (!localSub) {
      this.logger.warn(
        `No local subscription found for deleted Stripe sub ${stripeSubscriptionId}`,
      );
      return;
    }

    await prisma.subscription.update({
      where: { id: localSub.id },
      data: { status: SubscriptionStatus.CANCELLED },
    });

    this.logger.log(
      `Marked subscription ${stripeSubscriptionId} as cancelled (deleted in Stripe)`,
    );
  }
}
