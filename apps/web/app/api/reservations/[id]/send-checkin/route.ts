import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const reservation = await prisma.reservation.findFirst({
    where: { id, hotelId: session.hotelId },
    include: { guest: true },
  });

  if (!reservation) {
    return NextResponse.json(
      { error: "Reservation not found" },
      { status: 404 }
    );
  }

  let checkinSession = await prisma.checkinSession.findUnique({
    where: { reservationId: reservation.id },
  });

  if (!checkinSession) {
    checkinSession = await prisma.checkinSession.create({
      data: { reservationId: reservation.id },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return NextResponse.json({
    message: "Check-in link generated",
    token: checkinSession.token,
    checkinUrl: `${baseUrl}/checkin/${checkinSession.token}`,
  });
}
