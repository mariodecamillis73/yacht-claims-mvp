import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, yachtAllowed, internal, HttpError, fail } from "@/lib/auth";
import { yachtResponse } from "@/lib/yacht-profile";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    const u = await user(request);
    if (!internal(u.role) && u.role !== "representative")
      throw new HttpError(404, "Yacht not found");
    if (!(await yachtAllowed(u.id, u.role, params.id)))
      throw new HttpError(404, "Yacht not found");
    const y = await db.yacht.findUnique({
      where: { hullNumber: params.id },
      include: {
        claims: {
          select: { id: true, title: true, status: true, priority: true },
        },
      },
    });
    if (!y) throw new HttpError(404, "Yacht not found");
    return NextResponse.json({
      ...yachtResponse(y),
      id: y.hullNumber,
      yachtNumber: y.hullNumber,
      documents: [],
    });
  } catch (e) {
    return fail(e);
  }
}
