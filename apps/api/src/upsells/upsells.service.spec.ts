import { describe, it, expect, beforeEach, vi } from 'vitest';
import { evaluateRules, ReservationContext } from './rule-engine';
import { UpsellsService } from './upsells.service';
import { NotFoundException } from '@nestjs/common';

// =============================================================================
// Rule Engine unit tests
// =============================================================================

const baseCtx: ReservationContext = {
  dayOfWeek: 'FRIDAY',
  nightsCount: 3,
  roomType: 'DELUXE_KING',
  bookingSource: 'OTA',
  rateCode: 'BAR',
  leadTimeDays: 14,
  adultsCount: 2,
  childrenCount: 0,
};

describe('evaluateRules — rule engine', () => {
  it('returns true when rules array is empty (no restrictions)', () => {
    expect(evaluateRules([], baseCtx)).toBe(true);
  });

  it('EQUALS — matches when value is the same (case-insensitive)', () => {
    const rules = [
      { attribute: 'dayOfWeek', operator: 'EQUALS', value: 'friday', logicGroup: 0 },
    ];
    expect(evaluateRules(rules, baseCtx)).toBe(true);
  });

  it('EQUALS — fails when value differs', () => {
    const rules = [
      { attribute: 'dayOfWeek', operator: 'EQUALS', value: 'MONDAY', logicGroup: 0 },
    ];
    expect(evaluateRules(rules, baseCtx)).toBe(false);
  });

  it('NOT_EQUALS — matches when value differs', () => {
    const rules = [
      { attribute: 'bookingSource', operator: 'NOT_EQUALS', value: 'DIRECT', logicGroup: 0 },
    ];
    expect(evaluateRules(rules, baseCtx)).toBe(true);
  });

  it('GREATER_THAN — matches for numeric attribute above threshold', () => {
    const rules = [
      { attribute: 'nightsCount', operator: 'GREATER_THAN', value: '2', logicGroup: 0 },
    ];
    expect(evaluateRules(rules, baseCtx)).toBe(true);
  });

  it('GREATER_THAN — fails when value is not above threshold', () => {
    const rules = [
      { attribute: 'nightsCount', operator: 'GREATER_THAN', value: '5', logicGroup: 0 },
    ];
    expect(evaluateRules(rules, baseCtx)).toBe(false);
  });

  it('LESS_THAN — matches for numeric attribute below threshold', () => {
    const rules = [
      { attribute: 'childrenCount', operator: 'LESS_THAN', value: '1', logicGroup: 0 },
    ];
    expect(evaluateRules(rules, baseCtx)).toBe(true);
  });

  it('IN — matches when value is in comma-separated list', () => {
    const rules = [
      { attribute: 'dayOfWeek', operator: 'IN', value: 'FRIDAY,SATURDAY,SUNDAY', logicGroup: 0 },
    ];
    expect(evaluateRules(rules, baseCtx)).toBe(true);
  });

  it('NOT_IN — fails when value is in the exclusion list', () => {
    const rules = [
      { attribute: 'bookingSource', operator: 'NOT_IN', value: 'OTA,GDS', logicGroup: 0 },
    ];
    expect(evaluateRules(rules, baseCtx)).toBe(false);
  });

  it('AND within a logicGroup — all rules must pass', () => {
    const rules = [
      { attribute: 'dayOfWeek', operator: 'EQUALS', value: 'FRIDAY', logicGroup: 0 },
      { attribute: 'nightsCount', operator: 'GREATER_THAN', value: '2', logicGroup: 0 },
      { attribute: 'roomType', operator: 'EQUALS', value: 'DELUXE_KING', logicGroup: 0 },
    ];
    expect(evaluateRules(rules, baseCtx)).toBe(true);
  });

  it('AND within a logicGroup — fails when one rule fails', () => {
    const rules = [
      { attribute: 'dayOfWeek', operator: 'EQUALS', value: 'FRIDAY', logicGroup: 0 },
      // This rule fails
      { attribute: 'nightsCount', operator: 'GREATER_THAN', value: '10', logicGroup: 0 },
    ];
    expect(evaluateRules(rules, baseCtx)).toBe(false);
  });

  it('OR across logicGroups — passes if one group passes', () => {
    const rules = [
      // Group 0 fails
      { attribute: 'dayOfWeek', operator: 'EQUALS', value: 'MONDAY', logicGroup: 0 },
      // Group 1 passes
      { attribute: 'nightsCount', operator: 'GREATER_THAN', value: '2', logicGroup: 1 },
    ];
    expect(evaluateRules(rules, baseCtx)).toBe(true);
  });

  it('OR across logicGroups — fails when all groups fail', () => {
    const rules = [
      { attribute: 'dayOfWeek', operator: 'EQUALS', value: 'MONDAY', logicGroup: 0 },
      { attribute: 'nightsCount', operator: 'GREATER_THAN', value: '10', logicGroup: 1 },
    ];
    expect(evaluateRules(rules, baseCtx)).toBe(false);
  });

  it('Complex: weekend OR long stay — weekend matches', () => {
    const rules = [
      // Group 0: weekend check (FRIDAY qualifies)
      { attribute: 'dayOfWeek', operator: 'IN', value: 'FRIDAY,SATURDAY,SUNDAY', logicGroup: 0 },
      // Group 1: long stay (fails — only 3 nights)
      { attribute: 'nightsCount', operator: 'GREATER_THAN', value: '5', logicGroup: 1 },
    ];
    expect(evaluateRules(rules, baseCtx)).toBe(true);
  });
});

// =============================================================================
// UpsellsService unit tests (with mocked Prisma)
// =============================================================================

function buildMockPrisma() {
  return {
    upsellOffer: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    upsellRule: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    upsellSelection: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    upsellImpression: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    reservation: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  };
}

describe('UpsellsService', () => {
  let service: UpsellsService;
  let mockPrisma: ReturnType<typeof buildMockPrisma>;

  beforeEach(() => {
    mockPrisma = buildMockPrisma();
    service = new UpsellsService(mockPrisma as never);
  });

  it('createOffer — creates offer with rules', async () => {
    const expected = { id: 'offer-1', title: 'Breakfast', rules: [] };
    mockPrisma.upsellOffer.create.mockResolvedValue(expected);

    const result = await service.createOffer({
      propertyId: 'prop-1',
      category: 'BREAKFAST' as never,
      title: 'Breakfast',
      description: 'Daily breakfast',
      priceInCents: 2500,
    });

    expect(result).toEqual(expected);
    expect(mockPrisma.upsellOffer.create).toHaveBeenCalledOnce();
  });

  it('deleteOffer — soft-deletes by setting isActive=false', async () => {
    const offer = { id: 'offer-1', isActive: true, rules: [] };
    mockPrisma.upsellOffer.findUnique.mockResolvedValue(offer);
    mockPrisma.upsellOffer.update.mockResolvedValue({ ...offer, isActive: false });

    const result = await service.deleteOffer('offer-1');
    expect(result.isActive).toBe(false);
    expect(mockPrisma.upsellOffer.update).toHaveBeenCalledWith({
      where: { id: 'offer-1' },
      data: { isActive: false },
    });
  });

  it('deleteOffer — throws NotFoundException for unknown id', async () => {
    mockPrisma.upsellOffer.findUnique.mockResolvedValue(null);
    await expect(service.deleteOffer('unknown')).rejects.toThrow(NotFoundException);
  });

  it('selectOffer — creates selection and records impression', async () => {
    const offer = { id: 'offer-1', priceInCents: 1000, isActive: true };
    const reservation = { id: 'res-1', propertyId: 'prop-1' };
    const selection = {
      id: 'sel-1',
      reservationId: 'res-1',
      offerId: 'offer-1',
      quantity: 2,
      totalPriceInCents: 2000,
      offer,
    };

    mockPrisma.upsellOffer.findUnique.mockResolvedValue(offer);
    mockPrisma.reservation.findUnique.mockResolvedValue(reservation);
    mockPrisma.upsellSelection.create.mockResolvedValue(selection);
    mockPrisma.$transaction.mockResolvedValue([selection]);
    mockPrisma.upsellImpression.findFirst.mockResolvedValue(null);
    mockPrisma.upsellImpression.create.mockResolvedValue({ id: 'imp-1' });

    const result = await service.selectOffer({
      reservationId: 'res-1',
      offerId: 'offer-1',
      quantity: 2,
    });

    expect(result.totalPriceInCents).toBe(2000);
    expect(mockPrisma.upsellImpression.create).toHaveBeenCalledOnce();
  });

  it('removeSelection — cancels selection', async () => {
    const selection = { id: 'sel-1', status: 'PENDING' };
    mockPrisma.upsellSelection.findUnique.mockResolvedValue(selection);
    mockPrisma.upsellSelection.update.mockResolvedValue({ ...selection, status: 'CANCELLED' });

    const result = await service.removeSelection('sel-1');
    expect(result.status).toBe('CANCELLED');
  });

  it('recordImpression — is idempotent (returns existing)', async () => {
    const existing = { id: 'imp-1', offerId: 'offer-1', reservationId: 'res-1' };
    mockPrisma.upsellImpression.findFirst.mockResolvedValue(existing);

    const result = await service.recordImpression({ offerId: 'offer-1', reservationId: 'res-1' });
    expect(result).toEqual(existing);
    expect(mockPrisma.upsellImpression.create).not.toHaveBeenCalled();
  });

  it('getOffersForReservation — returns only eligible offers', async () => {
    const checkInDate = new Date('2026-04-04'); // SATURDAY
    const reservation = {
      id: 'res-1',
      propertyId: 'prop-1',
      checkInDate,
      nightsCount: 2,
      roomType: 'STANDARD',
      bookingSource: 'DIRECT',
      rateCode: 'AAA',
      adultsCount: 1,
      childrenCount: 0,
      createdAt: new Date('2026-04-01'),
    };

    const offers = [
      {
        id: 'offer-1',
        title: 'No rules — always shown',
        rules: [],
      },
      {
        id: 'offer-2',
        title: 'Weekend only',
        rules: [
          { attribute: 'dayOfWeek', operator: 'IN', value: 'SATURDAY,SUNDAY', logicGroup: 0 },
        ],
      },
      {
        id: 'offer-3',
        title: 'OTA only — should NOT match',
        rules: [
          { attribute: 'bookingSource', operator: 'EQUALS', value: 'OTA', logicGroup: 0 },
        ],
      },
    ];

    mockPrisma.reservation.findUnique.mockResolvedValue(reservation);
    mockPrisma.upsellOffer.findMany.mockResolvedValue(offers);

    const result = await service.getOffersForReservation('res-1');
    const ids = result.map((o: { id: string }) => o.id);

    expect(ids).toContain('offer-1');
    expect(ids).toContain('offer-2');
    expect(ids).not.toContain('offer-3');
  });

  it('getOfferAnalytics — computes conversion rate and revenue correctly', async () => {
    const offers = [
      {
        id: 'offer-1',
        title: 'Breakfast',
        category: 'BREAKFAST',
        priceInCents: 2500,
        currency: 'CAD',
        isActive: true,
        impressions: [{ id: 'i1' }, { id: 'i2' }, { id: 'i3' }, { id: 'i4' }],
        selections: [
          { id: 's1', totalPriceInCents: 5000, quantity: 2 },
          { id: 's2', totalPriceInCents: 2500, quantity: 1 },
        ],
      },
    ];

    mockPrisma.upsellOffer.findMany.mockResolvedValue(offers);

    const result = await service.getOfferAnalytics('prop-1', {
      startDate: '2026-01-01',
      endDate: '2026-03-31',
    });

    expect(result).toHaveLength(1);
    expect(result[0].impressionCount).toBe(4);
    expect(result[0].selectionCount).toBe(2);
    expect(result[0].revenueInCents).toBe(7500);
    expect(result[0].conversionRate).toBe(50); // 2/4 * 100
  });
});
