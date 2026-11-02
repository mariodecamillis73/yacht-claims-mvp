import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, internal, mutation, HttpError, fail } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import {
  EQUIPMENT,
  PAINTING,
  warrantyExpiry,
  yachtResponse,
} from "@/lib/yacht-profile";
const text = z.string().trim().max(200).default("");
const equipment = z
  .object({ brand: text, model: text, power: text, serialNumber: text })
  .strict();
const propeller = z
  .object({
    brand: text,
    model: text,
    serialNumber: text,
    power: z.literal("").default(""),
  })
  .strict();
const paint = z
  .object({ brand: text, paintType: text, colorCode: text })
  .strict();
const technicalProfile = z
  .object({
    equipment: z
      .object(
        Object.fromEntries(
          EQUIPMENT.map(([key]) => [
            key,
            (key === "propellers" ? propeller : equipment).optional(),
          ]),
        ),
      )
      .strict()
      .default({}),
    painting: z
      .object(
        Object.fromEntries(PAINTING.map(([key]) => [key, paint.optional()])),
      )
      .strict()
      .default({}),
  })
  .strict()
  .optional();
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const u = await user(request);
    if (!internal(u.role) && u.role !== "representative")
      throw new HttpError(403, "Not permitted");
    const rows = await db.yacht.findMany({
      where: internal(u.role)
        ? {}
        : {
            hullNumber: {
              in: (
                await db.yachtMember.findMany({ where: { userId: u.id } })
              ).map((m) => m.hullNumber),
            },
          },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(rows.map(yachtResponse));
  } catch (e) {
    return fail(e);
  }
}
export async function POST(request: Request) {
  try {
    mutation(request);
    const u = await user(request);
    if (!internal(u.role)) throw new HttpError(403, "Not permitted");
    const b = z
      .object({
        hullNumber: z
          .string()
          .trim()
          .min(1)
          .max(50)
          .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/)
          .transform((v) => v.toUpperCase()),
        name: z.string().trim().min(1).max(200),
        yearBuilt: z.number().int().min(1900).max(2200),
        deliveryDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        warrantyYears: z.union([z.literal(1), z.literal(2)]).optional(),
        technicalProfile,
        ownerId: z.string().trim().max(200).default(""),
        captainName: z.string().trim().max(200).default(""),
      })
      .safeParse(await request.json());
    if (!b.success) throw new HttpError(400, "Invalid yacht fields");
    const {
      technicalProfile: profile,
      deliveryDate,
      warrantyYears,
      ...base
    } = b.data;
    if (!!deliveryDate !== !!warrantyYears)
      throw new HttpError(
        400,
        "Delivery date and warranty duration must be supplied together",
      );
    const expiry = deliveryDate
      ? warrantyExpiry(deliveryDate, warrantyYears!)
      : "";
    if (deliveryDate && !expiry)
      throw new HttpError(400, "Invalid delivery date");
    const data = {
      ...base,
      equipmentJson: JSON.stringify(profile || {}),
      deliveryDate: deliveryDate
        ? new Date(deliveryDate + "T00:00:00.000Z")
        : null,
      warrantyYears: warrantyYears ?? null,
      warrantyExpiresAt: expiry ? new Date(expiry + "T00:00:00.000Z") : null,
    };
    const yacht = await db.$transaction(async (tx) => {
      const yacht = await tx.yacht.create({ data });
      await tx.activityLog.create({
        data: {
          entityType: "yacht",
          entityId: yacht.hullNumber,
          actorId: u.id,
          action: "created",
          details: "Yacht registered",
        },
      });
      return yacht;
    });
    return NextResponse.json(yachtResponse(yacht), { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return fail(
        new HttpError(409, "A yacht with this hull number already exists"),
      );
    return fail(e);
  }
}
