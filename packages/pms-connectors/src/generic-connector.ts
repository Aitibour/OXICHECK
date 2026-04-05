import type { PmsReservation } from "@repo/shared";
import { PmsConnector, type PmsConfig } from "./pms-interface.js";

/**
 * Generic Webhook Connector
 *
 * For PMS platforms that don't have a native integration,
 * this connector receives data via webhooks and sends
 * updates back to a configured callback URL.
 */
export class GenericWebhookConnector extends PmsConnector {
  private callbackUrl: string;
  private webhookSecret: string;

  constructor(config: PmsConfig) {
    super(config);
    this.callbackUrl = config.apiUrl || "";
    this.webhookSecret = config.webhookSecret || "";
  }

  async testConnection(): Promise<boolean> {
    if (!this.callbackUrl) return false;
    try {
      const response = await fetch(this.callbackUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": this.webhookSecret,
        },
        body: JSON.stringify({ type: "ping" }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getReservations(
    _fromDate: string,
    _toDate: string
  ): Promise<PmsReservation[]> {
    // Generic connector is webhook-based — reservations are pushed to us
    // This method returns empty; reservations are stored when received via webhook
    return [];
  }

  async getReservation(
    _pmsReservationId: string
  ): Promise<PmsReservation | null> {
    // Look up from our local database instead
    return null;
  }

  async updateCheckinStatus(
    pmsReservationId: string,
    status: "checked_in" | "pre_checked_in"
  ): Promise<void> {
    if (!this.callbackUrl) return;

    await fetch(this.callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": this.webhookSecret,
      },
      body: JSON.stringify({
        type: "checkin_status_update",
        reservationId: pmsReservationId,
        status,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  async updateGuestProfile(
    pmsReservationId: string,
    guestData: Partial<PmsReservation>
  ): Promise<void> {
    if (!this.callbackUrl) return;

    await fetch(this.callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": this.webhookSecret,
      },
      body: JSON.stringify({
        type: "guest_profile_update",
        reservationId: pmsReservationId,
        guestData,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  async assignRoom(
    pmsReservationId: string,
    roomNumber: string
  ): Promise<void> {
    if (!this.callbackUrl) return;

    await fetch(this.callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": this.webhookSecret,
      },
      body: JSON.stringify({
        type: "room_assignment",
        reservationId: pmsReservationId,
        roomNumber,
        timestamp: new Date().toISOString(),
      }),
    });
  }
}
