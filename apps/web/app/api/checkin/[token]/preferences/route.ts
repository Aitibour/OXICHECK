import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/db";

const preferencesSchema = z.object({
  floorPreference: z.enum(["low", "mid", "high"]).optional(),
  bedType: z.enum(["single", "double", "twin", "king"]).optional(),
  pillowType: z.enum(["soft", "firm"]).optional(),
  smokingRoom: z.boolean().optional(),
  earlyCheckIn: z.boolean().optional(),
  lateCheckOut: z.boolean().optional(),
  specialRequests: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();
    const preferences = preferencesSchema.parse(body);

    const session = await prisma.checkinSession.findUnique({
      where: { token },
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
      data: { preferences: preferences as never },
    });

    return NextResponse.json({ message: "Preferences saved successfully" });
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
