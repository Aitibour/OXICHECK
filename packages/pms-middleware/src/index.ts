// =============================================================================
// @hotelcheckin/pms-middleware — Public API
// =============================================================================

// Types
export type {
  NormalizedReservation,
  NormalizedGuest,
  NormalizedRoomType,
  PmsSyncResult,
  PmsSyncError,
  ReservationStatus,
} from './types/normalized';

// Adapter interface & config
export type { PmsAdapter, PmsConfig } from './adapter';

// Adapters
export { CloudbedsAdapter, createCloudbedsAdapter } from './adapters/cloudbeds.adapter';
export { MewsAdapter, createMewsAdapter } from './adapters/mews.adapter';

// Registry
export { PmsAdapterRegistry, createDefaultRegistry } from './registry';

// Sync engine
export {
  PmsSyncEngine,
  type SyncEvent,
  type SyncEventListener,
  type DateRange,
} from './sync-engine';
