import { Router } from "express";
import { prisma } from "@repo/database";

export const webhookRoutes = Router();

/**
 * Webhook endpoint for PMS systems to push reservation updates.
 * Each PMS has a different payload format, so we normalize them here.
 */

// POST /api/webhooks/pms/:hotelSlug — receive PMS reservation updates
webhookRoutes.post("/pms/:hotelSlug", async (req, res) => {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: req.params.hotelSlug },
    });

    if (!hotel) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }

    // Verify webhook secret if configured
    const config = hotel.pmsConfig as Record<string, string> | null;
    if (config?.webhookSecret) {
      const secret = req.headers["x-webhook-secret"];
      if (secret !== config.webhookSecret) {
        res.status(401).json({ error: "Invalid webhook secret" });
        return;
      }
    }

    const { type, data } = req.body;

    switch (type) {
      case "reservation.created":
      case "reservation.updated": {
        // Upsert reservation from PMS data
        await prisma.reservation.upsert({
          where: {
            hotelId_pmsReservationId: {
              hotelId: hotel.id,
              pmsReservationId: data.reservationId,
            },
          },
          create: {
            hotelId: hotel.id,
            pmsReservationId: data.reservationId,
            confirmationCode: data.confirmationCode,
            checkInDate: new Date(data.checkInDate),
            checkOutDate: new Date(data.checkOutDate),
            roomType: data.roomType,
            roomNumber: data.roomNumber,
            adultsCount: data.adultsCount || 1,
            childrenCount: data.childrenCount || 0,
            syncedAt: new Date(),
            guest: data.guestEmail
              ? {
                  connectOrCreate: {
                    where: { id: "placeholder" }, // will use email lookup in practice
                    create: {
                      firstName: data.guestFirstName,
                      lastName: data.guestLastName,
                      email: data.guestEmail,
                      phone: data.guestPhone,
                    },
                  },
                }
              : undefined,
          },
          update: {
            confirmationCode: data.confirmationCode,
            checkInDate: new Date(data.checkInDate),
            checkOutDate: new Date(data.checkOutDate),
            roomType: data.roomType,
            roomNumber: data.roomNumber,
            adultsCount: data.adultsCount,
            childrenCount: data.childrenCount,
            syncedAt: new Date(),
          },
        });
        break;
      }

      case "reservation.cancelled": {
        await prisma.reservation.updateMany({
          where: {
            hotelId: hotel.id,
            pmsReservationId: data.reservationId,
          },
          data: { status: "CANCELLED" },
        });
        break;
      }

      default:
        console.log(`Unknown webhook type: ${type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
