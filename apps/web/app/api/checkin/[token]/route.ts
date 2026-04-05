import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const session = await prisma.checkinSession.findUnique({
    where: { token },
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
    return NextResponse.json(
      { error: "Check-in session not found" },
      { status: 404 }
    );
  }

  if (session.status === "COMPLETED") {
    return NextResponse.json({
      status: "completed",
      message: "You have already completed check-in.",
      hotel: session.reservation.hotel,
    });
  }

  if (session.status === "EXPIRED") {
    return NextResponse.json(
      { error: "This check-in link has expired" },
      { status: 410 }
    );
  }

  if (session.status === "PENDING") {
    await prisma.checkinSession.update({
      where: { id: session.id },
      data: { status: "IN_PROGRESS", startedAt: new Date() },
    });
  }

  return NextResponse.json({
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
}
