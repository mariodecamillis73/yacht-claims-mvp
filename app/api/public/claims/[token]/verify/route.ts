import { NextResponse } from "next/server";
// Verification codes were retired at the owner's request. The scoped invitation link authorizes access.
export async function POST() {
  return NextResponse.json(
    { error: "Verification codes are no longer required" },
    { status: 410 },
  );
}
