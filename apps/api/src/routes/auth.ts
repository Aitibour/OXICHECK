import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@repo/database";
import { signToken } from "../middleware/auth.js";

export const authRoutes = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  hotelSlug: z.string(),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string(),
  hotelName: z.string(),
  hotelSlug: z.string(),
});

// POST /api/auth/login
authRoutes.post("/login", async (req, res) => {
  try {
    const { email, password, hotelSlug } = loginSchema.parse(req.body);

    const hotel = await prisma.hotel.findUnique({ where: { slug: hotelSlug } });
    if (!hotel) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }

    const user = await prisma.hotelUser.findUnique({
      where: { hotelId_email: { hotelId: hotel.id, email } },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({
      userId: user.id,
      hotelId: hotel.id,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      hotel: {
        id: hotel.id,
        name: hotel.name,
        slug: hotel.slug,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/register
authRoutes.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingHotel = await prisma.hotel.findUnique({
      where: { slug: data.hotelSlug },
    });
    if (existingHotel) {
      res.status(409).json({ error: "Hotel slug already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const hotel = await prisma.hotel.create({
      data: {
        name: data.hotelName,
        slug: data.hotelSlug,
        users: {
          create: {
            email: data.email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            role: "ADMIN",
          },
        },
      },
      include: { users: true },
    });

    const user = hotel.users[0]!;
    const token = signToken({
      userId: user.id,
      hotelId: hotel.id,
      role: user.role,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      hotel: {
        id: hotel.id,
        name: hotel.name,
        slug: hotel.slug,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
