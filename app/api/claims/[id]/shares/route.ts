import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { claimAccess, mutation, hash, HttpError, fail } from "@/lib/auth";
import { sendClaimInvitation, CLAIM_SENDER } from "@/lib/mail";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
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
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
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
        sendEmail: z.boolean().default(false),
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
    const path = `/supplier/${token}`;
    if (b.data.sendEmail) {
      try {
        const origin = process.env.APP_URL || new URL(request.url).origin;
        if (
          process.env.NODE_ENV === "production" &&
          !origin.startsWith("https://")
        )
          throw new HttpError(503, "Email delivery is not configured");
        await sendClaimInvitation(
          g.email,
          a.claim.title,
          new URL(path, origin).toString(),
          g.expiresAt,
        );
      } catch (e) {
        await db.claimGrant.update({
          where: { id: g.id },
          data: { revokedAt: new Date() },
        });
        throw e;
      }
    }
    return NextResponse.json(
      {
        id: g.id,
        email: g.email,
        expiresAt: g.expiresAt,
        path,
        emailSent: b.data.sendEmail,
        sender: CLAIM_SENDER,
      },
      { status: 201 },
    );
  } catch (e) {
    return fail(e);
  }
}
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
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
