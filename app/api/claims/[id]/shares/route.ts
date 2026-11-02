import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { claimAccess, mutation, hash, HttpError, fail } from "@/lib/auth";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const a = await claimAccess(request, params.id);
    if (a.actor.role !== "director")
      throw new HttpError(403, "Director required");
    return NextResponse.json(
      await db.claimGrant.findMany({
        where: { claimId: params.id },
        select: {
          id: true,
          email: true,
          role: true,
          expiresAt: true,
          revokedAt: true,
        },
      }),
    );
  } catch (e) {
    return fail(e);
  }
}
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    mutation(request);
    const a = await claimAccess(request, params.id);
    if (a.actor.role !== "director")
      throw new HttpError(403, "Director required");
    const b = z
      .object({
        email: z.string().email().max(254),
        role: z.enum(["supplier", "dealer"]),
        days: z.number().int().min(1).max(90).default(30),
      })
      .safeParse(await request.json());
    if (!b.success) throw new HttpError(400, "Invalid invitation");
    const token = randomBytes(32).toString("hex");
    const g = await db.claimGrant.create({
      data: {
        claimId: params.id,
        email: b.data.email.trim().toLowerCase(),
        role: b.data.role,
        tokenHash: hash(token),
        expiresAt: new Date(Date.now() + b.data.days * 86400000),
        createdBy: a.actor.id,
      },
    });
    return NextResponse.json(
      {
        id: g.id,
        email: g.email,
        expiresAt: g.expiresAt,
        path: `/supplier/${token}`,
      },
      { status: 201 },
    );
  } catch (e) {
    return fail(e);
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    mutation(request);
    const a = await claimAccess(request, params.id);
    if (a.actor.role !== "director")
      throw new HttpError(403, "Director required");
    const b = await request.json();
    if (typeof b.id !== "string")
      throw new HttpError(400, "Invitation id required");
    await db.claimGrant.updateMany({
      where: { id: b.id, claimId: params.id },
      data: { revokedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return fail(e);
  }
}
