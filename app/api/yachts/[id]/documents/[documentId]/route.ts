import { user, yachtAllowed, internal, HttpError, fail } from "@/lib/auth";
import { documentResponse } from "@/lib/claim-content";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; documentId: string }> },
) {
  try {
    const actor = await user(request);
    const { id, documentId } = await context.params;
    if (
      (!internal(actor.role) && actor.role !== "representative") ||
      !(await yachtAllowed(actor.id, actor.role, id))
    )
      throw new HttpError(404, "Yacht not found");
    return await documentResponse(null, documentId, internal(actor.role), id);
  } catch (e) {
    return fail(e);
  }
}
