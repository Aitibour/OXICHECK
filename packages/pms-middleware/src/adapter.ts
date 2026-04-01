// =============================================================================
// PMS Middleware — Abstract Adapter Interface
// =============================================================================
// Every PMS vendor connector must implement this interface.

import type {
  NormalizedReservation,
  NormalizedGuest,
  NormalizedRoomType,
  PmsSyncResult,
} from './types/normalized';

/** Configuration required to connect to a PMS vendor API. */
export interface PmsConfig {
  vendor: string;
  apiKey: string;
  propertyId: string; // the vendor-specific property/hotel ID
  baseUrl?: string; // override for testing or regional endpoints
  /** Additional vendor-specific options (e.g. OAuth tokens, client IDs). */
  extra?: Record<string, unknown>;
}

/**
 * Abstract PMS adapter interface.
 *
 * Each PMS vendor (Cloudbeds, Mews, etc.) implements this interface to
 * normalize their proprietary API data into the platform's internal model.
 */
export interface PmsAdapter {
  readonly vendor: string;

  // -- Connection ---------------------------------------------------------
  testConnection(): Promise<boolean>;

  // -- Reservations -------------------------------------------------------
  fetchReservations(
    propertyId: string,
    fromDate: string,
    toDate: string,
  ): Promise<PmsSyncResult>;

  fetchReservationById(
    propertyId: string,
    externalId: string,
  ): Promise<NormalizedReservation | null>;

  // -- Guests -------------------------------------------------------------
  fetchGuest(
    propertyId: string,
    externalId: string,
  ): Promise<NormalizedGuest | null>;

  // -- Room Types ---------------------------------------------------------
  fetchRoomTypes(propertyId: string): Promise<NormalizedRoomType[]>;

  // -- Webhooks (optional — only for PMS vendors that support push) -------
  handleWebhook?(payload: unknown): Promise<NormalizedReservation | null>;
}
