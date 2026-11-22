import { NextResponse } from "next/server";
import { readinessDb } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await readinessDb.user.count();
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
