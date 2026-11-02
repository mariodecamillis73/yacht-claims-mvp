import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { claimAccess, mutation, HttpError, fail } from "@/lib/auth";
import { claimView } from "@/lib/claim-view";
import { z } from "zod";
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
        title: z.string().min(1).max(250).optional(),
        description: z.string().min(1).max(20000).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        status: z
          .enum(["assigned", "in_progress", "supplier_pending", "closed"])
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
    if (p.data.status && a.claim.validationStatus !== "approved")
      throw new HttpError(409, "Director approval required");
    const c = await db.claim.update({
      where: { id: params.id },
      data: {
        ...p.data,
        ...(p.data.status
          ? { closedAt: p.data.status === "closed" ? new Date() : null }
          : {}),
      },
    });
    return NextResponse.json(c);
  } catch (e) {
    return fail(e);
  }
}
