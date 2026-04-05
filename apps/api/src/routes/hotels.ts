import { Router } from "express";
import { z } from "zod";
import { prisma } from "@repo/database";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const hotelRoutes = Router();

const updateHotelSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  pmsType: z.string().optional(),
  pmsConfig: z.record(z.unknown()).optional(),
  branding: z.record(z.unknown()).optional(),
  settings: z.record(z.unknown()).optional(),
});

// GET /api/hotels/me — get current hotel details
hotelRoutes.get("/me", requireAuth, async (req, res) => {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: req.user!.hotelId },
      include: { users: { select: { id: true, email: true, firstName: true, lastName: true, role: true } } },
    });

    if (!hotel) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }

    res.json(hotel);
  } catch (err) {
    console.error("Get hotel error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/hotels/me — update hotel details
hotelRoutes.put(
  "/me",
  requireAuth,
  requireRole("ADMIN", "MANAGER"),
  async (req, res) => {
    try {
      const data = updateHotelSchema.parse(req.body);

      const hotel = await prisma.hotel.update({
        where: { id: req.user!.hotelId },
        data: {
          ...data,
          pmsType: data.pmsType as never,
        },
      });

      res.json(hotel);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid input", details: err.errors });
        return;
      }
      console.error("Update hotel error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/hotels/me/stats — dashboard stats
hotelRoutes.get("/me/stats", requireAuth, async (req, res) => {
  try {
    const hotelId = req.user!.hotelId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayArrivals,
      completedCheckins,
      pendingCheckins,
      totalReservations,
    ] = await Promise.all([
      prisma.reservation.count({
        where: {
          hotelId,
          checkInDate: { gte: today, lt: tomorrow },
        },
      }),
      prisma.checkinSession.count({
        where: {
          reservation: { hotelId },
          status: "COMPLETED",
          completedAt: { gte: today },
        },
      }),
      prisma.checkinSession.count({
        where: {
          reservation: { hotelId },
          status: { in: ["PENDING", "IN_PROGRESS"] },
          reservation: { checkInDate: { gte: today, lt: tomorrow } },
        },
      }),
      prisma.reservation.count({
        where: { hotelId, status: "CONFIRMED" },
      }),
    ]);

    res.json({
      todayArrivals,
      completedCheckins,
      pendingCheckins,
      totalReservations,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
