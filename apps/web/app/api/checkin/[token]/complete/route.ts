import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const session = await prisma.checkinSession.findUnique({
    where: { token },
    include: { reservation: { include: { hotel: true } } },
  });

  if (
    !session ||
    session.status === "COMPLETED" ||
    session.status === "EXPIRED"
  ) {
    return NextResponse.json(
      { error: "Invalid check-in session" },
      { status: 400 }
    );
  }

  if (!session.formData) {
    return NextResponse.json(
      { error: "Personal details not yet submitted" },
      { status: 400 }
    );
  }

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

  return NextResponse.json({ message: "Check-in completed successfully!" });
}
