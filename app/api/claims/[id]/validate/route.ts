import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { claimAccess, mutation, HttpError, fail } from "@/lib/auth";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    mutation(request);
    const a = await claimAccess(request, params.id);
    if (a.actor.role !== "director")
      throw new HttpError(403, "Director approval required");
    const b = await request.json();
    if (!["approved", "rejected"].includes(b.decision))
      throw new HttpError(400, "Invalid decision");
    if (
      b.decision === "rejected" &&
      (typeof b.rejectionReason !== "string" || !b.rejectionReason.trim())
    )
      throw new HttpError(400, "Rejection reason required");
    if (
      b.updatedAt !== undefined &&
      (typeof b.updatedAt !== "string" ||
        !Number.isFinite(Date.parse(b.updatedAt)))
    )
      throw new HttpError(400, "Invalid update");
    if (
      b.updatedAt &&
      new Date(b.updatedAt).getTime() !== a.claim.updatedAt.getTime()
    )
      throw new HttpError(409, "The claim changed. Refresh and try again");
    const rejected = b.decision === "rejected";
    const c = await db.$transaction(async (tx) => {
      const changed = await tx.claim.updateMany({
        where: {
          id: params.id,
          validationStatus: "pending",
          updatedAt: a.claim.updatedAt,
        },
        data: {
          updatedAt: new Date(
            Math.max(Date.now(), a.claim.updatedAt.getTime() + 1),
          ),
          validationStatus: b.decision,
          validatedBy: a.actor.id,
          validatedAt: new Date(),
          rejectedReason: rejected ? b.rejectionReason : null,
          rejectedBy: rejected ? a.actor.id : null,
          rejectedAt: rejected ? new Date() : null,
          status: rejected ? "rejected" : "assigned",
          closedAt: rejected ? new Date() : null,
        },
      });
      if (!changed.count)
        throw new HttpError(
          409,
          "Claim has already been validated. Refresh the page",
        );
      const c = await tx.claim.findUniqueOrThrow({ where: { id: params.id } });
      await tx.activityLog.create({
        data: {
          entityType: "claim",
          entityId: params.id,
          claimId: params.id,
          action: b.decision,
          actorId: a.actor.id,
          details: rejected ? b.rejectionReason : "Director approval",
        },
      });
      return c;
    });
    return NextResponse.json({ success: true, claim: c });
  } catch (e) {
    return fail(e);
  }
}
