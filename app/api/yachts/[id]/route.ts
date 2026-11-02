import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  user,
  yachtAllowed,
  internal,
  mutation,
  HttpError,
  fail,
} from "@/lib/auth";
import { yachtResponse } from "@/lib/yacht-profile";
import { yachtInput, yachtData } from "@/lib/yacht-input";
import { z } from "zod";
import { Prisma } from "@prisma/client";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    const u = await user(request);
    if (!internal(u.role) && u.role !== "representative")
      throw new HttpError(404, "Yacht not found");
    if (!(await yachtAllowed(u.id, u.role, params.id)))
      throw new HttpError(404, "Yacht not found");
    const y = await db.yacht.findUnique({
      where: { hullNumber: params.id },
      include: {
        claims: {
          select: { id: true, title: true, status: true, priority: true },
        },
      },
    });
    if (!y) throw new HttpError(404, "Yacht not found");
    return NextResponse.json({
      ...yachtResponse(y),
      id: y.hullNumber,
      yachtNumber: y.hullNumber,
      documents: [],
    });
  } catch (e) {
    return fail(e);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    mutation(request);
    const actor = await user(request);
    if (actor.role !== "director")
      throw new HttpError(403, "Administrator access required");
    const { id } = await context.params;
    const parsed = yachtInput
      .extend({ updatedAt: z.string().datetime() })
      .strict()
      .safeParse(await request.json());
    if (!parsed.success) throw new HttpError(400, "Invalid yacht fields");
    const { updatedAt, ...input } = parsed.data;
    const data = yachtData(input);
    const yacht = await db.$transaction(async (tx) => {
      const original = await tx.yacht.findUnique({ where: { hullNumber: id } });
      if (!original) throw new HttpError(404, "Yacht not found");
      const changed = await tx.yacht.updateMany({
        where: { hullNumber: id, updatedAt: new Date(updatedAt) },
        data,
      });
      if (!changed.count)
        throw new HttpError(
          409,
          "This yacht was changed by another session. Reload before saving",
        );
      if (data.hullNumber !== id) {
        // Claims follow the database FK cascade; these legacy references have no FK.
        await tx.yachtMember.updateMany({
          where: { hullNumber: id },
          data: { hullNumber: data.hullNumber },
        });
        await tx.document.updateMany({
          where: { yachtId: id },
          data: { yachtId: data.hullNumber },
        });
        await tx.activityLog.updateMany({
          where: { entityType: "yacht", entityId: id },
          data: { entityId: data.hullNumber },
        });
      }
      await tx.activityLog.create({
        data: {
          entityType: "yacht",
          entityId: data.hullNumber,
          actorId: actor.id,
          action: "updated",
          details:
            data.hullNumber === id
              ? "Yacht details updated by administrator"
              : `Yacht details updated; hull number ${id} → ${data.hullNumber}`,
        },
      });
      return tx.yacht.findUniqueOrThrow({
        where: { hullNumber: data.hullNumber },
      });
    });
    return NextResponse.json(yachtResponse(yacht));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return fail(
        new HttpError(409, "A yacht with this hull number already exists"),
      );
    return fail(e);
  }
}
