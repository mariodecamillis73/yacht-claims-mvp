import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, internal, HttpError, fail } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const actor = await user(request);
    if (!internal(actor.role)) throw new HttpError(403, "Yard access required");
    return NextResponse.json(
      await db.user.findMany({
        where: { isActive: true, role: { in: ["director", "staff"] } },
        select: { id: true, firstName: true, lastName: true },
        orderBy: { firstName: "asc" },
      }),
    );
  } catch (e) {
    return fail(e);
  }
}
