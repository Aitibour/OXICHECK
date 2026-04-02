import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PmsSyncEngine,
  type PmsConfig,
  type PmsSyncResult,
  type SyncEvent,
  type NormalizedReservation,
} from '@hotelcheckin/pms-middleware';

@Injectable()
export class PmsService {
  private readonly logger = new Logger(PmsService.name);
  private readonly syncEngine: PmsSyncEngine;

  constructor(private readonly prisma: PrismaService) {
    this.syncEngine = new PmsSyncEngine();

    // Log every sync event to PmsSyncLog
    this.syncEngine.onSyncEvent((event: SyncEvent) => {
      this.logSyncEvent(event).catch((err) =>
        this.logger.error('Failed to persist sync event', err),
      );
    });
  }

  // ---------------------------------------------------------------------------
  // syncProperty — trigger a manual reservation sync
  // ---------------------------------------------------------------------------
  async syncProperty(
    propertyId: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<PmsSyncResult> {
    const config = await this.getPmsConfig(propertyId);

    // Default: sync the next 30 days
    const from = fromDate ?? new Date().toISOString().split('T')[0]!;
    const to =
      toDate ??
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1_000)
        .toISOString()
        .split('T')[0]!;

    this.logger.log(
      `Syncing property ${propertyId} (${config.vendor}) from ${from} to ${to}`,
    );

    return this.syncEngine.syncReservations(config, { from, to });
  }

  // ---------------------------------------------------------------------------
  // getConnectionStatus — test PMS connectivity
  // ---------------------------------------------------------------------------
  async getConnectionStatus(
    propertyId: string,
  ): Promise<{ connected: boolean; vendor: string }> {
    const config = await this.getPmsConfig(propertyId);
    const connected = await this.syncEngine.testConnection(config);
    return { connected, vendor: config.vendor };
  }

  // ---------------------------------------------------------------------------
  // getSyncHistory — query PmsSyncLog for a property
  // ---------------------------------------------------------------------------
  async getSyncHistory(propertyId: string, limit = 20) {
    return this.prisma.pmsSyncLog.findMany({
      where: { propertyId },
      orderBy: { syncedAt: 'desc' },
      take: limit,
    });
  }

  // ---------------------------------------------------------------------------
  // processWebhook — handle an inbound PMS webhook
  // ---------------------------------------------------------------------------
  async processWebhook(
    propertyId: string,
    payload: unknown,
  ): Promise<NormalizedReservation | null> {
    const config = await this.getPmsConfig(propertyId);
    return this.syncEngine.handleWebhook(config, payload);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Look up PMS config from the Property record. */
  private async getPmsConfig(propertyId: string): Promise<PmsConfig> {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        pmsVendor: true,
        pmsApiKey: true,
        pmsPropertyId: true,
      },
    });

    if (!property) {
      throw new NotFoundException(`Property ${propertyId} not found`);
    }

    if (!property.pmsVendor || !property.pmsApiKey) {
      throw new NotFoundException(
        `Property ${propertyId} has no PMS integration configured`,
      );
    }

    return {
      vendor: property.pmsVendor,
      apiKey: property.pmsApiKey,
      propertyId: property.pmsPropertyId ?? propertyId,
    };
  }

  /** Persist a SyncEvent to PmsSyncLog. */
  private async logSyncEvent(event: SyncEvent): Promise<void> {
    const status = event.result.success
      ? 'SUCCESS'
      : event.result.syncedCount > 0
        ? 'PARTIAL'
        : 'FAILED';

    await this.prisma.pmsSyncLog.create({
      data: {
        propertyId: event.propertyId,
        direction: event.direction,
        entityType: event.entityType,
        status,
        errorMessage:
          event.result.errors.length > 0
            ? event.result.errors.map((e) => e.message).join('; ')
            : null,
        responsePayload: {
          syncedCount: event.result.syncedCount,
          failedCount: event.result.failedCount,
          errors: event.result.errors,
        } as any,
        syncedAt: new Date(event.timestamp),
      },
    });
  }
}
