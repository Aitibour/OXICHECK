// =============================================================================
// HotelCheckIn — Shared Constants
// =============================================================================

/** Supported locales (bilingual: English + French) */
export const SUPPORTED_LOCALES = ['en', 'fr'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Default locale */
export const DEFAULT_LOCALE: SupportedLocale = 'en';

/** Hours before check-in to trigger the pre-check-in notification */
export const PRE_CHECK_TRIGGER_HOURS = 48;

/** Hours before check-in to send a reminder if pre-check is incomplete */
export const PRE_CHECK_REMINDER_HOURS = 24;

/** Supported PMS (Property Management System) vendors */
export const SUPPORTED_PMS_VENDORS = [
  'cloudbeds',
  'mews',
  'lightspeed',
  'webrezpro',
  'roommaster',
] as const;
export type SupportedPmsVendor = (typeof SUPPORTED_PMS_VENDORS)[number];

/** Default currency */
export const DEFAULT_CURRENCY = 'CAD';

/** Application name */
export const APP_NAME = 'HotelCheckIn';
