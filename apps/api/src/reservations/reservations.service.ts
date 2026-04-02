import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationQueryDto } from './dto/reservation-query.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ManualCheckinDto } from './dto/manual-checkin.dto';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch upcoming arrivals for a property with optional filters.
   */
  async getUpcomingArrivals(query: ReservationQueryDto) {
    const {
      propertyId,
      dateFrom,
      dateTo,
      preCheckStatus,
      search,
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInFrom = dateFrom ? new Date(dateFrom) : today;
    const checkInTo = dateTo
      ? new Date(dateTo)
      : new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const where: Record<string, unknown> = {
      propertyId,
      checkInDate: {
        gte: checkInFrom,
        lte: checkInTo,
      },
    };

    if (preCheckStatus) {
      where.preCheckStatus = preCheckStatus;
    }

    if (search) {
      where.guest = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [total, reservations] = await this.prisma.$transaction([
      this.prisma.reservation.count({ where }),
      this.prisma.reservation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { checkInDate: 'asc' },
        include: {
          guest: true,
          preCheckSubmission: {
            select: {
              id: true,
              completedAt: true,
              completedSteps: true,
            },
          },
        },
      }),
    ]);

    return {
      data: reservations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fetch a single reservation with all relations.
   */
  async getReservationById(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        guest: true,
        property: true,
        preCheckSubmission: true,
        upsellSelections: {
          include: {
            offer: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }

    return reservation;
  }

  /**
   * Update a reservation's room assignment, notes, or status.
   */
  async updateReservation(id: string, data: UpdateReservationDto) {
    await this.getReservationById(id);

    return this.prisma.reservation.update({
      where: { id },
      data: {
        ...(data.roomNumber !== undefined && { roomNumber: data.roomNumber }),
        ...(data.status !== undefined && { status: data.status as any }),
      },
      include: {
        guest: true,
      },
    });
  }

  /**
   * Perform a manual check-in for a reservation.
   */
  async manualCheckIn(
    reservationId: string,
    staffUserId: string,
    dto: ManualCheckinDto,
  ) {
    const reservation = await this.getReservationById(reservationId);

    if (reservation.status === 'CHECKED_IN') {
      throw new BadRequestException('Reservation is already checked in');
    }

    if (reservation.status === 'CHECKED_OUT') {
      throw new BadRequestException('Reservation is already checked out');
    }

    if (reservation.status === 'CANCELLED') {
      throw new BadRequestException('Cannot check in a cancelled reservation');
    }

    const updated = await this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'CHECKED_IN',
      },
      include: {
        guest: true,
      },
    });

    this.logger.log(
      JSON.stringify({
        event: 'MANUAL_CHECK_IN',
        reservationId,
        staffUserId,
        guestId: reservation.guestId,
        notes: dto.notes,
        timestamp: new Date().toISOString(),
      }),
    );

    return updated;
  }

  /**
   * Fetch the full pre-check submission for a reservation.
   */
  async getPreCheckSubmission(reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { id: true, propertyId: true },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationId} not found`);
    }

    const submission = await this.prisma.preCheckSubmission.findUnique({
      where: { reservationId },
      include: {
        reservation: {
          include: {
            consentRecords: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException(
        `No pre-check submission found for reservation ${reservationId}`,
      );
    }

    return submission;
  }

  /**
   * Compute dashboard stats for a property on a given date.
   */
  async getDashboardStats(propertyId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

    const todayArrivalsWhere = {
      propertyId,
      checkInDate: {
        gte: targetDate,
        lt: nextDay,
      },
    };

    const [
      totalArrivals,
      preCheckCompleted,
      preCheckPartial,
      preCheckNotStarted,
      checkedIn,
    ] = await this.prisma.$transaction([
      this.prisma.reservation.count({ where: todayArrivalsWhere }),
      this.prisma.reservation.count({
        where: { ...todayArrivalsWhere, preCheckStatus: 'COMPLETED' },
      }),
      this.prisma.reservation.count({
        where: { ...todayArrivalsWhere, preCheckStatus: 'PARTIAL' },
      }),
      this.prisma.reservation.count({
        where: { ...todayArrivalsWhere, preCheckStatus: 'NOT_STARTED' },
      }),
      this.prisma.reservation.count({
        where: { ...todayArrivalsWhere, status: 'CHECKED_IN' },
      }),
    ]);

    // Weekly arrival summary (next 7 days)
    const weekStart = new Date(targetDate);
    const weekEnd = new Date(targetDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const weeklyReservations = await this.prisma.reservation.findMany({
      where: {
        propertyId,
        checkInDate: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      select: {
        checkInDate: true,
        preCheckStatus: true,
        status: true,
      },
    });

    // Aggregate by day
    const dailySummary: Record<
      string,
      { date: string; total: number; completed: number; checkedIn: number }
    > = {};

    for (let i = 0; i < 7; i++) {
      const d = new Date(targetDate.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0]!;
      dailySummary[key] = { date: key, total: 0, completed: 0, checkedIn: 0 };
    }

    for (const r of weeklyReservations) {
      const key = new Date(r.checkInDate).toISOString().split('T')[0]!;
      const entry = dailySummary[key];
      if (entry) {
        entry.total++;
        if (r.preCheckStatus === 'COMPLETED') entry.completed++;
        if (r.status === 'CHECKED_IN') entry.checkedIn++;
      }
    }

    return {
      date: targetDate.toISOString().split('T')[0],
      totalArrivals,
      preCheckCompleted,
      preCheckPartial,
      preCheckNotStarted,
      checkedIn,
      weeklyTimeline: Object.values(dailySummary),
    };
  }
}
