import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, internal, mutation, HttpError, fail } from "@/lib/auth";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const u = await user(request);
    if (!internal(u.role) && u.role !== "representative")
      throw new HttpError(403, "Not permitted");
    const rows = await db.yacht.findMany({
      where: internal(u.role)
        ? {}
        : {
            hullNumber: {
              in: (
                await db.yachtMember.findMany({ where: { userId: u.id } })
              ).map((m) => m.hullNumber),
            },
          },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(rows);
  } catch (e) {
    return fail(e);
  }
}
export async function POST(request: Request) {
  try {
    mutation(request);
    const u = await user(request);
    if (!internal(u.role)) throw new HttpError(403, "Not permitted");
    const b = z
      .object({
        hullNumber: z.string().min(1).max(50),
        name: z.string().min(1).max(200),
        yearBuilt: z.number().int().min(1900).max(2200),
        ownerId: z.string().min(1),
        captainName: z.string().max(200),
      })
      .safeParse(await request.json());
    if (!b.success) throw new HttpError(400, "Invalid yacht fields");
    return NextResponse.json(await db.yacht.create({ data: b.data }), {
      status: 201,
    });
  } catch (e) {
    return fail(e);
  }
}
