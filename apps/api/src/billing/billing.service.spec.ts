import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillingService } from './billing.service';
import { BillingTier, SubscriptionStatus, UsageEventType } from '@hotelcheckin/database';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TIER_CONFIG } from './billing.constants';

// ─── Prisma Mock ──────────────────────────────────────────────────────────────

const mockPrisma = {
  organization: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  subscription: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  usageRecord: {
    create: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  },
};

vi.mock('@hotelcheckin/database', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hotelcheckin/database')>();
  return {
    ...actual,
    prisma: mockPrisma,
  };
});

// ─── Stripe Mock ──────────────────────────────────────────────────────────────

const mockStripe = {
  customers: {
    create: vi.fn(),
  },
  subscriptions: {
    create: vi.fn(),
    update: vi.fn(),
    retrieve: vi.fn(),
  },
  subscriptionItems: {
    createUsageRecord: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('BillingService', () => {
  let service: BillingService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BillingService(mockStripe as any);
  });

  // ─── createCustomer ─────────────────────────────────────────────

  describe('createCustomer', () => {
    it('should create a Stripe customer and update the organization', async () => {
      const orgId = 'org-1';
      mockPrisma.organization.findUnique.mockResolvedValue({
        id: orgId,
        stripeCustomerId: null,
      });
      mockStripe.customers.create.mockResolvedValue({ id: 'cus_123' });
      mockPrisma.organization.update.mockResolvedValue({
        id: orgId,
        stripeCustomerId: 'cus_123',
      });

      const result = await service.createCustomer(orgId, 'test@hotel.ca', 'Test Hotel');

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@hotel.ca',
        name: 'Test Hotel',
        metadata: { organizationId: orgId },
      });
      expect(mockPrisma.organization.update).toHaveBeenCalledWith({
        where: { id: orgId },
        data: { stripeCustomerId: 'cus_123' },
      });
      expect(result.stripeCustomerId).toBe('cus_123');
    });

    it('should throw NotFoundException if organization does not exist', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      await expect(
        service.createCustomer('non-existent', 'a@b.com', 'Name'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if organization already has a Stripe customer', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        stripeCustomerId: 'cus_existing',
      });

      await expect(
        service.createCustomer('org-1', 'a@b.com', 'Name'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── createSubscription ─────────────────────────────────────────

  describe('createSubscription', () => {
    it('should create a Stripe subscription and local subscription record', async () => {
      const orgId = 'org-1';
      const now = Math.floor(Date.now() / 1000);

      mockPrisma.organization.findUnique.mockResolvedValue({
        id: orgId,
        stripeCustomerId: 'cus_123',
        subscription: null,
      });

      mockStripe.subscriptions.create.mockResolvedValue({
        id: 'sub_123',
        current_period_start: now,
        current_period_end: now + 30 * 24 * 60 * 60,
      });

      const expectedSub = {
        id: 'sub-local-1',
        organizationId: orgId,
        stripeSubscriptionId: 'sub_123',
        tier: BillingTier.GROWTH,
        status: SubscriptionStatus.ACTIVE,
        annualCheckInAllowance: 2000,
      };
      mockPrisma.subscription.create.mockResolvedValue(expectedSub);
      mockPrisma.organization.update.mockResolvedValue({});

      const result = await service.createSubscription(orgId, BillingTier.GROWTH);

      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_123',
          metadata: { organizationId: orgId, tier: 'GROWTH' },
        }),
      );
      expect(mockPrisma.subscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tier: BillingTier.GROWTH,
            annualCheckInAllowance: 2000,
          }),
        }),
      );
      expect(result.tier).toBe(BillingTier.GROWTH);
    });

    it('should throw if organization has no Stripe customer', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        stripeCustomerId: null,
        subscription: null,
      });

      await expect(
        service.createSubscription('org-1', BillingTier.STARTER),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if organization already has a subscription', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        stripeCustomerId: 'cus_123',
        subscription: { id: 'existing-sub' },
      });

      await expect(
        service.createSubscription('org-1', BillingTier.STARTER),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── recordUsage ────────────────────────────────────────────────

  describe('recordUsage', () => {
    const subscription = {
      id: 'sub-1',
      organizationId: 'org-1',
      stripeSubscriptionId: 'sub_stripe_1',
      tier: BillingTier.STARTER,
      annualCheckInAllowance: 500,
      currentPeriodStart: new Date('2026-01-01'),
      currentPeriodEnd: new Date('2026-02-01'),
    };

    it('should create a usage record', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);
      mockPrisma.usageRecord.create.mockResolvedValue({ id: 'rec-1', count: 1 });
      mockPrisma.usageRecord.aggregate.mockResolvedValue({
        _sum: { count: 100 },
      });

      const result = await service.recordUsage(
        'org-1',
        'prop-1',
        UsageEventType.EMAIL_SENT,
      );

      expect(mockPrisma.usageRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: 'org-1',
          propertyId: 'prop-1',
          eventType: UsageEventType.EMAIL_SENT,
          count: 1,
        }),
      });
      expect(result.id).toBe('rec-1');
    });

    it('should detect overage when PRE_CHECK_COMPLETED exceeds allowance', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);
      mockPrisma.usageRecord.create.mockResolvedValue({ id: 'rec-2', count: 1 });
      mockPrisma.usageRecord.aggregate.mockResolvedValue({
        _sum: { count: 501 }, // exceeds STARTER's 500 allowance
      });
      mockStripe.subscriptionItems.createUsageRecord.mockResolvedValue({});

      await service.recordUsage(
        'org-1',
        'prop-1',
        UsageEventType.PRE_CHECK_COMPLETED,
      );

      // Should attempt to report overage to Stripe
      expect(mockStripe.subscriptionItems.createUsageRecord).toHaveBeenCalled();
    });

    it('should not trigger overage when usage is within allowance', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);
      mockPrisma.usageRecord.create.mockResolvedValue({ id: 'rec-3', count: 1 });
      mockPrisma.usageRecord.aggregate.mockResolvedValue({
        _sum: { count: 400 }, // within STARTER's 500 allowance
      });

      await service.recordUsage(
        'org-1',
        'prop-1',
        UsageEventType.PRE_CHECK_COMPLETED,
      );

      expect(mockStripe.subscriptionItems.createUsageRecord).not.toHaveBeenCalled();
    });

    it('should throw if no subscription exists', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      await expect(
        service.recordUsage('org-1', 'prop-1', UsageEventType.PRE_CHECK_COMPLETED),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── changeSubscriptionTier ─────────────────────────────────────

  describe('changeSubscriptionTier', () => {
    const subscription = {
      id: 'sub-1',
      organizationId: 'org-1',
      stripeSubscriptionId: 'sub_stripe_1',
      tier: BillingTier.STARTER,
      annualCheckInAllowance: 500,
    };

    it('should upgrade the subscription tier', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        items: { data: [{ id: 'si_123' }] },
      });
      mockStripe.subscriptions.update.mockResolvedValue({});
      mockPrisma.subscription.update.mockResolvedValue({
        ...subscription,
        tier: BillingTier.GROWTH,
        annualCheckInAllowance: 2000,
      });
      mockPrisma.organization.update.mockResolvedValue({});

      const result = await service.changeSubscriptionTier(
        'org-1',
        BillingTier.GROWTH,
      );

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_stripe_1',
        expect.objectContaining({
          proration_behavior: 'create_prorations',
        }),
      );
      expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tier: BillingTier.GROWTH,
            annualCheckInAllowance: 2000,
          }),
        }),
      );
      expect(result.tier).toBe(BillingTier.GROWTH);
    });

    it('should throw if already on the same tier', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);

      await expect(
        service.changeSubscriptionTier('org-1', BillingTier.STARTER),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if no subscription exists', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      await expect(
        service.changeSubscriptionTier('org-1', BillingTier.GROWTH),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getSubscription ────────────────────────────────────────────

  describe('getSubscription', () => {
    it('should return subscription with usage and tier config', async () => {
      const subscription = {
        id: 'sub-1',
        organizationId: 'org-1',
        tier: BillingTier.GROWTH,
        currentPeriodStart: new Date('2026-01-01'),
        currentPeriodEnd: new Date('2026-02-01'),
      };

      mockPrisma.subscription.findUnique.mockResolvedValue(subscription);
      mockPrisma.usageRecord.groupBy.mockResolvedValue([]);

      const result = await service.getSubscription('org-1');

      expect(result.tier).toBe(BillingTier.GROWTH);
      expect(result.tierConfig).toEqual(TIER_CONFIG.GROWTH);
    });

    it('should throw if no subscription exists', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      await expect(service.getSubscription('org-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── handleWebhook ──────────────────────────────────────────────

  describe('handleWebhook', () => {
    it('should sync subscription on invoice.paid', async () => {
      const event = {
        type: 'invoice.paid',
        data: {
          object: {
            id: 'inv_123',
            subscription: 'sub_stripe_1',
          },
        },
      };

      mockPrisma.subscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        stripeSubscriptionId: 'sub_stripe_1',
        status: SubscriptionStatus.ACTIVE,
      });
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
      });
      mockPrisma.subscription.update.mockResolvedValue({});

      await service.handleWebhook(event as any);

      expect(mockStripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_stripe_1');
      expect(mockPrisma.subscription.update).toHaveBeenCalled();
    });

    it('should mark subscription as cancelled on customer.subscription.deleted', async () => {
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: { id: 'sub_stripe_1' },
        },
      };

      mockPrisma.subscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        stripeSubscriptionId: 'sub_stripe_1',
      });
      mockPrisma.subscription.update.mockResolvedValue({});

      await service.handleWebhook(event as any);

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: SubscriptionStatus.CANCELLED },
        }),
      );
    });
  });

  // ─── getUsageSummary ────────────────────────────────────────────

  describe('getUsageSummary', () => {
    it('should aggregate usage by event type and property', async () => {
      mockPrisma.usageRecord.groupBy
        .mockResolvedValueOnce([
          { eventType: UsageEventType.PRE_CHECK_COMPLETED, _sum: { count: 150 } },
          { eventType: UsageEventType.EMAIL_SENT, _sum: { count: 300 } },
        ])
        .mockResolvedValueOnce([
          {
            propertyId: 'prop-1',
            eventType: UsageEventType.PRE_CHECK_COMPLETED,
            _sum: { count: 100 },
          },
          {
            propertyId: 'prop-2',
            eventType: UsageEventType.PRE_CHECK_COMPLETED,
            _sum: { count: 50 },
          },
        ]);

      const result = await service.getUsageSummary(
        'org-1',
        new Date('2026-01-01'),
        new Date('2026-02-01'),
      );

      expect(result.byEventType).toHaveLength(2);
      expect(result.byProperty).toHaveLength(2);
      expect(result.byEventType[0].total).toBe(150);
    });
  });
});
