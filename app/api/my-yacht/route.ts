import { NextResponse } from "next/server";
import { user, fail, HttpError } from "@/lib/auth";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const u = await user(request);
    if (u.role !== "representative")
      throw new HttpError(403, "Representative access required");
    const members = await db.yachtMember.findMany({ where: { userId: u.id } });
    const yachts = await db.yacht.findMany({
      where: { hullNumber: { in: members.map((m) => m.hullNumber) } },
      include: {
        claims: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            updatedAt: true,
          },
        },
      },
    });
    return NextResponse.json({ yachts });
  } catch (e) {
    return fail(e);
  }
}
