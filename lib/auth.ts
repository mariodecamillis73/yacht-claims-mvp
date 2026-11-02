import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { db } from "./db";
import { NextResponse } from "next/server";
export const COOKIE = "yy_session";
export const GUEST_COOKIE = "yy_claim_session";
export const internal = (role: string) => ["director", "staff"].includes(role);
function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32)
    throw new Error("JWT_SECRET must contain at least 32 characters");
  return value;
}
export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function signToken(payload: Record<string, unknown>) {
  return jwt.sign(payload, secret(), { expiresIn: "8h", algorithm: "HS256" });
}
export function verifyToken(token: string) {
  return jwt.verify(token, secret(), {
    algorithms: ["HS256"],
  }) as jwt.JwtPayload;
}
export function getBearerToken(header?: string) {
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}
export function cookie(request: Request, key: string) {
  return request.headers
    .get("cookie")
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(key + "="))
    ?.slice(key.length + 1);
}
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function fail(error: unknown) {
  return NextResponse.json(
    {
      error:
        error instanceof HttpError
          ? error.message
          : "Unable to complete request",
    },
    {
      status: error instanceof HttpError ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
export function mutation(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.APP_URL
    ? new URL(process.env.APP_URL).origin
    : new URL(request.url).origin;
  if (origin && origin !== expected) throw new HttpError(403, "Invalid origin");
}
export async function user(request: Request) {
  const token =
    cookie(request, COOKIE) ||
    getBearerToken(request.headers.get("authorization") ?? undefined);
  if (!token) throw new HttpError(401, "Sign in required");
  let payload: jwt.JwtPayload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new HttpError(401, "Session expired");
  }
  if (payload.kind !== "user" || !payload.sub)
    throw new HttpError(401, "Invalid session");
  const result = await db.user.findUnique({ where: { id: payload.sub } });
  if (!result?.isActive) throw new HttpError(401, "Account unavailable");
  if (payload.credentialVersion !== hash(result.passwordHash))
    throw new HttpError(401, "Sign in again after credential update");
  return result;
}
export async function yachtAllowed(
  userId: string,
  role: string,
  hullNumber: string,
) {
  return (
    internal(role) ||
    !!(await db.yachtMember.findUnique({
      where: { userId_hullNumber: { userId, hullNumber } },
    }))
  );
}
export async function claimAccess(request: Request, id: string) {
  const actor = await user(request);
  const claim = await db.claim.findUnique({ where: { id } });
  if (!claim) throw new HttpError(404, "Claim not found");
  const member =
    actor.role === "representative" &&
    (await yachtAllowed(actor.id, actor.role, claim.yachtHullNumber));
  const grant =
    ["supplier", "dealer"].includes(actor.role) &&
    (await db.claimGrant.findFirst({
      where: {
        claimId: id,
        email: actor.email,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    }));
  if (!internal(actor.role) && !member && !grant)
    throw new HttpError(404, "Claim not found");
  return { actor, claim, isInternal: internal(actor.role) };
}
export async function guestAccess(request: Request, token: string) {
  const grant = await db.claimGrant.findUnique({
    where: { tokenHash: hash(token) },
  });
  if (!grant || grant.revokedAt || grant.expiresAt <= new Date())
    throw new HttpError(404, "Invitation unavailable");
  const session = cookie(request, GUEST_COOKIE);
  let payload: jwt.JwtPayload;
  try {
    payload = verifyToken(session || "");
  } catch {
    throw new HttpError(401, "Email verification required");
  }
  if (payload.kind !== "grant" || payload.sub !== grant.id)
    throw new HttpError(401, "Email verification required");
  return grant;
}
export function sessionCookie(
  response: NextResponse,
  name: string,
  token: string,
) {
  response.cookies.set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 3600,
  });
}
