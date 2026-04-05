import { Router } from "express";
import { z } from "zod";
import { prisma } from "@repo/database";

export const checkinRoutes = Router();

const submitFormSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

const preferencesSchema = z.object({
  floorPreference: z.enum(["low", "mid", "high"]).optional(),
  bedType: z.enum(["single", "double", "twin", "king"]).optional(),
  pillowType: z.enum(["soft", "firm"]).optional(),
  smokingRoom: z.boolean().optional(),
  earlyCheckIn: z.boolean().optional(),
  lateCheckOut: z.boolean().optional(),
  specialRequests: z.string().optional(),
});

// GET /api/checkin/:token — get check-in session details (guest-facing, no auth)
checkinRoutes.get("/:token", async (req, res) => {
  try {
    const session = await prisma.checkinSession.findUnique({
      where: { token: req.params.token },
      include: {
        reservation: {
          include: {
            hotel: {
              select: {
                name: true,
                logoUrl: true,
                branding: true,
                settings: true,
                city: true,
                country: true,
              },
            },
            guest: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                nationality: true,
                dateOfBirth: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      res.status(404).json({ error: "Check-in session not found" });
      return;
    }

    if (session.status === "COMPLETED") {
      res.json({
        status: "completed",
        message: "You have already completed check-in.",
        hotel: session.reservation.hotel,
      });
      return;
    }

    if (session.status === "EXPIRED") {
      res.status(410).json({ error: "This check-in link has expired" });
      return;
    }

    // Mark as in progress
    if (session.status === "PENDING") {
      await prisma.checkinSession.update({
        where: { id: session.id },
        data: { status: "IN_PROGRESS", startedAt: new Date() },
      });
    }

    res.json({
      status: session.status === "PENDING" ? "IN_PROGRESS" : session.status,
      hotel: session.reservation.hotel,
      reservation: {
        checkInDate: session.reservation.checkInDate,
        checkOutDate: session.reservation.checkOutDate,
        roomType: session.reservation.roomType,
        adultsCount: session.reservation.adultsCount,
        childrenCount: session.reservation.childrenCount,
      },
      guest: session.reservation.guest,
      formData: session.formData,
      preferences: session.preferences,
    });
  } catch (err) {
    console.error("Get checkin session error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/checkin/:token/form — submit guest personal details
checkinRoutes.post("/:token/form", async (req, res) => {
  try {
    const formData = submitFormSchema.parse(req.body);

    const session = await prisma.checkinSession.findUnique({
      where: { token: req.params.token },
      include: { reservation: true },
    });

    if (!session || session.status === "COMPLETED" || session.status === "EXPIRED") {
      res.status(400).json({ error: "Invalid check-in session" });
      return;
    }

    // Update the session form data
    await prisma.checkinSession.update({
      where: { id: session.id },
      data: { formData: formData as never },
    });

    // Update guest record
    if (session.reservation.guestId) {
      await prisma.guest.update({
        where: { id: session.reservation.guestId },
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          nationality: formData.nationality,
          dateOfBirth: formData.dateOfBirth
            ? new Date(formData.dateOfBirth)
            : undefined,
        },
      });
    }

    res.json({ message: "Form submitted successfully" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("Submit form error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/checkin/:token/preferences — submit guest preferences
checkinRoutes.post("/:token/preferences", async (req, res) => {
  try {
    const preferences = preferencesSchema.parse(req.body);

    const session = await prisma.checkinSession.findUnique({
      where: { token: req.params.token },
    });

    if (!session || session.status === "COMPLETED" || session.status === "EXPIRED") {
      res.status(400).json({ error: "Invalid check-in session" });
      return;
    }

    await prisma.checkinSession.update({
      where: { id: session.id },
      data: { preferences: preferences as never },
    });

    res.json({ message: "Preferences saved successfully" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("Submit preferences error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/checkin/:token/complete — mark check-in as complete
checkinRoutes.post("/:token/complete", async (req, res) => {
  try {
    const session = await prisma.checkinSession.findUnique({
      where: { token: req.params.token },
      include: { reservation: { include: { hotel: true } } },
    });

    if (!session || session.status === "COMPLETED" || session.status === "EXPIRED") {
      res.status(400).json({ error: "Invalid check-in session" });
      return;
    }

    // Verify all required steps are done
    if (!session.formData) {
      res.status(400).json({ error: "Personal details not yet submitted" });
      return;
    }

    // Update session and reservation status
    await prisma.$transaction([
      prisma.checkinSession.update({
        where: { id: session.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      }),
      prisma.reservation.update({
        where: { id: session.reservationId },
        data: { status: "CHECKED_IN" },
      }),
    ]);

    // TODO: Sync check-in status back to PMS via connector
    // TODO: Send confirmation notification to guest

    res.json({ message: "Check-in completed successfully!" });
  } catch (err) {
    console.error("Complete checkin error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
