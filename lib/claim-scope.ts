import { db } from "./db";
import { internal } from "./auth";
import type { Prisma } from "@prisma/client";
export type ClaimActor = { id: string; role: string; email: string };
export async function claimScope(
  actor: ClaimActor,
): Promise<Prisma.ClaimWhereInput> {
  if (internal(actor.role)) return {};
  if (actor.role === "representative")
    return {
      yachtHullNumber: {
        in: (
          await db.yachtMember.findMany({ where: { userId: actor.id } })
        ).map((m) => m.hullNumber),
      },
    };
  return {
    id: {
      in: (
        await db.claimGrant.findMany({
          where: {
            email: actor.email,
            revokedAt: null,
            expiresAt: { gt: new Date() },
          },
        })
      ).map((g) => g.claimId),
    },
  };
}
