import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../../lib/db";
import { signToken } from "../../../lib/auth";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string(),
  hotelName: z.string(),
  hotelSlug: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.hotel.findUnique({
      where: { slug: data.hotelSlug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Hotel slug already exists" },
        { status: 409 }
      );
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

    const response = NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        hotel: { id: hotel.id, name: hotel.name, slug: hotel.slug },
      },
      { status: 201 }
    );

    response.cookies.set("oxicheck-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: err.errors },
        { status: 400 }
      );
    }
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
