import { Router } from "express";
import { z } from "zod";
import { prisma } from "@repo/database";
import { requireAuth } from "../middleware/auth.js";

export const reservationRoutes = Router();

const createReservationSchema = z.object({
  guestFirstName: z.string(),
  guestLastName: z.string(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  roomType: z.string().optional(),
  roomNumber: z.string().optional(),
  adultsCount: z.number().int().positive().default(1),
  childrenCount: z.number().int().min(0).default(0),
  pmsReservationId: z.string().optional(),
  confirmationCode: z.string().optional(),
});

// GET /api/reservations — list reservations for the hotel
reservationRoutes.get("/", requireAuth, async (req, res) => {
  try {
    const hotelId = req.user!.hotelId;
    const { date, status } = req.query;

    const where: Record<string, unknown> = { hotelId };

    if (date) {
      const d = new Date(date as string);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.checkInDate = { gte: d, lt: next };
    }

    if (status) {
      where.status = status;
    }

    const reservations = await prisma.reservation.findMany({
      where: where as never,
      include: {
        guest: true,
        checkinSession: {
          select: { id: true, status: true, completedAt: true },
        },
      },
      orderBy: { checkInDate: "asc" },
    });

    res.json(reservations);
  } catch (err) {
    console.error("List reservations error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/reservations/:id
reservationRoutes.get("/:id", requireAuth, async (req, res) => {
  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id: req.params.id, hotelId: req.user!.hotelId },
      include: {
        guest: true,
        checkinSession: {
          include: { payments: true, guestRegistration: true },
        },
      },
    });

    if (!reservation) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }

    res.json(reservation);
  } catch (err) {
    console.error("Get reservation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/reservations — create a reservation manually
reservationRoutes.post("/", requireAuth, async (req, res) => {
  try {
    const data = createReservationSchema.parse(req.body);
    const hotelId = req.user!.hotelId;

    // Create or find guest
    let guest = data.guestEmail
      ? await prisma.guest.findFirst({
          where: { email: data.guestEmail },
        })
      : null;

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          firstName: data.guestFirstName,
          lastName: data.guestLastName,
          email: data.guestEmail,
          phone: data.guestPhone,
        },
      });
    }

    const reservation = await prisma.reservation.create({
      data: {
        hotelId,
        guestId: guest.id,
        pmsReservationId: data.pmsReservationId,
        confirmationCode: data.confirmationCode,
        checkInDate: new Date(data.checkInDate),
        checkOutDate: new Date(data.checkOutDate),
        roomType: data.roomType,
        roomNumber: data.roomNumber,
        adultsCount: data.adultsCount,
        childrenCount: data.childrenCount,
      },
      include: { guest: true },
    });

    res.status(201).json(reservation);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("Create reservation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/reservations/:id/send-checkin — trigger check-in link
reservationRoutes.post("/:id/send-checkin", requireAuth, async (req, res) => {
  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id: req.params.id, hotelId: req.user!.hotelId },
      include: { guest: true },
    });

    if (!reservation) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }

    // Create check-in session if it doesn't exist
    let session = await prisma.checkinSession.findUnique({
      where: { reservationId: reservation.id },
    });

    if (!session) {
      session = await prisma.checkinSession.create({
        data: { reservationId: reservation.id },
      });
    }

    // TODO: Send email/SMS with check-in link using notification service
    // The link would be: ${GUEST_PORTAL_URL}/checkin/${session.token}

    res.json({
      message: "Check-in link sent",
      token: session.token,
      checkinUrl: `${process.env.GUEST_PORTAL_URL || "http://localhost:3001"}/checkin/${session.token}`,
    });
  } catch (err) {
    console.error("Send checkin error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
