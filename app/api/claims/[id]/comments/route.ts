import { NextResponse } from "next/server";
import { claimAccess, mutation, fail } from "@/lib/auth";
import { addComment } from "@/lib/claim-content";
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    mutation(request);
    const a = await claimAccess(request, params.id);
    const id = params.id;
    const actor = a.actor.id;
    const inside = a.isInternal;
    return NextResponse.json(await addComment(request, id, actor, inside), {
      status: 201,
    });
  } catch (e) {
    return fail(e);
  }
}
