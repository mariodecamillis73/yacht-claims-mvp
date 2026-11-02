import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { db } from "@/lib/db";
import {
  hash,
  mutation,
  HttpError,
  fail,
  signToken,
  sessionCookie,
  GUEST_COOKIE,
} from "@/lib/auth";
import { sendCode } from "@/lib/mail";
export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const params = await context.params;
  try {
    mutation(request);
    const g = await db.claimGrant.findUnique({
      where: { tokenHash: hash(params.token) },
    });
    if (!g || g.revokedAt || g.expiresAt <= new Date())
      throw new HttpError(404, "Invitation unavailable");
    const b = await request.json();
    if (b.code === undefined) {
      const now = new Date();
      const code = String(randomInt(100000, 1000000));
      const reserved = await db.claimGrant.updateMany({
        where: {
          id: g.id,
          revokedAt: null,
          OR: [
            { codeSentAt: null },
            { codeSentAt: { lt: new Date(Date.now() - 60000) } },
          ],
        },
        data: {
          codeHash: hash(g.id + code),
          codeExpiresAt: new Date(Date.now() + 600000),
          codeSentAt: now,
          attempts: 0,
        },
      });
      if (!reserved.count)
        throw new HttpError(
          429,
          "Wait one minute before requesting another code",
        );
      try {
        await sendCode(g.email, code);
      } catch {
        await db.claimGrant.updateMany({
          where: { id: g.id, codeSentAt: now },
          data: { codeHash: null, codeExpiresAt: null },
        });
        throw new HttpError(503, "Unable to deliver verification email");
      }
      return NextResponse.json({ sent: true });
    }
    if (typeof b.code !== "string" || !/^\d{6}$/.test(b.code))
      throw new HttpError(400, "Enter a six digit code");
    // Reserve an attempt atomically before comparing or consuming the code.
    const attempt = await db.claimGrant.updateMany({
      where: {
        id: g.id,
        revokedAt: null,
        codeHash: { not: null },
        codeExpiresAt: { gt: new Date() },
        attempts: { lt: 5 },
      },
      data: { attempts: { increment: 1 } },
    });
    if (!attempt.count || g.codeHash !== hash(g.id + b.code))
      throw new HttpError(401, "Invalid or expired code");
    const consumed = await db.claimGrant.updateMany({
      where: {
        id: g.id,
        codeHash: g.codeHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { codeHash: null, codeExpiresAt: null },
    });
    if (!consumed.count) throw new HttpError(401, "Code already used");
    const response = NextResponse.json({ verified: true });
    sessionCookie(
      response,
      GUEST_COOKIE,
      signToken({ sub: g.id, kind: "grant" }),
    );
    return response;
  } catch (e) {
    return fail(e);
  }
}
