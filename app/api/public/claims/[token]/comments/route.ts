import { NextResponse } from "next/server";
import { guestAccess, mutation, fail } from "@/lib/auth";
import { addComment } from "@/lib/claim-content";
export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const params = await context.params;
  try {
    mutation(request);
    const a = await guestAccess(request, params.token);
    const id = a.claimId;
    const actor = "guest:" + a.email;
    const inside = false;
    return NextResponse.json(await addComment(request, id, actor, inside), {
      status: 201,
    });
  } catch (e) {
    return fail(e);
  }
}
