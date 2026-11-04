import { db } from "./db";
import { claimScope, ClaimActor } from "./claim-scope";
export async function claimView(
  id: string,
  isInternal: boolean,
  actor?: ClaimActor,
) {
  const claim = await db.claim.findUnique({
    where: { id },
    select: {
      id: true,
      yachtHullNumber: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      createdAt: true,
      updatedAt: true,
      closedAt: true,
      dueDate: true,
      ...(isInternal
        ? {
            warrantyStatus: true,
            validationStatus: true,
            assignedTo: true,
            supplierId: true,
            validatedBy: true,
            rejectedReason: true,
          }
        : {}),
    },
  });
  const comments = await db.comment.findMany({
    where: { claimId: id, ...(isInternal ? {} : { visibility: "shared" }) },
    orderBy: { createdAt: "asc" },
  });
  const documents = await db.document.findMany({
    where: { claimId: id, ...(isInternal ? {} : { visibility: "shared" }) },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      visibility: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
  const activity = isInternal
    ? await db.activityLog.findMany({
        where: { claimId: id },
        select: { id: true, action: true, details: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      })
    : [];
  const neighbors =
    actor && claim
      ? await db.claim.findMany({
          where: await claimScope(actor),
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          select: { id: true },
        })
      : [];
  const index = neighbors.findIndex((item) => item.id === id);
  return {
    activity,
    claim,
    comments,
    documents,
    previousClaimId: index > 0 ? neighbors[index - 1].id : null,
    nextClaimId:
      index >= 0 && index + 1 < neighbors.length
        ? neighbors[index + 1].id
        : null,
  };
}
