import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/db";

const formSchema = z.object({
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();
    const formData = formSchema.parse(body);

    const session = await prisma.checkinSession.findUnique({
      where: { token },
      include: { reservation: true },
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

    await prisma.checkinSession.update({
      where: { id: session.id },
      data: { formData: formData as never },
    });

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

    return NextResponse.json({ message: "Form submitted successfully" });
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
