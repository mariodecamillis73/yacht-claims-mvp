import { db } from "./db";
import { HttpError } from "./auth";
import { z } from "zod";
export async function addComment(
  request: Request,
  claimId: string,
  actorId: string,
  isInternal: boolean,
) {
  const b = z
    .object({
      message: z.string().trim().min(1).max(10000),
      visibility: z.enum(["shared", "internal"]).default("shared"),
    })
    .safeParse(await request.json());
  if (!b.success) throw new HttpError(400, "Invalid comment");
  if (!isInternal && b.data.visibility === "internal")
    throw new HttpError(403, "Not permitted");
  return db.comment.create({ data: { claimId, userId: actorId, ...b.data } });
}
export async function addDocument(
  request: Request,
  claimId: string | null,
  actorId: string,
  isInternal: boolean,
  yachtId?: string,
) {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "File required");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const r = await reader.read();
    if (r.done) break;
    size += r.value.length;
    if (size > 6 * 1024 * 1024) {
      await reader.cancel();
      throw new HttpError(413, "Maximum file size is 5 MB");
    }
    chunks.push(r.value);
  }
  const safeRequest = new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body: Buffer.concat(chunks),
  });
  const form = await safeRequest.formData();
  const file = form.get("file");
  const visibility =
    form.get("visibility") === "internal" ? "internal" : "shared";
  if (!isInternal && visibility === "internal")
    throw new HttpError(403, "Not permitted");
  if (!file || typeof file === "string" || file.size === 0)
    throw new HttpError(400, "File required");
  if (file.size > 5 * 1024 * 1024)
    throw new HttpError(413, "Maximum file size is 5 MB");
  const name =
    file.name.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(-180) || "attachment";
  const data = Buffer.from(await file.arrayBuffer());
  // Only validated raster images are rendered inline; every other file downloads as an attachment.
  const mime = data
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    ? "image/png"
    : data[0] === 255 && data[1] === 216 && data[2] === 255
      ? "image/jpeg"
      : "application/octet-stream";
  return db.document.create({
    data: {
      claimId,
      ...(yachtId ? { yachtId } : {}),
      uploadedBy: actorId,
      fileName: name,
      storagePath: "",
      mimeType: mime,
      content: data,
      visibility,
    },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      visibility: true,
      createdAt: true,
    },
  });
}
export async function documentResponse(
  claimId: string | null,
  id: string,
  isInternal: boolean,
  yachtId?: string,
) {
  const d = await db.document.findFirst({
    where: {
      id,
      claimId,
      ...(yachtId ? { yachtId } : {}),
      ...(isInternal ? {} : { visibility: "shared" }),
    },
  });
  if (!d?.content) throw new HttpError(404, "Document not available");
  const inline = ["image/png", "image/jpeg"].includes(d.mimeType);
  return new Response(new Uint8Array(d.content), {
    headers: {
      "Content-Type": inline ? d.mimeType : "application/octet-stream",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${d.fileName.replace(/[^a-zA-Z0-9._ -]/g, "_")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
