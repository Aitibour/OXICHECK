// =============================================================================
// PMS Middleware — Sync Engine
// =============================================================================
// Orchestrates data pull from PMS vendors via adapters.
// Provides retry logic, per-record error isolation, and event emission.

import type { PmsConfig } from './adapter';
import type { PmsSyncResult, NormalizedReservation } from './types/normalized';
import { PmsAdapterRegistry, createDefaultRegistry } from './registry';

/** Emitted after every sync attempt (success or failure). */
export interface SyncEvent {
  propertyId: string;
  vendor: string;
  direction: 'INBOUND';
  entityType: string;
  result: PmsSyncResult;
  timestamp: string;
}

export type SyncEventListener = (event: SyncEvent) => void;

export interface DateRange {
  from: string; // ISO date
  to: string;
}

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1_000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class PmsSyncEngine {
  private registry: PmsAdapterRegistry;
  private listeners: SyncEventListener[] = [];

  constructor(registry?: PmsAdapterRegistry) {
    this.registry = registry ?? createDefaultRegistry();
  }

  /** Subscribe to sync events (for logging to PmsSyncLog). */
  onSyncEvent(listener: SyncEventListener): void {
    this.listeners.push(listener);
  }

  private emit(event: SyncEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // listener errors must not break the sync flow
      }
    }
  }

  /**
   * Sync reservations for a property.
   * Retries the full fetch up to MAX_RETRIES times on transient failures.
   */
  async syncReservations(
    config: PmsConfig,
    dateRange: DateRange,
  ): Promise<PmsSyncResult> {
    const adapter = this.registry.create(config.vendor, config);
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const result = await adapter.fetchReservations(
          config.propertyId,
          dateRange.from,
          dateRange.to,
        );

        this.emit({
          propertyId: config.propertyId,
          vendor: config.vendor,
          direction: 'INBOUND',
          entityType: 'reservation',
          result,
          timestamp: new Date().toISOString(),
        });

        return result;
      } catch (error: unknown) {
        lastError =
          error instanceof Error ? error : new Error(String(error));

        if (attempt < MAX_RETRIES - 1) {
          await delay(INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt));
        }
      }
    }

    // All retries exhausted — emit a failed event
    const failedResult: PmsSyncResult = {
      success: false,
      syncedCount: 0,
      failedCount: 1,
      errors: [
        {
          externalId: 'sync',
          message: lastError?.message ?? 'Unknown sync error',
        },
      ],
      data: [],
    };

    this.emit({
      propertyId: config.propertyId,
      vendor: config.vendor,
      direction: 'INBOUND',
      entityType: 'reservation',
      result: failedResult,
      timestamp: new Date().toISOString(),
    });

    return failedResult;
  }

  /** Test the PMS connection for a property. */
  async testConnection(config: PmsConfig): Promise<boolean> {
    const adapter = this.registry.create(config.vendor, config);
    return adapter.testConnection();
  }

  /** Fetch a single reservation by external ID. */
  async fetchReservation(
    config: PmsConfig,
    externalId: string,
  ): Promise<NormalizedReservation | null> {
    const adapter = this.registry.create(config.vendor, config);
    return adapter.fetchReservationById(config.propertyId, externalId);
  }

  /** Handle an inbound webhook payload. */
  async handleWebhook(
    config: PmsConfig,
    payload: unknown,
  ): Promise<NormalizedReservation | null> {
    const adapter = this.registry.create(config.vendor, config);
    if (!adapter.handleWebhook) return null;
    return adapter.handleWebhook(payload);
  }
}
