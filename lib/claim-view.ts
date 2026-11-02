import { db } from "./db";
export async function claimView(id: string, isInternal: boolean) {
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
      ...(isInternal
        ? {
            warrantyStatus: true,
            validationStatus: true,
            assignedTo: true,
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
  return {
    activity,
    claim,
    comments,
    documents,
    previousClaimId: null,
    nextClaimId: null,
  };
}
