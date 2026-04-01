// =============================================================================
// PMS Middleware — Normalized Data Models
// =============================================================================
// All PMS adapters must map vendor-specific data into these normalized types.

export type ReservationStatus =
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show';

export interface NormalizedReservation {
  externalId: string;
  confirmationNumber?: string;
  guestEmail: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone?: string;
  checkInDate: string; // ISO date (YYYY-MM-DD)
  checkOutDate: string;
  roomType?: string;
  roomNumber?: string;
  rateCode?: string;
  bookingSource?: string;
  nightsCount: number;
  adultsCount: number;
  childrenCount: number;
  status: ReservationStatus;
  rawData?: Record<string, unknown>; // original PMS data preserved
}

export interface NormalizedGuest {
  externalId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  locale?: string;
  rawData?: Record<string, unknown>;
}

export interface NormalizedRoomType {
  externalId: string;
  name: string;
  description?: string;
  maxOccupancy: number;
  rawData?: Record<string, unknown>;
}

export interface PmsSyncError {
  externalId: string;
  message: string;
}

export interface PmsSyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: PmsSyncError[];
  data: NormalizedReservation[] | NormalizedGuest[] | NormalizedRoomType[];
}
