import { PrismaClient } from "@prisma/client";
import { resolve, dirname } from "node:path";
import { mkdir, chmod, stat, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
// SQLite VACUUM INTO produces a consistent snapshot, including attachment bytes.
// The destination must be new: existing backups are never overwritten.
export async function backupDatabase(url, destination) {
  if (!url?.startsWith("file:"))
    throw new Error("SQLite DATABASE_URL required");
  const target = resolve(destination);
  await mkdir(dirname(target), { recursive: true, mode: 0o700 });
  try {
    await stat(target);
    throw new Error("Backup destination already exists");
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  const source = new PrismaClient({ datasources: { db: { url } } });
  let snapshot,
    created = false;
  try {
    await source.$executeRawUnsafe("VACUUM INTO ?", target);
    created = true;
    await chmod(target, 0o600);
    snapshot = new PrismaClient({
      datasources: { db: { url: "file:" + target } },
    });
    const check = await snapshot.$queryRawUnsafe("PRAGMA integrity_check");
    if (check.length !== 1 || Object.values(check[0])[0] !== "ok")
      throw new Error("Backup integrity verification failed");
    if ((await snapshot.$queryRawUnsafe("PRAGMA foreign_key_check")).length)
      throw new Error("Backup foreign key verification failed");
    return target;
  } catch (e) {
    if (created) await unlink(target).catch(() => {});
    throw e;
  } finally {
    await source.$disconnect();
    await snapshot?.$disconnect();
  }
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const target = process.argv[2];
  if (!target)
    throw new Error(
      "Usage: node scripts/backup.mjs /secure/path/new-backup.db",
    );
  await backupDatabase(process.env.DATABASE_URL, target);
  console.log(
    "Backup created and verified. Store it securely off the application disk.",
  );
}
