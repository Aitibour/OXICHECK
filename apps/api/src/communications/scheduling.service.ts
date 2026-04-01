import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CommunicationsService } from './communications.service';

@Injectable()
export class CommunicationSchedulingService {
  private readonly logger = new Logger(CommunicationSchedulingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly communicationsService: CommunicationsService,
  ) {}

  /**
   * Run every hour — find reservations with checkInDate = now + 48h
   * whose preCheckStatus is NOT_STARTED, and send the pre-check invite.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async schedulePreCheckInvites() {
    this.logger.log('Running scheduled pre-check invite job');

    const now = new Date();
    const from = new Date(now.getTime() + 47 * 60 * 60 * 1000);
    const to = new Date(now.getTime() + 49 * 60 * 60 * 1000);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        checkInDate: { gte: from, lte: to },
        preCheckStatus: 'NOT_STARTED',
        status: 'CONFIRMED',
        // Avoid re-sending: no existing PRE_CHECK_INVITE logs
        communicationLogs: {
          none: {
            template: { type: 'PRE_CHECK_INVITE' },
          },
        },
      },
      select: { id: true },
    });

    this.logger.log(
      `Found ${reservations.length} reservations for pre-check invites`,
    );

    for (const reservation of reservations) {
      try {
        await this.communicationsService.sendPreCheckInvite(reservation.id);
      } catch (error: any) {
        this.logger.error(
          `Failed to send pre-check invite for ${reservation.id}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Run every hour — find reservations with checkInDate = now + 24h
   * whose preCheckStatus is NOT COMPLETED, and send a reminder.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scheduleReminders() {
    this.logger.log('Running scheduled reminder job');

    const now = new Date();
    const from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const to = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        checkInDate: { gte: from, lte: to },
        preCheckStatus: { not: 'COMPLETED' },
        status: 'CONFIRMED',
        // Avoid re-sending: no existing REMINDER logs
        communicationLogs: {
          none: {
            template: { type: 'REMINDER' },
          },
        },
      },
      select: { id: true },
    });

    this.logger.log(
      `Found ${reservations.length} reservations for reminders`,
    );

    for (const reservation of reservations) {
      try {
        await this.communicationsService.sendReminder(reservation.id);
      } catch (error: any) {
        this.logger.error(
          `Failed to send reminder for ${reservation.id}: ${error.message}`,
        );
      }
    }
  }
}
