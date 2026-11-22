import assert from "node:assert/strict";
import { mkdtemp, rm, copyFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { backupDatabase } from "./backup.mjs";
const dir = await mkdtemp(join(tmpdir(), "yy-backup-"));
const url = "file:" + join(dir, "source.db");
const db = new PrismaClient({ datasources: { db: { url } } });
let restored;
try {
  await writeFile(join(dir, "source.db"), "");
  execFileSync(
    process.execPath,
    ["node_modules/prisma/build/index.js", "migrate", "deploy"],
    { env: { ...process.env, DATABASE_URL: url }, stdio: "pipe" },
  );
  await db.yacht.create({
    data: {
      hullNumber: "TEST",
      name: "Backup yacht",
      yearBuilt: 2026,
      ownerId: "",
      captainName: "",
    },
  });
  const claim = await db.claim.create({
    data: {
      yachtHullNumber: "TEST",
      title: "Backup claim",
      description: "Retain attachments",
    },
  });
  await db.document.create({
    data: {
      claimId: claim.id,
      fileName: "proof.txt",
      content: Buffer.from("attachment-proof"),
      mimeType: "text/plain",
      uploadedBy: "test",
      storagePath: "database",
    },
  });
  const snapshot = join(dir, "snapshot.db");
  await backupDatabase(url, snapshot);
  await assert.rejects(backupDatabase(url, snapshot), /already exists/);
  await db.claim.update({
    where: { id: claim.id },
    data: { title: "Later change" },
  });
  // Restore into a NEW path; never overwrite a running database.
  const restorePath = join(dir, "restored.db");
  await copyFile(snapshot, restorePath);
  restored = new PrismaClient({
    datasources: { db: { url: "file:" + restorePath } },
  });
  assert.equal(
    (await restored.claim.findUnique({ where: { id: claim.id } })).title,
    "Backup claim",
  );
  assert.equal(
    Buffer.from((await restored.document.findFirst()).content).toString(),
    "attachment-proof",
  );
  console.log(
    "PASS: consistent snapshot, integrity and foreign-key checks, no overwrite, restore into new database preserves claims and attachment bytes.",
  );
} finally {
  await db.$disconnect();
  await restored?.$disconnect();
  await rm(dir, { recursive: true, force: true });
}
