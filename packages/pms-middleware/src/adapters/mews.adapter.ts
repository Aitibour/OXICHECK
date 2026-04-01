// =============================================================================
// PMS Middleware — Mews Adapter
// =============================================================================
// Mews Connector API — POST-based JSON-RPC style.
// Base URL: https://api.mews.com/api/connector/v1
//
// Auth: uses ClientToken + AccessToken in request bodies (not headers).

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { PmsAdapter, PmsConfig } from '../adapter';
import type {
  NormalizedReservation,
  NormalizedGuest,
  NormalizedRoomType,
  PmsSyncResult,
  ReservationStatus,
} from '../types/normalized';

const DEFAULT_BASE_URL = 'https://api.mews.com/api/connector/v1';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1_000;

/** Map Mews reservation state to normalized status. */
function mapMewsState(state: string): ReservationStatus {
  const normalized = state?.toLowerCase?.() ?? '';
  switch (normalized) {
    case 'confirmed':
    case 'optional':
      return 'confirmed';
    case 'started':
      return 'checked_in';
    case 'processed':
      return 'checked_out';
    case 'canceled':
    case 'cancelled':
      return 'cancelled';
    default:
      return 'confirmed';
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MewsAdapter implements PmsAdapter {
  readonly vendor = 'mews';
  private client: AxiosInstance;
  private config: PmsConfig;

  constructor(config: PmsConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl ?? DEFAULT_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30_000,
    });
  }

  // ---------------------------------------------------------------------------
  // Shared request helper — retries with exponential backoff
  // ---------------------------------------------------------------------------
  private async request<T>(
    path: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    let lastError: Error | undefined;

    // All Mews requests include auth tokens in the body
    const payload = {
      ClientToken: (this.config.extra?.['clientToken'] as string) ?? '',
      AccessToken: this.config.apiKey,
      ...body,
    };

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const axiosConfig: AxiosRequestConfig = {
          method: 'POST',
          url: path,
          data: payload,
        };
        const response = await this.client.request<T>(axiosConfig);
        return response.data;
      } catch (error: unknown) {
        lastError =
          error instanceof Error ? error : new Error(String(error));

        if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500 &&
          error.response.status !== 429
        ) {
          throw lastError;
        }

        if (attempt < MAX_RETRIES - 1) {
          await delay(INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt));
        }
      }
    }

    throw lastError ?? new Error('Request failed after retries');
  }

  // ---------------------------------------------------------------------------
  // PmsAdapter — testConnection
  // ---------------------------------------------------------------------------
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.request<{ Enterprises?: unknown[] }>(
        '/enterprises/getAll',
        {},
      );
      return Array.isArray(result?.Enterprises);
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // PmsAdapter — fetchReservations
  // ---------------------------------------------------------------------------
  async fetchReservations(
    _propertyId: string,
    fromDate: string,
    toDate: string,
  ): Promise<PmsSyncResult> {
    const allReservations: NormalizedReservation[] = [];
    const errors: Array<{ externalId: string; message: string }> = [];

    try {
      const result = await this.request<{
        Reservations?: Array<Record<string, unknown>>;
      }>('/reservations/getAll', {
        StartUtc: fromDate,
        EndUtc: toDate,
        Extent: {
          Reservations: true,
          Customers: true,
        },
      });

      for (const raw of result?.Reservations ?? []) {
        try {
          allReservations.push(this.mapReservation(raw));
        } catch (err: unknown) {
          const id = String(raw['Id'] ?? 'unknown');
          errors.push({
            externalId: id,
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }
    } catch (err: unknown) {
      errors.push({
        externalId: 'batch',
        message: err instanceof Error ? err.message : String(err),
      });
    }

    return {
      success: errors.length === 0,
      syncedCount: allReservations.length,
      failedCount: errors.length,
      errors,
      data: allReservations,
    };
  }

  // ---------------------------------------------------------------------------
  // PmsAdapter — fetchReservationById
  // ---------------------------------------------------------------------------
  async fetchReservationById(
    _propertyId: string,
    externalId: string,
  ): Promise<NormalizedReservation | null> {
    // TODO: Mews supports fetching by reservation ID via /reservations/getAll with ReservationIds filter
    try {
      const result = await this.request<{
        Reservations?: Array<Record<string, unknown>>;
      }>('/reservations/getAll', {
        ReservationIds: [externalId],
        Extent: { Reservations: true, Customers: true },
      });

      const raw = result?.Reservations?.[0];
      if (!raw) return null;
      return this.mapReservation(raw);
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // PmsAdapter — fetchGuest
  // ---------------------------------------------------------------------------
  async fetchGuest(
    _propertyId: string,
    externalId: string,
  ): Promise<NormalizedGuest | null> {
    // TODO: implement full Mews customer fetch via /customers/getAll
    try {
      const result = await this.request<{
        Customers?: Array<Record<string, unknown>>;
      }>('/customers/getAll', {
        CustomerIds: [externalId],
      });

      const c = result?.Customers?.[0];
      if (!c) return null;

      return {
        externalId: String(c['Id'] ?? ''),
        email: String(c['Email'] ?? ''),
        firstName: String(c['FirstName'] ?? ''),
        lastName: String(c['LastName'] ?? ''),
        phone: c['Phone'] ? String(c['Phone']) : undefined,
        locale: c['LanguageCode'] ? String(c['LanguageCode']) : undefined,
        rawData: c,
      };
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // PmsAdapter — fetchRoomTypes
  // ---------------------------------------------------------------------------
  async fetchRoomTypes(_propertyId: string): Promise<NormalizedRoomType[]> {
    // TODO: implement full Mews space categories fetch
    try {
      const result = await this.request<{
        SpaceCategories?: Array<Record<string, unknown>>;
      }>('/spaceCategories/getAll', {});

      return (result?.SpaceCategories ?? []).map((sc) => ({
        externalId: String(sc['Id'] ?? ''),
        name: String(sc['Name'] ?? ''),
        description: sc['Description'] ? String(sc['Description']) : undefined,
        maxOccupancy: Number(sc['Capacity'] ?? 2),
        rawData: sc,
      }));
    } catch {
      return [];
    }
  }

  // ---------------------------------------------------------------------------
  // Internal — map Mews reservation to NormalizedReservation
  // ---------------------------------------------------------------------------
  private mapReservation(raw: Record<string, unknown>): NormalizedReservation {
    const checkIn = String(raw['StartUtc'] ?? '').split('T')[0] ?? '';
    const checkOut = String(raw['EndUtc'] ?? '').split('T')[0] ?? '';

    let nightsCount = 1;
    if (checkIn && checkOut) {
      const diff =
        new Date(checkOut).getTime() - new Date(checkIn).getTime();
      nightsCount = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
    }

    return {
      externalId: String(raw['Id'] ?? ''),
      confirmationNumber: raw['ConfirmationNumber']
        ? String(raw['ConfirmationNumber'])
        : undefined,
      guestEmail: String(raw['CustomerEmail'] ?? raw['GuestEmail'] ?? ''),
      guestFirstName: String(
        raw['CustomerFirstName'] ?? raw['GuestFirstName'] ?? '',
      ),
      guestLastName: String(
        raw['CustomerLastName'] ?? raw['GuestLastName'] ?? '',
      ),
      guestPhone: raw['CustomerPhone']
        ? String(raw['CustomerPhone'])
        : undefined,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      roomType: raw['SpaceCategoryName']
        ? String(raw['SpaceCategoryName'])
        : undefined,
      roomNumber: raw['AssignedSpaceName']
        ? String(raw['AssignedSpaceName'])
        : undefined,
      rateCode: raw['RateName'] ? String(raw['RateName']) : undefined,
      bookingSource: raw['Origin'] ? String(raw['Origin']) : undefined,
      nightsCount,
      adultsCount: Number(raw['AdultCount'] ?? 1),
      childrenCount: Number(raw['ChildCount'] ?? 0),
      status: mapMewsState(String(raw['State'] ?? 'Confirmed')),
      rawData: raw,
    };
  }
}

/** Factory function for the adapter registry. */
export function createMewsAdapter(config: PmsConfig): PmsAdapter {
  return new MewsAdapter(config);
}
