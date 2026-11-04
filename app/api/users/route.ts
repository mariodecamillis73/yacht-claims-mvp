import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, mutation, HttpError, fail } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isValidPassword, PASSWORD_HELP } from "@/lib/password-policy";
export const dynamic = "force-dynamic";
const fields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
} as const;
async function director(request: Request) {
  const u = await user(request);
  if (u.role !== "director") throw new HttpError(403, "Director required");
  return u;
}
export async function GET(request: Request) {
  try {
    await director(request);
    const users = await db.user.findMany({
      select: fields,
      orderBy: { email: "asc" },
    });
    const members = await db.yachtMember.findMany();
    return NextResponse.json(
      users.map((u) => ({
        ...u,
        yachts: members
          .filter((m) => m.userId === u.id)
          .map((m) => m.hullNumber),
      })),
    );
  } catch (e) {
    return fail(e);
  }
}
const role = z.enum([
  "director",
  "staff",
  "representative",
  "supplier",
  "dealer",
]);
export async function POST(request: Request) {
  try {
    mutation(request);
    await director(request);
    const p = z
      .object({
        email: z.string().email().max(254),
        password: z.string().refine(isValidPassword, PASSWORD_HELP),
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        role,
        yachts: z.array(z.string()).max(100).default([]),
      })
      .strict()
      .safeParse(await request.json());
    if (!p.success)
      throw new HttpError(
        400,
        p.error.issues.some((issue) => issue.path[0] === "password")
          ? PASSWORD_HELP
          : "Invalid user fields",
      );
    const { password, yachts, ...data } = p.data;
    data.email = data.email.trim().toLowerCase();
    if (data.role !== "representative" && yachts.length)
      throw new HttpError(
        400,
        "Yacht assignments require a representative account",
      );
    const hulls = Array.from(new Set(yachts));
    if (
      (await db.yacht.count({ where: { hullNumber: { in: hulls } } })) !==
      hulls.length
    )
      throw new HttpError(400, "Unknown yacht");
    if (await db.user.findUnique({ where: { email: data.email } }))
      throw new HttpError(409, "Email already registered");
    const passwordHash = await bcrypt.hash(password, 12);
    const created = await db.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: { ...data, passwordHash },
        select: fields,
      });
      for (const hullNumber of hulls)
        await tx.yachtMember.create({ data: { userId: u.id, hullNumber } });
      return u;
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
export async function PATCH(request: Request) {
  try {
    mutation(request);
    const actor = await director(request);
    const p = z
      .object({
        id: z.string(),
        isActive: z.boolean().optional(),
        yachts: z.array(z.string()).max(100).optional(),
      })
      .strict()
      .safeParse(await request.json());
    if (!p.success) throw new HttpError(400, "Invalid update");
    if (p.data.id === actor.id && p.data.isActive === false)
      throw new HttpError(400, "Cannot deactivate your own account");
    const target = await db.user.findUnique({ where: { id: p.data.id } });
    if (!target) throw new HttpError(404, "User not found");
    if (p.data.yachts && target.role !== "representative")
      throw new HttpError(
        400,
        "Yacht assignments require a representative account",
      );
    const hulls = p.data.yachts
      ? Array.from(new Set(p.data.yachts))
      : undefined;
    if (
      hulls &&
      (await db.yacht.count({ where: { hullNumber: { in: hulls } } })) !==
        hulls.length
    )
      throw new HttpError(400, "Unknown yacht");
    const u = await db.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: p.data.id },
        data: { isActive: p.data.isActive },
        select: fields,
      });
      if (hulls) {
        await tx.yachtMember.deleteMany({ where: { userId: u.id } });
        for (const hullNumber of hulls)
          await tx.yachtMember.create({ data: { userId: u.id, hullNumber } });
      }
      return u;
    });
    return NextResponse.json(u);
  } catch (e) {
    return fail(e);
  }
}
