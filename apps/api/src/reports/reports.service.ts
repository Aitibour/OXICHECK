import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { INDUSTRY_BENCHMARKS } from './benchmarks';

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

/** Resolve a DateRange into concrete Date boundaries. Defaults to last 30 days. */
function resolveDateRange(range: DateRange): { from: Date; to: Date } {
  const to = range.endDate ? new Date(range.endDate) : new Date();
  to.setHours(23, 59, 59, 999);

  const from = range.startDate
    ? new Date(range.startDate)
    : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  from.setHours(0, 0, 0, 0);

  return { from, to };
}

/** Safe percentage – returns 0 when denominator is zero. */
function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Property Dashboard
  // ---------------------------------------------------------------------------

  /**
   * Aggregate all KPIs for a single property over a date range.
   */
  async getPropertyDashboard(propertyId: string, dateRange: DateRange) {
    const { from, to } = resolveDateRange(dateRange);

    const reservationWhere = {
      propertyId,
      checkInDate: { gte: from, lte: to },
    };

    // --- Reservations ---
    const [
      totalReservations,
      preCheckCompleted,
      preCheckPartial,
    ] = await this.prisma.$transaction([
      this.prisma.reservation.count({ where: reservationWhere }),
      this.prisma.reservation.count({
        where: { ...reservationWhere, preCheckStatus: 'COMPLETED' },
      }),
      this.prisma.reservation.count({
        where: { ...reservationWhere, preCheckStatus: 'PARTIAL' },
      }),
    ]);

    // Average completion time: from reservation.createdAt to preCheckSubmission.completedAt
    const completedSubmissions = await this.prisma.preCheckSubmission.findMany({
      where: {
        completedAt: { not: null },
        reservation: reservationWhere,
      },
      select: {
        completedAt: true,
        reservation: { select: { createdAt: true } },
      },
    });

    const avgCompletionTimeMs =
      completedSubmissions.length === 0
        ? null
        : completedSubmissions.reduce((acc, s) => {
            return (
              acc +
              (s.completedAt!.getTime() - s.reservation.createdAt.getTime())
            );
          }, 0) / completedSubmissions.length;

    const avgCompletionTimeMinutes =
      avgCompletionTimeMs !== null
        ? Math.round(avgCompletionTimeMs / 60000)
        : null;

    // --- Upsells ---
    const upsellSelections = await this.prisma.upsellSelection.findMany({
      where: {
        reservation: reservationWhere,
        status: { not: 'CANCELLED' },
      },
      select: {
        totalPriceInCents: true,
        offerId: true,
        offer: { select: { title: true, category: true } },
      },
    });

    const totalImpressions = await this.prisma.upsellImpression.count({
      where: { reservation: reservationWhere },
    });

    const upsellRevenueCents = upsellSelections.reduce(
      (acc, s) => acc + s.totalPriceInCents,
      0,
    );

    // Top offers by revenue
    const offerRevenueMap: Record<
      string,
      { offerId: string; title: string; category: string; revenueCents: number; count: number }
    > = {};
    for (const sel of upsellSelections) {
      let entry = offerRevenueMap[sel.offerId];
      if (!entry) {
        entry = {
          offerId: sel.offerId,
          title: sel.offer.title,
          category: sel.offer.category,
          revenueCents: 0,
          count: 0,
        };
        offerRevenueMap[sel.offerId] = entry;
      }
      entry.revenueCents += sel.totalPriceInCents;
      entry.count += 1;
    }
    const topUpsellOffers = Object.values(offerRevenueMap)
      .sort((a, b) => b.revenueCents - a.revenueCents)
      .slice(0, 5);

    // --- Communications ---
    const commLogs = await this.prisma.communicationLog.findMany({
      where: {
        reservation: reservationWhere,
        channel: 'EMAIL',
      },
      select: { status: true },
    });

    const emailSent = commLogs.length;
    const emailDelivered = commLogs.filter((l) =>
      ['DELIVERED', 'OPENED', 'CLICKED'].includes(l.status),
    ).length;
    const emailOpened = commLogs.filter((l) =>
      ['OPENED', 'CLICKED'].includes(l.status),
    ).length;
    const emailClicked = commLogs.filter((l) => l.status === 'CLICKED').length;

    // --- PMS Sync ---
    const pmsSyncs = await this.prisma.pmsSyncLog.findMany({
      where: {
        propertyId,
        syncedAt: { gte: from, lte: to },
      },
      select: { status: true },
    });

    const pmsTotalSyncs = pmsSyncs.length;
    const pmsSuccessful = pmsSyncs.filter((s) => s.status === 'SUCCESS').length;
    const pmsFailed = pmsSyncs.filter((s) => s.status === 'FAILED').length;

    // --- Payments ---
    const payments = await this.prisma.payment.findMany({
      where: {
        propertyId,
        createdAt: { gte: from, lte: to },
      },
      select: { status: true, amountInCents: true },
    });

    const paymentsTotal = payments.length;
    const paymentsSuccessful = payments.filter((p) =>
      ['AUTHORIZED', 'CAPTURED'].includes(p.status),
    ).length;
    const totalPaymentRevenueCents = payments
      .filter((p) => p.status === 'CAPTURED')
      .reduce((acc, p) => acc + p.amountInCents, 0);

    return {
      period: { from: from.toISOString(), to: to.toISOString() },
      reservations: {
        total: totalReservations,
        preCheckCompletionRate: pct(preCheckCompleted, totalReservations),
        preCheckPartialRate: pct(preCheckPartial, totalReservations),
        preCheckCompleted,
        preCheckPartial,
        avgCompletionTimeMinutes,
      },
      upsells: {
        revenueCents: upsellRevenueCents,
        revenueDollars: upsellRevenueCents / 100,
        totalSelections: upsellSelections.length,
        totalImpressions,
        conversionRate: pct(upsellSelections.length, totalImpressions),
        topOffers: topUpsellOffers,
      },
      communications: {
        emailSent,
        emailDelivered,
        emailOpened,
        emailClicked,
        deliveryRate: pct(emailDelivered, emailSent),
        openRate: pct(emailOpened, emailSent),
        clickRate: pct(emailClicked, emailSent),
      },
      pmsSync: {
        totalSyncs: pmsTotalSyncs,
        successful: pmsSuccessful,
        failed: pmsFailed,
        healthRate: pct(pmsSuccessful, pmsTotalSyncs),
      },
      payments: {
        total: paymentsTotal,
        successful: paymentsSuccessful,
        successRate: pct(paymentsSuccessful, paymentsTotal),
        totalRevenueCents: totalPaymentRevenueCents,
        totalRevenueDollars: totalPaymentRevenueCents / 100,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Portfolio Dashboard
  // ---------------------------------------------------------------------------

  /**
   * Aggregate KPIs across all properties belonging to an organization.
   * Includes a per-property breakdown.
   */
  async getPortfolioDashboard(organizationId: string, dateRange: DateRange) {
    const { from, to } = resolveDateRange(dateRange);

    const properties = await this.prisma.property.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true },
    });

    const perProperty = await Promise.all(
      properties.map(async (p) => {
        const kpis = await this.getPropertyDashboard(p.id, dateRange);
        return { propertyId: p.id, propertyName: p.name, ...kpis };
      }),
    );

    // Roll up totals
    const totals = perProperty.reduce(
      (acc, p) => {
        acc.totalReservations += p.reservations.total;
        acc.preCheckCompleted += p.reservations.preCheckCompleted;
        acc.preCheckPartial += p.reservations.preCheckPartial;
        acc.upsellRevenueCents += p.upsells.revenueCents;
        acc.totalUpsellSelections += p.upsells.totalSelections;
        acc.totalUpsellImpressions += p.upsells.totalImpressions;
        acc.emailSent += p.communications.emailSent;
        acc.emailOpened += p.communications.emailOpened;
        acc.emailClicked += p.communications.emailClicked;
        acc.pmsTotalSyncs += p.pmsSync.totalSyncs;
        acc.pmsSuccessful += p.pmsSync.successful;
        acc.paymentsTotal += p.payments.total;
        acc.paymentsSuccessful += p.payments.successful;
        acc.totalPaymentRevenueCents += p.payments.totalRevenueCents;
        return acc;
      },
      {
        totalReservations: 0,
        preCheckCompleted: 0,
        preCheckPartial: 0,
        upsellRevenueCents: 0,
        totalUpsellSelections: 0,
        totalUpsellImpressions: 0,
        emailSent: 0,
        emailOpened: 0,
        emailClicked: 0,
        pmsTotalSyncs: 0,
        pmsSuccessful: 0,
        paymentsTotal: 0,
        paymentsSuccessful: 0,
        totalPaymentRevenueCents: 0,
      },
    );

    return {
      period: { from: from.toISOString(), to: to.toISOString() },
      organizationId,
      propertyCount: properties.length,
      portfolio: {
        reservations: {
          total: totals.totalReservations,
          preCheckCompletionRate: pct(
            totals.preCheckCompleted,
            totals.totalReservations,
          ),
          preCheckPartialRate: pct(
            totals.preCheckPartial,
            totals.totalReservations,
          ),
        },
        upsells: {
          revenueCents: totals.upsellRevenueCents,
          revenueDollars: totals.upsellRevenueCents / 100,
          conversionRate: pct(
            totals.totalUpsellSelections,
            totals.totalUpsellImpressions,
          ),
        },
        communications: {
          emailSent: totals.emailSent,
          openRate: pct(totals.emailOpened, totals.emailSent),
          clickRate: pct(totals.emailClicked, totals.emailSent),
        },
        pmsSync: {
          healthRate: pct(totals.pmsSuccessful, totals.pmsTotalSyncs),
        },
        payments: {
          successRate: pct(totals.paymentsSuccessful, totals.paymentsTotal),
          totalRevenueDollars: totals.totalPaymentRevenueCents / 100,
        },
      },
      properties: perProperty,
    };
  }

  // ---------------------------------------------------------------------------
  // Pre-Check Funnel
  // ---------------------------------------------------------------------------

  /**
   * Step-by-step funnel from invite sent through completed pre-check.
   */
  async getPreCheckFunnel(propertyId: string, dateRange: DateRange) {
    const { from, to } = resolveDateRange(dateRange);

    const reservationWhere = {
      propertyId,
      checkInDate: { gte: from, lte: to },
    };

    const totalReservations = await this.prisma.reservation.count({
      where: reservationWhere,
    });

    // Invites sent = communication logs of type PRE_CHECK_INVITE
    const invitesSent = await this.prisma.communicationLog.count({
      where: {
        reservation: reservationWhere,
        template: { type: 'PRE_CHECK_INVITE' },
      },
    });

    const invitesOpened = await this.prisma.communicationLog.count({
      where: {
        reservation: reservationWhere,
        template: { type: 'PRE_CHECK_INVITE' },
        status: { in: ['OPENED', 'CLICKED'] },
      },
    });

    // Started = submission exists (any step touched)
    const started = await this.prisma.preCheckSubmission.count({
      where: { reservation: reservationWhere },
    });

    const profileComplete = await this.prisma.preCheckSubmission.count({
      where: {
        reservation: reservationWhere,
        guestProfileCompleted: true,
      },
    });

    const stayConfirmed = await this.prisma.preCheckSubmission.count({
      where: {
        reservation: reservationWhere,
        stayDetailsConfirmed: true,
      },
    });

    const policiesAccepted = await this.prisma.preCheckSubmission.count({
      where: {
        reservation: reservationWhere,
        policiesAccepted: true,
      },
    });

    const upsellsViewed = await this.prisma.upsellImpression.count({
      where: { reservation: reservationWhere },
    });

    const completed = await this.prisma.preCheckSubmission.count({
      where: {
        reservation: reservationWhere,
        completedAt: { not: null },
      },
    });

    const steps = [
      {
        step: 1,
        name: 'invitesSent',
        label: 'Invites Sent',
        count: invitesSent,
        dropOffPct: pct(totalReservations - invitesSent, totalReservations),
      },
      {
        step: 2,
        name: 'invitesOpened',
        label: 'Invites Opened',
        count: invitesOpened,
        dropOffPct: pct(invitesSent - invitesOpened, invitesSent),
      },
      {
        step: 3,
        name: 'started',
        label: 'Pre-Check Started',
        count: started,
        dropOffPct: pct(invitesOpened - started, invitesOpened),
      },
      {
        step: 4,
        name: 'profileComplete',
        label: 'Profile Complete',
        count: profileComplete,
        dropOffPct: pct(started - profileComplete, started),
      },
      {
        step: 5,
        name: 'stayConfirmed',
        label: 'Stay Confirmed',
        count: stayConfirmed,
        dropOffPct: pct(profileComplete - stayConfirmed, profileComplete),
      },
      {
        step: 6,
        name: 'policiesAccepted',
        label: 'Policies Accepted',
        count: policiesAccepted,
        dropOffPct: pct(stayConfirmed - policiesAccepted, stayConfirmed),
      },
      {
        step: 7,
        name: 'upsellsViewed',
        label: 'Upsells Viewed',
        count: upsellsViewed,
        dropOffPct: pct(policiesAccepted - upsellsViewed, policiesAccepted),
      },
      {
        step: 8,
        name: 'completed',
        label: 'Completed',
        count: completed,
        dropOffPct: pct(upsellsViewed - completed, upsellsViewed),
      },
    ];

    return {
      period: { from: from.toISOString(), to: to.toISOString() },
      totalReservations,
      overallCompletionRate: pct(completed, totalReservations),
      steps,
    };
  }

  // ---------------------------------------------------------------------------
  // Upsell Report
  // ---------------------------------------------------------------------------

  /**
   * Per-offer breakdown: impressions, selections, conversion rate, revenue.
   * Grouped by category.
   */
  async getUpsellReport(propertyId: string, dateRange: DateRange) {
    const { from, to } = resolveDateRange(dateRange);

    const reservationWhere = {
      propertyId,
      checkInDate: { gte: from, lte: to },
    };

    const offers = await this.prisma.upsellOffer.findMany({
      where: { propertyId },
      select: {
        id: true,
        title: true,
        category: true,
        priceInCents: true,
        selections: {
          where: {
            reservation: reservationWhere,
            status: { not: 'CANCELLED' },
          },
          select: { totalPriceInCents: true, quantity: true },
        },
        impressions: {
          where: { reservation: reservationWhere },
          select: { id: true },
        },
      },
    });

    const offerRows = offers.map((offer) => {
      const impressionCount = offer.impressions.length;
      const selectionCount = offer.selections.length;
      const revenueCents = offer.selections.reduce(
        (acc, s) => acc + s.totalPriceInCents,
        0,
      );
      return {
        offerId: offer.id,
        title: offer.title,
        category: offer.category,
        priceInCents: offer.priceInCents,
        impressions: impressionCount,
        selections: selectionCount,
        conversionRate: pct(selectionCount, impressionCount),
        revenueCents,
        revenueDollars: revenueCents / 100,
      };
    });

    // Group by category
    const byCategory: Record<
      string,
      {
        category: string;
        offers: typeof offerRows;
        totalRevenueCents: number;
        totalSelections: number;
        totalImpressions: number;
        categoryConversionRate: number;
      }
    > = {};

    for (const row of offerRows) {
      let cat = byCategory[row.category];
      if (!cat) {
        cat = {
          category: row.category,
          offers: [],
          totalRevenueCents: 0,
          totalSelections: 0,
          totalImpressions: 0,
          categoryConversionRate: 0,
        };
        byCategory[row.category] = cat;
      }
      cat.offers.push(row);
      cat.totalRevenueCents += row.revenueCents;
      cat.totalSelections += row.selections;
      cat.totalImpressions += row.impressions;
    }

    for (const cat of Object.values(byCategory)) {
      cat.categoryConversionRate = pct(
        cat.totalSelections,
        cat.totalImpressions,
      );
    }

    return {
      period: { from: from.toISOString(), to: to.toISOString() },
      offers: offerRows,
      byCategory: Object.values(byCategory),
      totals: {
        totalRevenueCents: offerRows.reduce((a, o) => a + o.revenueCents, 0),
        totalRevenueDollars:
          offerRows.reduce((a, o) => a + o.revenueCents, 0) / 100,
        totalSelections: offerRows.reduce((a, o) => a + o.selections, 0),
        totalImpressions: offerRows.reduce((a, o) => a + o.impressions, 0),
        overallConversionRate: pct(
          offerRows.reduce((a, o) => a + o.selections, 0),
          offerRows.reduce((a, o) => a + o.impressions, 0),
        ),
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Communication Report
  // ---------------------------------------------------------------------------

  /**
   * Per-template breakdown by channel (email / SMS).
   */
  async getCommunicationReport(propertyId: string, dateRange: DateRange) {
    const { from, to } = resolveDateRange(dateRange);

    const reservationWhere = {
      propertyId,
      checkInDate: { gte: from, lte: to },
    };

    const logs = await this.prisma.communicationLog.findMany({
      where: {
        reservation: reservationWhere,
      },
      select: {
        channel: true,
        status: true,
        templateId: true,
        template: { select: { type: true } },
        sentAt: true,
      },
    });

    // Group by channel × templateType
    type ChannelKey = string;
    const groups: Record<
      ChannelKey,
      {
        channel: string;
        templateType: string | null;
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        bounced: number;
        failed: number;
      }
    > = {};

    for (const log of logs) {
      const key = `${log.channel}::${log.template?.type ?? 'UNKNOWN'}`;
      let g = groups[key];
      if (!g) {
        g = {
          channel: log.channel,
          templateType: log.template?.type ?? null,
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          failed: 0,
        };
        groups[key] = g;
      }
      g.sent += 1;
      if (['DELIVERED', 'OPENED', 'CLICKED'].includes(log.status))
        g.delivered += 1;
      if (['OPENED', 'CLICKED'].includes(log.status)) g.opened += 1;
      if (log.status === 'CLICKED') g.clicked += 1;
      if (log.status === 'BOUNCED') g.bounced += 1;
      if (log.status === 'FAILED') g.failed += 1;
    }

    const rows = Object.values(groups).map((g) => ({
      ...g,
      deliveryRate: pct(g.delivered, g.sent),
      openRate: pct(g.opened, g.sent),
      clickRate: pct(g.clicked, g.sent),
      bounceRate: pct(g.bounced, g.sent),
    }));

    // Aggregate by channel
    const byChannel = ['EMAIL', 'SMS'].map((channel) => {
      const channelRows = rows.filter((r) => r.channel === channel);
      const totals = channelRows.reduce(
        (acc, r) => ({
          sent: acc.sent + r.sent,
          delivered: acc.delivered + r.delivered,
          opened: acc.opened + r.opened,
          clicked: acc.clicked + r.clicked,
          bounced: acc.bounced + r.bounced,
          failed: acc.failed + r.failed,
        }),
        { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, failed: 0 },
      );
      return {
        channel,
        ...totals,
        deliveryRate: pct(totals.delivered, totals.sent),
        openRate: pct(totals.opened, totals.sent),
        clickRate: pct(totals.clicked, totals.sent),
        bounceRate: pct(totals.bounced, totals.sent),
        templates: channelRows,
      };
    });

    return {
      period: { from: from.toISOString(), to: to.toISOString() },
      byChannel,
      all: rows,
    };
  }

  // ---------------------------------------------------------------------------
  // PMS Sync Report
  // ---------------------------------------------------------------------------

  /**
   * Daily breakdown of PMS sync attempts: success / failure / partial.
   */
  async getPmsSyncReport(propertyId: string, dateRange: DateRange) {
    const { from, to } = resolveDateRange(dateRange);

    const syncLogs = await this.prisma.pmsSyncLog.findMany({
      where: {
        propertyId,
        syncedAt: { gte: from, lte: to },
      },
      select: {
        status: true,
        direction: true,
        entityType: true,
        errorMessage: true,
        syncedAt: true,
      },
      orderBy: { syncedAt: 'asc' },
    });

    // Daily aggregation
    const dailyMap: Record<
      string,
      { date: string; attempts: number; successes: number; failures: number; partial: number }
    > = {};

    for (const log of syncLogs) {
      const day = log.syncedAt.toISOString().split('T')[0]!;
      let entry = dailyMap[day];
      if (!entry) {
        entry = { date: day, attempts: 0, successes: 0, failures: 0, partial: 0 };
        dailyMap[day] = entry;
      }
      entry.attempts += 1;
      if (log.status === 'SUCCESS') entry.successes += 1;
      if (log.status === 'FAILED') entry.failures += 1;
      if (log.status === 'PARTIAL') entry.partial += 1;
    }

    const dailyBreakdown = Object.values(dailyMap);

    const totalAttempts = syncLogs.length;
    const totalSuccesses = syncLogs.filter((l) => l.status === 'SUCCESS').length;
    const totalFailures = syncLogs.filter((l) => l.status === 'FAILED').length;
    const totalPartial = syncLogs.filter((l) => l.status === 'PARTIAL').length;

    const recentErrors = syncLogs
      .filter((l) => l.status === 'FAILED' && l.errorMessage)
      .slice(-10)
      .map((l) => ({
        syncedAt: l.syncedAt.toISOString(),
        entityType: l.entityType,
        direction: l.direction,
        errorMessage: l.errorMessage,
      }));

    return {
      period: { from: from.toISOString(), to: to.toISOString() },
      summary: {
        totalAttempts,
        totalSuccesses,
        totalFailures,
        totalPartial,
        healthRate: pct(totalSuccesses, totalAttempts),
        errorRate: pct(totalFailures, totalAttempts),
      },
      dailyBreakdown,
      recentErrors,
    };
  }

  // ---------------------------------------------------------------------------
  // Audit Report
  // ---------------------------------------------------------------------------

  /**
   * Paginated audit log entries for an organization, filterable by action/resource.
   */
  async getAuditReport(
    organizationId: string,
    dateRange: DateRange,
    filters?: { action?: string; userId?: string; resource?: string },
  ) {
    const { from, to } = resolveDateRange(dateRange);

    const where: Record<string, unknown> = {
      organizationId,
      createdAt: { gte: from, lte: to },
    };

    if (filters?.action) where.action = { contains: filters.action, mode: 'insensitive' };
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.resource) where.resource = { contains: filters.resource, mode: 'insensitive' };

    const [total, entries] = await this.prisma.$transaction([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          action: true,
          resource: true,
          resourceId: true,
          details: true,
          ipAddress: true,
          createdAt: true,
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true },
          },
        },
      }),
    ]);

    return {
      period: { from: from.toISOString(), to: to.toISOString() },
      total,
      entries,
    };
  }

  // ---------------------------------------------------------------------------
  // Benchmarks
  // ---------------------------------------------------------------------------

  /**
   * Return static industry benchmark data.
   */
  getBenchmarks() {
    return {
      benchmarks: INDUSTRY_BENCHMARKS,
      description:
        'Industry benchmark ranges for Canadian independent and boutique hotels.',
      updatedAt: '2026-03-31',
    };
  }
}
