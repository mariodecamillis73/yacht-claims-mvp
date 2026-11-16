import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  user,
  internal,
  yachtAllowed,
  mutation,
  HttpError,
  fail,
} from "@/lib/auth";
import { claimScope } from "@/lib/claim-scope";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const u = await user(request);
    const where = await claimScope(u);
    const query = new URL(request.url).searchParams;
    const filter = query.get("filter") || "all";
    const q = (query.get("q") || "").trim();
    if (q.length > 200) throw new HttpError(400, "Search text is too long");
    const commentMatch = {message: {contains: q}, ...(internal(u.role) ? {} : {visibility: "shared"})};
    const searchWhere: Prisma.ClaimWhereInput = q ? { OR: [
      { title: { contains: q } }, { description: { contains: q } },
      { yesId: { contains: q } }, { yachtHullNumber: { contains: q } },
      { yacht: { name: { contains: q } } }, { comments: { some: commentMatch } },
    ] } : {};
    if (!["all", "mine", "overdue", "recent"].includes(filter))
      throw new HttpError(400, "Invalid filter");
    const extra =
      filter === "mine"
        ? { OR: [{ assignedTo: u.id }, { createdBy: u.id }] }
        : filter === "overdue"
          ? {
              dueDate: { lt: new Date() },
              status: { notIn: ["closed", "rejected"] },
            }
          : filter === "recent"
            ? { updatedAt: { gte: new Date(Date.now() - 7 * 86400000) } }
            : {};
    const claims = await db.claim.findMany({
      where: { AND: [where, extra, searchWhere] },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      select: {
        id: true,
        title: true,
        yesId: true,
        description: true,
        status: true,
        priority: true,
        yachtHullNumber: true,
        createdAt: true,
        updatedAt: true,
        dueDate: true,
        yacht: { select: { name: true } },
        ...(q ? {comments: {where: commentMatch, orderBy: {createdAt: "desc" as const}, take: 3,
          select: {message: true, createdAt: true}}} : {}),
        ...(internal(u.role)
          ? {
              validatedBy: true,
              validationStatus: true,
              assignedTo: true,
              supplierId: true,
              warrantyStatus: true,
            }
          : {}),
      },
    });
    const names = internal(u.role)
      ? await db.user.findMany({
          where: {
            id: {
              in: claims.map((c) =>
                "assignedTo" in c ? c.assignedTo || "" : "",
              ),
            },
          },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];
    return NextResponse.json(
      claims.map((c) =>
        internal(u.role)
          ? {
              ...c,
              assignedName: names
                .filter((n) => n.id === c.assignedTo)
                .map((n) => `${n.firstName} ${n.lastName}`)
                .join(""),
            }
          : c,
      ),
    );
  } catch (e) {
    return fail(e);
  }
}
export async function POST(request: Request) {
  try {
    mutation(request);
    const u = await user(request);
    if (!internal(u.role) && u.role !== "representative")
      throw new HttpError(403, "Not permitted");
    const parsed = z
      .object({
        yachtHullNumber: z.string().min(1),
        yesId: z
          .string()
          .trim()
          .regex(/^(?:[1-9]\d{0,8})?$/)
          .nullable()
          .optional()
          .transform((value) => value === "" ? null : value),
        title: z.string().trim().min(1).max(250),
        description: z.string().trim().min(1).max(20000),
        priority: z
          .enum(["low", "medium", "high", "critical"])
          .default("medium"),
      })
      .safeParse(await request.json());
    if (!parsed.success) throw new HttpError(400, "Invalid claim fields");
    if (!(await yachtAllowed(u.id, u.role, parsed.data.yachtHullNumber)))
      throw new HttpError(404, "Yacht not found");
    if (
      !(await db.yacht.findUnique({
        where: { hullNumber: parsed.data.yachtHullNumber },
      }))
    )
      throw new HttpError(404, "Yacht not found");
    if (!parsed.data.yesId)
      throw new HttpError(400, "Enter the Request ID assigned in YES");
    const c = await db.$transaction(async (tx) => {
      const claim = await tx.claim.create({
        data: { ...parsed.data, createdBy: u.id },
      });
      await tx.activityLog.create({
        data: {
          entityType: "claim",
          entityId: claim.id,
          claimId: claim.id,
          actorId: u.id,
          action: "created",
          details: "Claim submitted for director validation",
        },
      });
      return claim;
    });
    return NextResponse.json(c, { status: 201 });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002" &&
      Array.isArray(e.meta?.target) &&
      e.meta.target.includes("yesId")
    )
      return fail(new HttpError(409, "YES ID# already assigned"));
    return fail(e);
  }
}
