// =============================================================================
// HotelCheckIn — Shared Types
// =============================================================================

/** Role-based access control roles */
export enum Role {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  PROPERTY_OWNER = 'PROPERTY_OWNER',
  GENERAL_MANAGER = 'GENERAL_MANAGER',
  FRONT_DESK_SUPERVISOR = 'FRONT_DESK_SUPERVISOR',
  FRONT_DESK_AGENT = 'FRONT_DESK_AGENT',
  REVENUE_MANAGER = 'REVENUE_MANAGER',
}

/** Pre-check-in workflow status */
export enum PreCheckStatus {
  NOT_STARTED = 'NOT_STARTED',
  PARTIAL = 'PARTIAL',
  COMPLETED = 'COMPLETED',
}

/** Upsell offer categories */
export enum UpsellCategory {
  BREAKFAST = 'BREAKFAST',
  SPA = 'SPA',
  AIRPORT_PICKUP = 'AIRPORT_PICKUP',
  ROOM_UPGRADE = 'ROOM_UPGRADE',
  EARLY_CHECKIN = 'EARLY_CHECKIN',
  LATE_CHECKOUT = 'LATE_CHECKOUT',
  PARKING = 'PARKING',
  CELEBRATION = 'CELEBRATION',
}

/** A platform-level organization (hotel group or single property owner) */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

/** A single hotel property belonging to an organization */
export interface Property {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  timezone: string;
  defaultLocale: string;
  createdAt: Date;
  updatedAt: Date;
}

/** A platform user (staff, manager, owner, or admin) */
export interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** A hotel guest (may span multiple reservations) */
export interface Guest {
  id: string;
  propertyId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}

/** A reservation linked to a guest and property */
export interface Reservation {
  id: string;
  propertyId: string;
  guestId: string;
  externalPmsId?: string;
  checkInDate: Date;
  checkOutDate: Date;
  roomType: string;
  preCheckStatus: PreCheckStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** An upsell offer available for a property */
export interface UpsellOffer {
  id: string;
  propertyId: string;
  category: UpsellCategory;
  title: string;
  description: string;
  priceInCents: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
