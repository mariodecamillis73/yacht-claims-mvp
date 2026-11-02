import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { claimAccess, mutation, HttpError, fail } from "@/lib/auth";
import { claimView } from "@/lib/claim-view";
import { z } from "zod";
import { nextStatuses, STATUS_LABELS } from "@/lib/claim-workflow";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    const a = await claimAccess(request, params.id);
    return NextResponse.json(await claimView(params.id, a.isInternal));
  } catch (e) {
    return fail(e);
  }
}
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    mutation(request);
    const a = await claimAccess(request, params.id);
    if (!a.isInternal) throw new HttpError(403, "Not permitted");
    const p = z
      .object({
        title: z.string().trim().min(1).max(250).optional(),
        description: z.string().trim().min(1).max(20000).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        status: z
          .enum(["assigned", "in_progress", "supplier_pending", "closed"])
          .optional(),
        dueDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .nullable()
          .optional(),
        assignedTo: z.string().nullable().optional(),
        supplierId: z.string().nullable().optional(),
        warrantyStatus: z
          .enum(["pending", "covered", "not_covered", "goodwill"])
          .optional(),
      })
      .strict()
      .safeParse(await request.json());
    if (!p.success) throw new HttpError(400, "Invalid update");
    if (!Object.keys(p.data).length)
      throw new HttpError(400, "No changes supplied");
    if (
      p.data.dueDate &&
      (!Number.isFinite(Date.parse(p.data.dueDate)) ||
        new Date(p.data.dueDate).toISOString().slice(0, 10) !== p.data.dueDate)
    )
      throw new HttpError(400, "Invalid deadline");
    if (
      p.data.assignedTo &&
      !(await db.user.findFirst({
        where: {
          id: p.data.assignedTo,
          isActive: true,
          role: { in: ["director", "staff"] },
        },
      }))
    )
      throw new HttpError(400, "Choose an active yard team member");
    if (
      p.data.supplierId &&
      !(await db.supplier.findUnique({ where: { id: p.data.supplierId } }))
    )
      throw new HttpError(400, "Supplier not found");
    if (p.data.status && a.claim.validationStatus !== "approved")
      throw new HttpError(409, "Director approval required");
    if (
      p.data.status &&
      !nextStatuses(a.claim.status, a.claim.validationStatus).includes(
        p.data.status,
      )
    )
      throw new HttpError(409, "This status change is not allowed");
    const c = await db.$transaction(async (tx) => {
      const changed = await tx.claim.updateMany({
        where: {
          id: params.id,
          updatedAt: a.claim.updatedAt,
          validationStatus: a.claim.validationStatus,
          status: a.claim.status,
        },
        data: {
          ...p.data,
          ...(p.data.dueDate !== undefined
            ? {
                dueDate: p.data.dueDate
                  ? new Date(p.data.dueDate + "T23:59:59.999Z")
                  : null,
              }
            : {}),
          ...(p.data.status
            ? { closedAt: p.data.status === "closed" ? new Date() : null }
            : {}),
        },
      });
      if (!changed.count)
        throw new HttpError(409, "The claim changed. Refresh and try again");
      const claim = await tx.claim.findUniqueOrThrow({
        where: { id: params.id },
      });
      await tx.activityLog.create({
        data: {
          entityType: "claim",
          entityId: params.id,
          claimId: params.id,
          actorId: a.actor.id,
          action: p.data.status ? "status_changed" : "updated",
          details: p.data.status
            ? `${STATUS_LABELS[a.claim.status] || a.claim.status} → ${STATUS_LABELS[p.data.status]}`
            : "Claim fields updated: " + Object.keys(p.data).join(", "),
        },
      });
      return claim;
    });
    return NextResponse.json(c);
  } catch (e) {
    return fail(e);
  }
}
