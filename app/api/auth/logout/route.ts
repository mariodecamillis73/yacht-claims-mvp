import { NextResponse } from "next/server";
import { COOKIE, GUEST_COOKIE, mutation, fail } from "@/lib/auth";
export async function POST(request: Request) {
  try {
    mutation(request);
    const r = NextResponse.json({ success: true });
    r.cookies.set(COOKIE, "", { maxAge: 0, path: "/" });
    r.cookies.set(GUEST_COOKIE, "", { maxAge: 0, path: "/" });
    return r;
  } catch (e) {
    return fail(e);
  }
}
