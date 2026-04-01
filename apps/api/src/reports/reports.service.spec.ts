import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { INDUSTRY_BENCHMARKS } from './benchmarks';

// ---------------------------------------------------------------------------
// Minimal PrismaService mock
// ---------------------------------------------------------------------------

const makePrismaMock = () => ({
  $transaction: vi.fn(async (queries: Promise<unknown>[]) =>
    Promise.all(queries),
  ),
  reservation: {
    count: vi.fn().mockResolvedValue(0),
    findMany: vi.fn().mockResolvedValue([]),
  },
  preCheckSubmission: {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
  upsellSelection: {
    findMany: vi.fn().mockResolvedValue([]),
  },
  upsellImpression: {
    count: vi.fn().mockResolvedValue(0),
  },
  upsellOffer: {
    findMany: vi.fn().mockResolvedValue([]),
  },
  communicationLog: {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
  pmsSyncLog: {
    findMany: vi.fn().mockResolvedValue([]),
  },
  payment: {
    findMany: vi.fn().mockResolvedValue([]),
  },
  auditLog: {
    count: vi.fn().mockResolvedValue(0),
    findMany: vi.fn().mockResolvedValue([]),
  },
  property: {
    findMany: vi.fn().mockResolvedValue([]),
  },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ReportsService', () => {
  let service: ReportsService;
  let prismaMock: ReturnType<typeof makePrismaMock>;

  beforeEach(async () => {
    prismaMock = makePrismaMock();

    // $transaction needs to run the array of promises
    prismaMock.$transaction.mockImplementation(
      async (queries: unknown[]) => Promise.all(queries as Promise<unknown>[]),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  // -------------------------------------------------------------------------
  // 1. getBenchmarks
  // -------------------------------------------------------------------------

  describe('getBenchmarks', () => {
    it('should return the static INDUSTRY_BENCHMARKS object', () => {
      const result = service.getBenchmarks();
      expect(result.benchmarks).toEqual(INDUSTRY_BENCHMARKS);
    });

    it('should include all eight benchmark keys', () => {
      const { benchmarks } = service.getBenchmarks();
      const expectedKeys = [
        'preCheckCompletionRate',
        'checkInTimeReduction',
        'roomUpgradeConversion',
        'earlyCheckinConversion',
        'breakfastConversion',
        'emailOpenRate',
        'pmsSyncHealth',
        'paymentSuccessRate',
      ];
      for (const key of expectedKeys) {
        expect(benchmarks).toHaveProperty(key);
      }
    });

    it('each benchmark entry should have low, median, high and unit fields', () => {
      const { benchmarks } = service.getBenchmarks();
      for (const entry of Object.values(benchmarks)) {
        expect(entry).toHaveProperty('low');
        expect(entry).toHaveProperty('median');
        expect(entry).toHaveProperty('high');
        expect(entry).toHaveProperty('unit');
        expect(entry.median).toBeGreaterThanOrEqual(entry.low);
        expect(entry.high).toBeGreaterThanOrEqual(entry.median);
      }
    });
  });

  // -------------------------------------------------------------------------
  // 2. getPropertyDashboard — zero-data smoke test
  // -------------------------------------------------------------------------

  describe('getPropertyDashboard', () => {
    it('should return a valid dashboard shape when there are no records', async () => {
      const result = await service.getPropertyDashboard('prop-uuid', {
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      });

      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('reservations');
      expect(result).toHaveProperty('upsells');
      expect(result).toHaveProperty('communications');
      expect(result).toHaveProperty('pmsSync');
      expect(result).toHaveProperty('payments');
    });

    it('should compute preCheckCompletionRate as 0 when there are no reservations', async () => {
      const result = await service.getPropertyDashboard('prop-uuid', {});
      expect(result.reservations.preCheckCompletionRate).toBe(0);
      expect(result.reservations.total).toBe(0);
    });

    it('should compute payment successRate correctly from mock data', async () => {
      prismaMock.payment.findMany.mockResolvedValue([
        { status: 'AUTHORIZED', amountInCents: 10000 },
        { status: 'AUTHORIZED', amountInCents: 5000 },
        { status: 'FAILED', amountInCents: 2000 },
        { status: 'FAILED', amountInCents: 2000 },
      ]);

      const result = await service.getPropertyDashboard('prop-uuid', {});
      // 2 successful out of 4 = 50%
      expect(result.payments.successRate).toBe(50);
      expect(result.payments.total).toBe(4);
      expect(result.payments.successful).toBe(2);
    });

    it('should sum upsell revenue from selections', async () => {
      prismaMock.upsellSelection.findMany.mockResolvedValue([
        { totalPriceInCents: 5000, offerId: 'o1', offer: { title: 'Breakfast', category: 'BREAKFAST' } },
        { totalPriceInCents: 10000, offerId: 'o2', offer: { title: 'Upgrade', category: 'ROOM_UPGRADE' } },
      ]);
      prismaMock.upsellImpression.count.mockResolvedValue(20);

      const result = await service.getPropertyDashboard('prop-uuid', {});
      expect(result.upsells.revenueCents).toBe(15000);
      expect(result.upsells.revenueDollars).toBe(150);
      expect(result.upsells.totalSelections).toBe(2);
      expect(result.upsells.conversionRate).toBe(10); // 2/20 = 10%
    });
  });

  // -------------------------------------------------------------------------
  // 3. getPreCheckFunnel
  // -------------------------------------------------------------------------

  describe('getPreCheckFunnel', () => {
    it('should return all 8 funnel steps', async () => {
      const result = await service.getPreCheckFunnel('prop-uuid', {});
      expect(result.steps).toHaveLength(8);
    });

    it('should report overallCompletionRate as 0 when no reservations', async () => {
      const result = await service.getPreCheckFunnel('prop-uuid', {});
      expect(result.overallCompletionRate).toBe(0);
      expect(result.totalReservations).toBe(0);
    });

    it('should label the first step as invitesSent and the last as completed', async () => {
      const result = await service.getPreCheckFunnel('prop-uuid', {});
      expect(result.steps[0].name).toBe('invitesSent');
      expect(result.steps[7].name).toBe('completed');
    });
  });

  // -------------------------------------------------------------------------
  // 4. getPmsSyncReport
  // -------------------------------------------------------------------------

  describe('getPmsSyncReport', () => {
    it('should return zero healthRate when there are no syncs', async () => {
      const result = await service.getPmsSyncReport('prop-uuid', {});
      expect(result.summary.healthRate).toBe(0);
      expect(result.summary.totalAttempts).toBe(0);
    });

    it('should compute healthRate correctly from mock sync logs', async () => {
      const mockLogs = [
        { status: 'SUCCESS', direction: 'INBOUND', entityType: 'Reservation', errorMessage: null, syncedAt: new Date('2026-03-01T10:00:00Z') },
        { status: 'SUCCESS', direction: 'INBOUND', entityType: 'Reservation', errorMessage: null, syncedAt: new Date('2026-03-01T11:00:00Z') },
        { status: 'FAILED',  direction: 'INBOUND', entityType: 'Reservation', errorMessage: 'timeout', syncedAt: new Date('2026-03-01T12:00:00Z') },
      ];
      prismaMock.pmsSyncLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getPmsSyncReport('prop-uuid', {
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      });

      expect(result.summary.totalAttempts).toBe(3);
      expect(result.summary.totalSuccesses).toBe(2);
      expect(result.summary.totalFailures).toBe(1);
      expect(result.summary.healthRate).toBeCloseTo(66.67, 1);
    });

    it('should include recent errors in the report', async () => {
      const mockLogs = [
        { status: 'FAILED', direction: 'INBOUND', entityType: 'Reservation', errorMessage: 'connection refused', syncedAt: new Date('2026-03-15T09:00:00Z') },
      ];
      prismaMock.pmsSyncLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getPmsSyncReport('prop-uuid', {});
      expect(result.recentErrors).toHaveLength(1);
      expect(result.recentErrors[0].errorMessage).toBe('connection refused');
    });
  });

  // -------------------------------------------------------------------------
  // 5. getAuditReport
  // -------------------------------------------------------------------------

  describe('getAuditReport', () => {
    it('should return period and entries structure', async () => {
      const result = await service.getAuditReport('org-uuid', {
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      });

      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('entries');
      expect(Array.isArray(result.entries)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 6. getUpsellReport
  // -------------------------------------------------------------------------

  describe('getUpsellReport', () => {
    it('should return totals structure with zero values when no offers exist', async () => {
      const result = await service.getUpsellReport('prop-uuid', {});
      expect(result).toHaveProperty('offers');
      expect(result).toHaveProperty('byCategory');
      expect(result).toHaveProperty('totals');
      expect(result.totals.totalRevenueDollars).toBe(0);
      expect(result.totals.overallConversionRate).toBe(0);
    });

    it('should compute per-offer conversion rate', async () => {
      prismaMock.upsellOffer.findMany.mockResolvedValue([
        {
          id: 'offer-1',
          title: 'Breakfast',
          category: 'BREAKFAST',
          priceInCents: 2500,
          selections: [
            { totalPriceInCents: 2500, quantity: 1 },
            { totalPriceInCents: 2500, quantity: 1 },
          ],
          impressions: [{ id: 'i1' }, { id: 'i2' }, { id: 'i3' }, { id: 'i4' }],
        },
      ]);

      const result = await service.getUpsellReport('prop-uuid', {});
      expect(result.offers[0].conversionRate).toBe(50); // 2/4 = 50%
      expect(result.offers[0].revenueCents).toBe(5000);
    });
  });
});
