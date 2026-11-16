import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, internal, mutation, HttpError, fail } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { yachtResponse } from "@/lib/yacht-profile";
import { yachtInput, yachtData } from "@/lib/yacht-input";
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
    return NextResponse.json(rows.map(yachtResponse));
  } catch (e) {
    return fail(e);
  }
}
export async function POST(request: Request) {
  try {
    mutation(request);
    const u = await user(request);
    if (!internal(u.role)) throw new HttpError(403, "Not permitted");
    const b = yachtInput.safeParse(await request.json());
    if (!b.success) throw new HttpError(400, "Invalid yacht fields");
    const data = yachtData(b.data);
    const yacht = await db.$transaction(async (tx) => {
      const yacht = await tx.yacht.create({ data });
      await tx.activityLog.create({
        data: {
          entityType: "yacht",
          entityId: yacht.hullNumber,
          actorId: u.id,
          action: "created",
          details: "Yacht registered",
        },
      });
      return yacht;
    });
    return NextResponse.json(yachtResponse(yacht), { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return fail(
        new HttpError(409, "A yacht with this hull number already exists"),
      );
    return fail(e);
  }
}
