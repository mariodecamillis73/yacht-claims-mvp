import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, internal, mutation, HttpError, fail } from "@/lib/auth";
import { z } from "zod";
export const dynamic = "force-dynamic";
const input = z.object({
  name: z.string().trim().min(1).max(200),
  companyName: z.string().trim().min(1).max(200),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  phone: z.string().trim().max(100).nullable().default(null),
});
export async function GET(request: Request) {
  try {
    const actor = await user(request);
    if (!internal(actor.role)) throw new HttpError(403, "Yard access required");
    return NextResponse.json(
      await db.supplier.findMany({ orderBy: { companyName: "asc" } }),
    );
  } catch (e) {
    return fail(e);
  }
}
async function save(request: Request, edit: boolean) {
  try {
    mutation(request);
    const actor = await user(request);
    if (actor.role !== "director")
      throw new HttpError(403, "Director required");
    const parsed = (edit ? input.extend({ id: z.string().min(1) }) : input)
      .strict()
      .safeParse(await request.json());
    if (!parsed.success) throw new HttpError(400, "Invalid supplier fields");
    const { id, ...data } = parsed.data as z.infer<typeof input> & {
      id?: string;
    };
    const supplier = await db.$transaction(async (tx) => {
      if (edit && !(await tx.supplier.findUnique({ where: { id } })))
        throw new HttpError(404, "Supplier not found");
      const row = edit
        ? await tx.supplier.update({ where: { id }, data })
        : await tx.supplier.create({ data });
      await tx.activityLog.create({
        data: {
          entityType: "supplier",
          entityId: row.id,
          actorId: actor.id,
          action: edit ? "updated" : "created",
          details: "Supplier directory updated",
        },
      });
      return row;
    });
    return NextResponse.json(supplier, { status: edit ? 200 : 201 });
  } catch (e) {
    return fail(e);
  }
}
export const POST = (request: Request) => save(request, false);
export const PATCH = (request: Request) => save(request, true);
