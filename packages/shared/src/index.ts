// Shared types and constants for OxiCheck

export interface CheckinLink {
  token: string;
  reservationId: string;
  hotelName: string;
  guestName: string;
  checkInDate: string;
  expiresAt: string;
}

export interface CheckinFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nationality?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface GuestPreferences {
  floorPreference?: "low" | "mid" | "high";
  bedType?: "single" | "double" | "twin" | "king";
  pillowType?: "soft" | "firm";
  smokingRoom?: boolean;
  earlyCheckIn?: boolean;
  lateCheckOut?: boolean;
  specialRequests?: string;
}

export interface PmsReservation {
  pmsReservationId: string;
  confirmationCode: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail?: string;
  guestPhone?: string;
  checkInDate: string;
  checkOutDate: string;
  roomType?: string;
  roomNumber?: string;
  adultsCount: number;
  childrenCount: number;
  status: string;
}

export const CHECKIN_LINK_EXPIRY_HOURS = 72;

export const SUPPORTED_LANGUAGES = [
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ar",
  "zh",
  "ja",
  "ko",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
