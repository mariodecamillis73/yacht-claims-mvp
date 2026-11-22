import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  COOKIE,
  HttpError,
  fail,
  mutation,
  sessionCookie,
  signToken,
  hash,
} from "@/lib/auth";
export async function POST(request: Request) {
  try {
    mutation(request);
    const body = await request.json();
    if (
      typeof body.email !== "string" ||
      typeof body.password !== "string" ||
      body.password.length > 200 ||
      body.email.length > 254
    )
      throw new HttpError(400, "Email and password required");
    const email = body.email.trim().toLowerCase();
    const now = new Date();
    await db.loginAttempt.upsert({
      where: { email },
      create: { email, failures: 0 },
      update: {},
    });
    await db.loginAttempt.updateMany({
      where: { email, windowStart: { lte: new Date(now.getTime() - 900000) } },
      data: { failures: 0, windowStart: now },
    });
    const attempt = await db.loginAttempt.updateMany({
      where: { email, failures: { lt: 10 } },
      data: { failures: { increment: 1 } },
    });
    if (!attempt.count)
      throw new HttpError(429, "Too many attempts. Try again in 15 minutes");
    const actor = await db.user.findUnique({ where: { email } });
    const valid = await bcrypt.compare(
      body.password,
      actor?.passwordHash ||
        "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
    );
    if (!actor?.isActive || !valid)
      throw new HttpError(401, "Invalid credentials");
    await db.loginAttempt.deleteMany({ where: { email } });
    const response = NextResponse.json({
      user: {
        id: actor.id,
        email: actor.email,
        role: actor.role,
        language: actor.language,
      },
    });
    sessionCookie(response, COOKIE, signToken({ sub: actor.id, kind: "user", credentialVersion: hash(actor.passwordHash) }));
    return response;
  } catch (e) {
    return fail(e);
  }
}
