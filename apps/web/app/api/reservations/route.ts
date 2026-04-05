import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { getSession } from "../../lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { hotelId: session.hotelId };

  if (date) {
    const d = new Date(date);
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

  return NextResponse.json(reservations);
}

const createSchema = z.object({
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

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    let guest = data.guestEmail
      ? await prisma.guest.findFirst({ where: { email: data.guestEmail } })
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
        hotelId: session.hotelId,
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

    return NextResponse.json(reservation, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
