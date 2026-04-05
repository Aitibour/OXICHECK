import type { PmsReservation } from "@repo/shared";
import { PmsConnector, type PmsConfig } from "./pms-interface.js";

/**
 * Mews PMS Connector
 * Docs: https://mews-systems.gitbook.io/connector-api/
 *
 * Mews uses a REST API with JSON payloads.
 * Authentication via ClientToken + AccessToken.
 */
export class MewsConnector extends PmsConnector {
  private baseUrl: string;
  private clientToken: string;
  private accessToken: string;

  constructor(config: PmsConfig) {
    super(config);
    this.baseUrl =
      config.apiUrl || "https://api.mews.com/api/connector/v1";
    this.clientToken = config.clientId || "";
    this.accessToken = config.apiKey || "";
  }

  private async request(endpoint: string, body: Record<string, unknown>) {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ClientToken: this.clientToken,
        AccessToken: this.accessToken,
        ...body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mews API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.request("configuration/get", {});
      return true;
    } catch {
      return false;
    }
  }

  async getReservations(
    fromDate: string,
    toDate: string
  ): Promise<PmsReservation[]> {
    const data = await this.request("reservations/getAll", {
      StartUtc: fromDate,
      EndUtc: toDate,
      States: ["Confirmed", "Started"],
      Extent: {
        Reservations: true,
        Customers: true,
      },
    });

    const customers = new Map(
      (data.Customers || []).map((c: Record<string, string>) => [c.Id, c])
    );

    return (data.Reservations || []).map(
      (r: Record<string, unknown>): PmsReservation => {
        const customer = customers.get(r.CustomerId as string) as
          | Record<string, string>
          | undefined;
        return {
          pmsReservationId: r.Id as string,
          confirmationCode: (r.Number as string) || "",
          guestFirstName: customer?.FirstName || "",
          guestLastName: customer?.LastName || "",
          guestEmail: customer?.Email,
          guestPhone: customer?.Phone,
          checkInDate: r.StartUtc as string,
          checkOutDate: r.EndUtc as string,
          roomType: r.RequestedResourceCategoryId as string | undefined,
          roomNumber: r.AssignedResourceId as string | undefined,
          adultsCount: (r.AdultCount as number) || 1,
          childrenCount: (r.ChildCount as number) || 0,
          status: r.State as string,
        };
      }
    );
  }

  async getReservation(
    pmsReservationId: string
  ): Promise<PmsReservation | null> {
    const data = await this.request("reservations/getAll", {
      ReservationIds: [pmsReservationId],
      Extent: { Reservations: true, Customers: true },
    });

    if (!data.Reservations?.length) return null;

    const reservations = await this.getReservations(
      data.Reservations[0].StartUtc,
      data.Reservations[0].EndUtc
    );
    return reservations.find(
      (r) => r.pmsReservationId === pmsReservationId
    ) || null;
  }

  async updateCheckinStatus(
    pmsReservationId: string,
    status: "checked_in" | "pre_checked_in"
  ): Promise<void> {
    if (status === "checked_in") {
      await this.request("reservations/start", {
        ReservationId: pmsReservationId,
      });
    }
    // Mews doesn't have a native "pre_checked_in" state;
    // we can add a note or use a custom classification
  }

  async updateGuestProfile(
    pmsReservationId: string,
    guestData: Partial<PmsReservation>
  ): Promise<void> {
    // First get the reservation to find the customer ID
    const data = await this.request("reservations/getAll", {
      ReservationIds: [pmsReservationId],
      Extent: { Reservations: true },
    });

    if (!data.Reservations?.length) return;

    const customerId = data.Reservations[0].CustomerId;

    await this.request("customers/update", {
      CustomerId: customerId,
      FirstName: guestData.guestFirstName
        ? { Value: guestData.guestFirstName }
        : undefined,
      LastName: guestData.guestLastName
        ? { Value: guestData.guestLastName }
        : undefined,
      Email: guestData.guestEmail
        ? { Value: guestData.guestEmail }
        : undefined,
      Phone: guestData.guestPhone
        ? { Value: guestData.guestPhone }
        : undefined,
    });
  }

  async assignRoom(
    pmsReservationId: string,
    roomNumber: string
  ): Promise<void> {
    await this.request("reservations/update", {
      ReservationUpdates: [
        {
          ReservationId: pmsReservationId,
          AssignedResourceId: { Value: roomNumber },
        },
      ],
    });
  }
}
