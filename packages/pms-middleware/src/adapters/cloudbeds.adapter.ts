// =============================================================================
// PMS Middleware — Cloudbeds Adapter
// =============================================================================
// Cloudbeds REST API v1.2 — https://api.cloudbeds.com/api/v1.2
//
// Auth: Bearer token via "Authorization: Bearer <apiKey>" header.
// Pagination: page + pageSize query params.
// Rate limits: Respect vendor-imposed limits with delays between pages.

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { PmsAdapter, PmsConfig } from '../adapter';
import type {
  NormalizedReservation,
  NormalizedGuest,
  NormalizedRoomType,
  PmsSyncResult,
  ReservationStatus,
} from '../types/normalized';

const DEFAULT_BASE_URL = 'https://api.cloudbeds.com/api/v1.2';
const DEFAULT_PAGE_SIZE = 100;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1_000;
const PAGE_DELAY_MS = 200; // polite delay between paginated requests

/** Map Cloudbeds reservation status to our normalized status. */
function mapCloudbedsStatus(status: string): ReservationStatus {
  const normalized = status?.toLowerCase?.() ?? '';
  switch (normalized) {
    case 'confirmed':
    case 'not_confirmed':
      return 'confirmed';
    case 'checked_in':
    case 'in_house':
      return 'checked_in';
    case 'checked_out':
      return 'checked_out';
    case 'canceled':
    case 'cancelled':
      return 'cancelled';
    case 'no_show':
      return 'no_show';
    default:
      return 'confirmed';
  }
}

/** Wait for a given number of milliseconds. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class CloudbedsAdapter implements PmsAdapter {
  readonly vendor = 'cloudbeds';
  private client: AxiosInstance;
  private config: PmsConfig;

  constructor(config: PmsConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl ?? DEFAULT_BASE_URL,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30_000,
    });
  }

  // ---------------------------------------------------------------------------
  // Shared request helper — retries with exponential backoff
  // ---------------------------------------------------------------------------
  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    params?: Record<string, unknown>,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const axiosConfig: AxiosRequestConfig = {
          method,
          url: path,
          ...(method === 'GET' ? { params } : { data: params }),
        };
        const response = await this.client.request<T>(axiosConfig);
        return response.data;
      } catch (error: unknown) {
        lastError =
          error instanceof Error ? error : new Error(String(error));

        // Don't retry on 4xx client errors (except 429 rate limit)
        if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500 &&
          error.response.status !== 429
        ) {
          throw lastError;
        }

        // Exponential backoff: 1s, 2s, 4s
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
      const result = await this.request<{ success: boolean }>(
        'GET',
        '/getHotelDetails',
        { propertyID: this.config.propertyId },
      );
      return result?.success === true;
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // PmsAdapter — fetchReservations (paginated)
  // ---------------------------------------------------------------------------
  async fetchReservations(
    propertyId: string,
    fromDate: string,
    toDate: string,
  ): Promise<PmsSyncResult> {
    const allReservations: NormalizedReservation[] = [];
    const errors: Array<{ externalId: string; message: string }> = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await this.request<{
        success: boolean;
        data: Array<Record<string, unknown>>;
        count: number;
        total: number;
      }>('GET', '/getReservations', {
        propertyID: propertyId,
        checkInFrom: fromDate,
        checkInTo: toDate,
        pageSize: DEFAULT_PAGE_SIZE,
        page,
      });

      const items = result?.data ?? [];

      for (const raw of items) {
        try {
          allReservations.push(this.mapReservation(raw));
        } catch (err: unknown) {
          const id = String(raw['reservationID'] ?? 'unknown');
          errors.push({
            externalId: id,
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }

      const totalFetched = page * DEFAULT_PAGE_SIZE;
      hasMore = items.length === DEFAULT_PAGE_SIZE && totalFetched < (result?.total ?? 0);
      page++;

      if (hasMore) {
        await delay(PAGE_DELAY_MS);
      }
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
    propertyId: string,
    externalId: string,
  ): Promise<NormalizedReservation | null> {
    try {
      const result = await this.request<{
        success: boolean;
        data: Record<string, unknown>;
      }>('GET', '/getReservation', {
        propertyID: propertyId,
        reservationID: externalId,
      });

      if (!result?.success || !result?.data) return null;
      return this.mapReservation(result.data);
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // PmsAdapter — fetchGuest
  // ---------------------------------------------------------------------------
  async fetchGuest(
    propertyId: string,
    externalId: string,
  ): Promise<NormalizedGuest | null> {
    try {
      const result = await this.request<{
        success: boolean;
        data: Record<string, unknown>;
      }>('GET', '/getGuest', {
        propertyID: propertyId,
        guestID: externalId,
      });

      if (!result?.success || !result?.data) return null;

      const g = result.data;
      return {
        externalId: String(g['guestID'] ?? ''),
        email: String(g['guestEmail'] ?? ''),
        firstName: String(g['guestFirstName'] ?? ''),
        lastName: String(g['guestLastName'] ?? ''),
        phone: g['guestPhone'] ? String(g['guestPhone']) : undefined,
        locale: g['guestLanguage'] ? String(g['guestLanguage']) : undefined,
        rawData: g,
      };
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // PmsAdapter — fetchRoomTypes
  // ---------------------------------------------------------------------------
  async fetchRoomTypes(propertyId: string): Promise<NormalizedRoomType[]> {
    const result = await this.request<{
      success: boolean;
      data: Array<Record<string, unknown>>;
    }>('GET', '/getRoomTypes', { propertyID: propertyId });

    return (result?.data ?? []).map((rt) => ({
      externalId: String(rt['roomTypeID'] ?? ''),
      name: String(rt['roomTypeName'] ?? ''),
      description: rt['roomTypeDescription']
        ? String(rt['roomTypeDescription'])
        : undefined,
      maxOccupancy: Number(rt['maxGuests'] ?? 2),
      rawData: rt,
    }));
  }

  // ---------------------------------------------------------------------------
  // PmsAdapter — handleWebhook
  // ---------------------------------------------------------------------------
  async handleWebhook(
    payload: unknown,
  ): Promise<NormalizedReservation | null> {
    // Cloudbeds supports webhooks for reservation events
    const data = payload as Record<string, unknown> | undefined;
    if (!data || !data['reservationID']) return null;

    try {
      return this.mapReservation(data);
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Internal — map raw Cloudbeds reservation to NormalizedReservation
  // ---------------------------------------------------------------------------
  private mapReservation(raw: Record<string, unknown>): NormalizedReservation {
    const checkIn = String(raw['startDate'] ?? raw['checkInDate'] ?? '');
    const checkOut = String(raw['endDate'] ?? raw['checkOutDate'] ?? '');

    // Calculate nights from dates
    let nightsCount = 1;
    if (checkIn && checkOut) {
      const diff =
        new Date(checkOut).getTime() - new Date(checkIn).getTime();
      nightsCount = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
    }

    return {
      externalId: String(raw['reservationID'] ?? ''),
      confirmationNumber: raw['confirmationCode']
        ? String(raw['confirmationCode'])
        : undefined,
      guestEmail: String(raw['guestEmail'] ?? ''),
      guestFirstName: String(raw['guestFirstName'] ?? ''),
      guestLastName: String(raw['guestLastName'] ?? ''),
      guestPhone: raw['guestPhone'] ? String(raw['guestPhone']) : undefined,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      roomType: raw['roomTypeName'] ? String(raw['roomTypeName']) : undefined,
      roomNumber: raw['roomNumber'] ? String(raw['roomNumber']) : undefined,
      rateCode: raw['ratePlanName'] ? String(raw['ratePlanName']) : undefined,
      bookingSource: raw['sourceName']
        ? String(raw['sourceName'])
        : undefined,
      nightsCount,
      adultsCount: Number(raw['adults'] ?? 1),
      childrenCount: Number(raw['children'] ?? 0),
      status: mapCloudbedsStatus(String(raw['status'] ?? 'confirmed')),
      rawData: raw,
    };
  }
}

/** Factory function for the adapter registry. */
export function createCloudbedsAdapter(config: PmsConfig): PmsAdapter {
  return new CloudbedsAdapter(config);
}
