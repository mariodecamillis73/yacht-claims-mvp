import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  user,
  yachtAllowed,
  internal,
  mutation,
  HttpError,
  fail,
} from "@/lib/auth";
import { addDocument } from "@/lib/claim-content";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    mutation(request);
    const actor = await user(request);
    const { id } = await context.params;
    if (!internal(actor.role)) throw new HttpError(403, "Yard access required");
    if (!(await db.yacht.findUnique({ where: { hullNumber: id } })))
      throw new HttpError(404, "Yacht not found");
    return NextResponse.json(
      await addDocument(request, null, actor.id, true, id),
      { status: 201 },
    );
  } catch (e) {
    return fail(e);
  }
}
