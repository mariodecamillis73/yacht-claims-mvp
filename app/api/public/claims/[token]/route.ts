import { NextResponse } from "next/server";
import { guestAccess, fail } from "@/lib/auth";
import { claimView } from "@/lib/claim-view";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: { token: string } },
) {
  try {
    const g = await guestAccess(request, params.token);
    return NextResponse.json(await claimView(g.claimId, false));
  } catch (e) {
    return fail(e);
  }
}
