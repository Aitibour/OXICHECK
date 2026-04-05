import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ hotelSlug: string }> }
) {
  const { hotelSlug } = await params;

  const hotel = await prisma.hotel.findUnique({
    where: { slug: hotelSlug },
  });

  if (!hotel) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
  }

  const config = hotel.pmsConfig as Record<string, string> | null;
  if (config?.webhookSecret) {
    const secret = req.headers.get("x-webhook-secret");
    if (secret !== config.webhookSecret) {
      return NextResponse.json(
        { error: "Invalid webhook secret" },
        { status: 401 }
      );
    }
  }

  const body = await req.json();
  const { type, data } = body;

  switch (type) {
    case "reservation.created":
    case "reservation.updated": {
      await prisma.reservation.upsert({
        where: {
          hotelId_pmsReservationId: {
            hotelId: hotel.id,
            pmsReservationId: data.reservationId,
          },
        },
        create: {
          hotelId: hotel.id,
          pmsReservationId: data.reservationId,
          confirmationCode: data.confirmationCode,
          checkInDate: new Date(data.checkInDate),
          checkOutDate: new Date(data.checkOutDate),
          roomType: data.roomType,
          roomNumber: data.roomNumber,
          adultsCount: data.adultsCount || 1,
          childrenCount: data.childrenCount || 0,
          syncedAt: new Date(),
        },
        update: {
          confirmationCode: data.confirmationCode,
          checkInDate: new Date(data.checkInDate),
          checkOutDate: new Date(data.checkOutDate),
          roomType: data.roomType,
          roomNumber: data.roomNumber,
          syncedAt: new Date(),
        },
      });
      break;
    }

    case "reservation.cancelled": {
      await prisma.reservation.updateMany({
        where: {
          hotelId: hotel.id,
          pmsReservationId: data.reservationId,
        },
        data: { status: "CANCELLED" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
