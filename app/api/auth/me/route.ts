import { NextResponse } from "next/server";
import { user, fail } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const u = await user(request);
    return NextResponse.json({ id: u.id, email: u.email, role: u.role });
  } catch (e) {
    return fail(e);
  }
}
