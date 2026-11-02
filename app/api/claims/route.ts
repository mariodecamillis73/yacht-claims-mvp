import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  user,
  internal,
  yachtAllowed,
  mutation,
  HttpError,
  fail,
} from "@/lib/auth";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const u = await user(request);
    const where = internal(u.role)
      ? {}
      : u.role === "representative"
        ? {
            yachtHullNumber: {
              in: (
                await db.yachtMember.findMany({ where: { userId: u.id } })
              ).map((m) => m.hullNumber),
            },
          }
        : {
            id: {
              in: (
                await db.claimGrant.findMany({
                  where: {
                    email: u.email,
                    revokedAt: null,
                    expiresAt: { gt: new Date() },
                  },
                })
              ).map((g) => g.claimId),
            },
          };
    const query = new URL(request.url).searchParams;
    const filter = query.get("filter") || "all";
    if (!["all", "mine", "overdue", "recent"].includes(filter))
      throw new HttpError(400, "Invalid filter");
    const extra =
      filter === "mine"
        ? { OR: [{ assignedTo: u.id }, { createdBy: u.id }] }
        : filter === "overdue"
          ? {
              dueDate: { lt: new Date() },
              status: { notIn: ["closed", "rejected"] },
            }
          : filter === "recent"
            ? { updatedAt: { gte: new Date(Date.now() - 7 * 86400000) } }
            : {};
    const claims = await db.claim.findMany({
      where: { AND: [where, extra] },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        yachtHullNumber: true,
        createdAt: true,
        updatedAt: true,
        dueDate: true,
        yacht: { select: { name: true } },
        ...(internal(u.role)
          ? {
              validatedBy: true,
              validationStatus: true,
              assignedTo: true,
              supplierId: true,
              warrantyStatus: true,
            }
          : {}),
      },
    });
    return NextResponse.json(claims);
  } catch (e) {
    return fail(e);
  }
}
export async function POST(request: Request) {
  try {
    mutation(request);
    const u = await user(request);
    if (!internal(u.role) && u.role !== "representative")
      throw new HttpError(403, "Not permitted");
    const parsed = z
      .object({
        yachtHullNumber: z.string().min(1),
        title: z.string().trim().min(1).max(250),
        description: z.string().trim().min(1).max(20000),
        priority: z
          .enum(["low", "medium", "high", "critical"])
          .default("medium"),
      })
      .safeParse(await request.json());
    if (!parsed.success) throw new HttpError(400, "Invalid claim fields");
    if (!(await yachtAllowed(u.id, u.role, parsed.data.yachtHullNumber)))
      throw new HttpError(404, "Yacht not found");
    if (
      !(await db.yacht.findUnique({
        where: { hullNumber: parsed.data.yachtHullNumber },
      }))
    )
      throw new HttpError(404, "Yacht not found");
    const c = await db.$transaction(async (tx) => {
      const claim = await tx.claim.create({
        data: { ...parsed.data, createdBy: u.id },
      });
      await tx.activityLog.create({
        data: {
          entityType: "claim",
          entityId: claim.id,
          claimId: claim.id,
          actorId: u.id,
          action: "created",
          details: "Claim submitted for director validation",
        },
      });
      return claim;
    });
    return NextResponse.json(c, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
