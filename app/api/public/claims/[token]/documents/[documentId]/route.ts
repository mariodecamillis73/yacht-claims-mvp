import { guestAccess, fail } from "@/lib/auth";
import { documentResponse } from "@/lib/claim-content";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: { token: string; documentId: string } },
) {
  try {
    const a = await guestAccess(request, params.token);
    const id = a.claimId;
    const actor = "guest:" + a.email;
    const inside = false;
    return await documentResponse(id, params.documentId, inside);
  } catch (e) {
    return fail(e);
  }
}
