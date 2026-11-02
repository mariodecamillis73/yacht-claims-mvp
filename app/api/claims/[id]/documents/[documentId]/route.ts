import { claimAccess, fail } from "@/lib/auth";
import { documentResponse } from "@/lib/claim-content";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: { id: string; documentId: string } },
) {
  try {
    const a = await claimAccess(request, params.id);
    const id = params.id;
    const actor = a.actor.id;
    const inside = a.isInternal;
    return await documentResponse(id, params.documentId, inside);
  } catch (e) {
    return fail(e);
  }
}
