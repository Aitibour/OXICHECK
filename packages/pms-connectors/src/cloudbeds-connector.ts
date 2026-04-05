import type { PmsReservation } from "@repo/shared";
import { PmsConnector, type PmsConfig } from "./pms-interface.js";

/**
 * Cloudbeds PMS Connector
 * Docs: https://hotels.cloudbeds.com/api/docs/
 *
 * Cloudbeds uses OAuth2 + REST API.
 */
export class CloudbedsConnector extends PmsConnector {
  private baseUrl: string;
  private accessToken: string;
  private propertyId: string;

  constructor(config: PmsConfig) {
    super(config);
    this.baseUrl = config.apiUrl || "https://hotels.cloudbeds.com/api/v1.2";
    this.accessToken = config.apiKey || "";
    this.propertyId = config.propertyId || "";
  }

  private async request(endpoint: string, params?: Record<string, string>) {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudbeds API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.request("getHotelDetails");
      return true;
    } catch {
      return false;
    }
  }

  async getReservations(
    fromDate: string,
    toDate: string
  ): Promise<PmsReservation[]> {
    const data = await this.request("getReservations", {
      propertyID: this.propertyId,
      checkInFrom: fromDate,
      checkInTo: toDate,
      status: "confirmed",
    });

    return (data.data || []).map(
      (r: Record<string, unknown>): PmsReservation => ({
        pmsReservationId: String(r.reservationID),
        confirmationCode: (r.identifier as string) || "",
        guestFirstName: (r.guestFirstName as string) || "",
        guestLastName: (r.guestLastName as string) || "",
        guestEmail: r.guestEmail as string | undefined,
        guestPhone: r.guestPhone as string | undefined,
        checkInDate: r.startDate as string,
        checkOutDate: r.endDate as string,
        roomType: r.roomTypeName as string | undefined,
        roomNumber: r.roomName as string | undefined,
        adultsCount: (r.adults as number) || 1,
        childrenCount: (r.children as number) || 0,
        status: r.status as string,
      })
    );
  }

  async getReservation(
    pmsReservationId: string
  ): Promise<PmsReservation | null> {
    try {
      const data = await this.request("getReservation", {
        reservationID: pmsReservationId,
      });

      if (!data.data) return null;
      const r = data.data;

      return {
        pmsReservationId: String(r.reservationID),
        confirmationCode: r.identifier || "",
        guestFirstName: r.guestFirstName || "",
        guestLastName: r.guestLastName || "",
        guestEmail: r.guestEmail,
        guestPhone: r.guestPhone,
        checkInDate: r.startDate,
        checkOutDate: r.endDate,
        roomType: r.roomTypeName,
        roomNumber: r.roomName,
        adultsCount: r.adults || 1,
        childrenCount: r.children || 0,
        status: r.status,
      };
    } catch {
      return null;
    }
  }

  async updateCheckinStatus(
    pmsReservationId: string,
    status: "checked_in" | "pre_checked_in"
  ): Promise<void> {
    if (status === "checked_in") {
      await this.request("putReservation", {
        reservationID: pmsReservationId,
        status: "checked_in",
      });
    }
  }

  async updateGuestProfile(
    _pmsReservationId: string,
    _guestData: Partial<PmsReservation>
  ): Promise<void> {
    // Cloudbeds guest updates require the guest ID
    // Implementation depends on their guest endpoint
  }

  async assignRoom(
    pmsReservationId: string,
    roomNumber: string
  ): Promise<void> {
    await this.request("putReservation", {
      reservationID: pmsReservationId,
      roomID: roomNumber,
    });
  }
}
