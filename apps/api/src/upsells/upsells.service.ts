import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { SelectOfferDto } from './dto/select-offer.dto';
import { RecordImpressionDto } from './dto/record-impression.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { evaluateRules, ReservationContext } from './rule-engine';

@Injectable()
export class UpsellsService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // Offer CRUD
  // =========================================================================

  async createOffer(data: CreateOfferDto) {
    const { rules, ...offerData } = data;

    const offer = await this.prisma.upsellOffer.create({
      data: {
        ...offerData,
        currency: offerData.currency ?? 'CAD',
        sortOrder: offerData.sortOrder ?? 0,
        ...(rules && rules.length > 0
          ? {
              rules: {
                create: rules,
              },
            }
          : {}),
      },
      include: { rules: true },
    });

    return offer;
  }

  async updateOffer(id: string, data: UpdateOfferDto) {
    await this.findOfferOrThrow(id);

    return this.prisma.upsellOffer.update({
      where: { id },
      data,
      include: { rules: true },
    });
  }

  /** Soft-delete: set isActive = false */
  async deleteOffer(id: string) {
    await this.findOfferOrThrow(id);

    return this.prisma.upsellOffer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getOffers(propertyId: string) {
    return this.prisma.upsellOffer.findMany({
      where: { propertyId, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { rules: true },
    });
  }

  async getOfferById(id: string) {
    return this.findOfferOrThrow(id);
  }

  // =========================================================================
  // Rule Engine — eligible offers for a reservation
  // =========================================================================

  async getOffersForReservation(reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationId} not found`);
    }

    const activeOffers = await this.prisma.upsellOffer.findMany({
      where: { propertyId: reservation.propertyId, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { rules: true },
    });

    const ctx = this.buildReservationContext(reservation);

    return activeOffers.filter((offer) =>
      evaluateRules(offer.rules, ctx),
    );
  }

  private buildReservationContext(reservation: {
    checkInDate: Date;
    nightsCount: number;
    roomType: string | null;
    bookingSource: string | null;
    rateCode: string | null;
    adultsCount: number;
    childrenCount: number;
    createdAt: Date;
  }): ReservationContext {
    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];

    const checkIn = new Date(reservation.checkInDate);
    const now = new Date(reservation.createdAt);
    const leadTimeDays = Math.max(
      0,
      Math.floor(
        (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    return {
      dayOfWeek: days[checkIn.getUTCDay()],
      nightsCount: reservation.nightsCount,
      roomType: reservation.roomType ?? '',
      bookingSource: reservation.bookingSource ?? '',
      rateCode: reservation.rateCode ?? '',
      leadTimeDays,
      adultsCount: reservation.adultsCount,
      childrenCount: reservation.childrenCount,
    };
  }

  // =========================================================================
  // Rule CRUD
  // =========================================================================

  async createRule(offerId: string, data: CreateRuleDto) {
    // Verify offer exists
    await this.findOfferOrThrow(offerId);

    return this.prisma.upsellRule.create({
      data: { ...data, offerId },
    });
  }

  async updateRule(id: string, data: UpdateRuleDto) {
    await this.findRuleOrThrow(id);

    return this.prisma.upsellRule.update({
      where: { id },
      data,
    });
  }

  async deleteRule(id: string) {
    await this.findRuleOrThrow(id);

    return this.prisma.upsellRule.delete({ where: { id } });
  }

  // =========================================================================
  // Guest Selection
  // =========================================================================

  async selectOffer(dto: SelectOfferDto) {
    const { reservationId, offerId, quantity } = dto;

    const offer = await this.prisma.upsellOffer.findUnique({
      where: { id: offerId },
    });
    if (!offer || !offer.isActive) {
      throw new NotFoundException(`Upsell offer ${offerId} not found or inactive`);
    }

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationId} not found`);
    }

    const totalPriceInCents = offer.priceInCents * quantity;

    const [selection] = await this.prisma.$transaction([
      this.prisma.upsellSelection.create({
        data: {
          reservationId,
          offerId,
          quantity,
          totalPriceInCents,
        },
        include: { offer: true },
      }),
    ]);

    // Record impression if none exists yet
    await this.recordImpression({ offerId, reservationId });

    return selection;
  }

  async removeSelection(selectionId: string) {
    const selection = await this.prisma.upsellSelection.findUnique({
      where: { id: selectionId },
    });
    if (!selection) {
      throw new NotFoundException(`Selection ${selectionId} not found`);
    }

    return this.prisma.upsellSelection.update({
      where: { id: selectionId },
      data: { status: 'CANCELLED' },
    });
  }

  async getSelections(reservationId: string) {
    return this.prisma.upsellSelection.findMany({
      where: { reservationId },
      include: { offer: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  // =========================================================================
  // Impressions
  // =========================================================================

  async recordImpression(dto: RecordImpressionDto) {
    const { offerId, reservationId } = dto;

    // Idempotent: only create one impression per offer+reservation
    const existing = await this.prisma.upsellImpression.findFirst({
      where: { offerId, reservationId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.upsellImpression.create({
      data: { offerId, reservationId },
    });
  }

  // =========================================================================
  // Analytics
  // =========================================================================

  async getOfferAnalytics(propertyId: string, query: AnalyticsQueryDto) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    // Make endDate inclusive (end of day)
    endDate.setUTCHours(23, 59, 59, 999);

    const offers = await this.prisma.upsellOffer.findMany({
      where: { propertyId },
      select: {
        id: true,
        title: true,
        category: true,
        priceInCents: true,
        currency: true,
        isActive: true,
        impressions: {
          where: {
            viewedAt: { gte: startDate, lte: endDate },
          },
          select: { id: true },
        },
        selections: {
          where: {
            createdAt: { gte: startDate, lte: endDate },
            status: { not: 'CANCELLED' },
          },
          select: { id: true, totalPriceInCents: true, quantity: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return offers.map((offer) => {
      const impressionCount = offer.impressions.length;
      const selectionCount = offer.selections.length;
      const revenue = offer.selections.reduce(
        (sum, s) => sum + s.totalPriceInCents,
        0,
      );
      const conversionRate =
        impressionCount > 0
          ? Math.round((selectionCount / impressionCount) * 10000) / 100
          : 0;

      return {
        offerId: offer.id,
        title: offer.title,
        category: offer.category,
        priceInCents: offer.priceInCents,
        currency: offer.currency,
        isActive: offer.isActive,
        impressionCount,
        selectionCount,
        revenueInCents: revenue,
        conversionRate,
      };
    });
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  private async findOfferOrThrow(id: string) {
    const offer = await this.prisma.upsellOffer.findUnique({
      where: { id },
      include: { rules: true },
    });
    if (!offer) {
      throw new NotFoundException(`Upsell offer ${id} not found`);
    }
    return offer;
  }

  private async findRuleOrThrow(id: string) {
    const rule = await this.prisma.upsellRule.findUnique({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Upsell rule ${id} not found`);
    }
    return rule;
  }
}
