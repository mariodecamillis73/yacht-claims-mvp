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
    return NextResponse.json(await claimView(params.id, a.isInternal, a.actor));
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
        updatedAt: z.string().datetime().optional(),
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
    const { updatedAt, ...changes } = p.data;
    if (
      updatedAt &&
      new Date(updatedAt).getTime() !== a.claim.updatedAt.getTime()
    )
      throw new HttpError(409, "The claim changed. Refresh and try again");
    if (!Object.keys(changes).length)
      throw new HttpError(400, "No changes supplied");
    if (
      changes.dueDate &&
      (!Number.isFinite(Date.parse(changes.dueDate)) ||
        new Date(changes.dueDate).toISOString().slice(0, 10) !==
          changes.dueDate)
    )
      throw new HttpError(400, "Invalid deadline");
    if (
      changes.assignedTo &&
      !(await db.user.findFirst({
        where: {
          id: changes.assignedTo,
          isActive: true,
          role: { in: ["director", "staff"] },
        },
      }))
    )
      throw new HttpError(400, "Choose an active yard team member");
    if (
      changes.supplierId &&
      !(await db.supplier.findUnique({ where: { id: changes.supplierId } }))
    )
      throw new HttpError(400, "Supplier not found");
    if (changes.status && a.claim.validationStatus !== "approved")
      throw new HttpError(409, "Director approval required");
    if (
      changes.status &&
      !nextStatuses(a.claim.status, a.claim.validationStatus).includes(
        changes.status,
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
          ...changes,
          updatedAt: new Date(
            Math.max(Date.now(), a.claim.updatedAt.getTime() + 1),
          ),
          ...(changes.dueDate !== undefined
            ? {
                dueDate: changes.dueDate
                  ? new Date(changes.dueDate + "T23:59:59.999Z")
                  : null,
              }
            : {}),
          ...(changes.status
            ? { closedAt: changes.status === "closed" ? new Date() : null }
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
          action: changes.status ? "status_changed" : "updated",
          details: changes.status
            ? `${STATUS_LABELS[a.claim.status] || a.claim.status} → ${STATUS_LABELS[changes.status]}`
            : "Claim fields updated: " + Object.keys(changes).join(", "),
        },
      });
      return claim;
    });
    return NextResponse.json(c);
  } catch (e) {
    return fail(e);
  }
}
