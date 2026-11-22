import { NextResponse } from "next/server";
import { claimAccess, mutation, HttpError, fail } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    mutation(request);
    const { id } = await context.params;
    const access = await claimAccess(request, id);
    if (!access.isInternal) throw new HttpError(403, "Not permitted");
    // Viewing a claim does not change its last operational update or edit version.
    await db.$executeRaw`UPDATE "Claim" SET "teamUnread" = false WHERE id = ${id} AND "teamUnread" = true`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return fail(error);
  }
}
