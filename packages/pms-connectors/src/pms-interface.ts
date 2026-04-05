import type { PmsReservation } from "@repo/shared";

export type PmsConnectorType =
  | "MEWS"
  | "CLOUDBEDS"
  | "OPERA"
  | "HOTELOGIX"
  | "GENERIC_WEBHOOK";

export interface PmsConfig {
  type: PmsConnectorType;
  apiUrl?: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  propertyId?: string;
  webhookSecret?: string;
  [key: string]: unknown;
}

export abstract class PmsConnector {
  protected config: PmsConfig;

  constructor(config: PmsConfig) {
    this.config = config;
  }

  /** Test the connection to the PMS */
  abstract testConnection(): Promise<boolean>;

  /** Fetch reservations arriving within a date range */
  abstract getReservations(
    fromDate: string,
    toDate: string
  ): Promise<PmsReservation[]>;

  /** Fetch a single reservation by PMS reservation ID */
  abstract getReservation(
    pmsReservationId: string
  ): Promise<PmsReservation | null>;

  /** Update check-in status in the PMS */
  abstract updateCheckinStatus(
    pmsReservationId: string,
    status: "checked_in" | "pre_checked_in"
  ): Promise<void>;

  /** Push guest data back to the PMS */
  abstract updateGuestProfile(
    pmsReservationId: string,
    guestData: Partial<PmsReservation>
  ): Promise<void>;

  /** Assign a room to a reservation */
  abstract assignRoom(
    pmsReservationId: string,
    roomNumber: string
  ): Promise<void>;
}
