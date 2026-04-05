import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hotelId = session.hotelId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayArrivals, completedCheckins, pendingCheckins, totalReservations] =
    await Promise.all([
      prisma.reservation.count({
        where: { hotelId, checkInDate: { gte: today, lt: tomorrow } },
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
          reservation: {
            hotelId,
            checkInDate: { gte: today, lt: tomorrow },
          },
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
      }),
      prisma.reservation.count({
        where: { hotelId, status: "CONFIRMED" },
      }),
    ]);

  return NextResponse.json({
    todayArrivals,
    completedCheckins,
    pendingCheckins,
    totalReservations,
  });
}
