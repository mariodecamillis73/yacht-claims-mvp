import { spawn, execFileSync } from "node:child_process";
import { mkdir, open } from "node:fs/promises";
import { dirname, isAbsolute } from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { rotateDirector } from "./admin-maintenance.mjs";

// Never log environment values or account credentials.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("Set a random JWT_SECRET with at least 32 characters.");
}
const database = process.env.DATABASE_URL;
if (!database?.startsWith("file:") || !isAbsolute(database.slice(5))) {
  throw new Error(
    "Hosted DATABASE_URL must point to an absolute path on a persistent disk.",
  );
}
if (process.env.RENDER_EXTERNAL_URL) {
  process.env.APP_URL = process.env.RENDER_EXTERNAL_URL;
}
if (!process.env.APP_URL?.startsWith("https://")) {
  throw new Error("Hosted APP_URL must use HTTPS.");
}
await mkdir(dirname(database.slice(5)), { recursive: true });
// Prisma SQLite migration engine expects the target file to exist on a fresh mount.
const databaseFile = await open(database.slice(5), "a", 0o600);
await databaseFile.close();
execFileSync(
  process.execPath,
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  { stdio: "inherit", env: process.env },
);
const db = new PrismaClient();
try {
  if (await rotateDirector(db)) console.log("Requested director credential update completed.");
  const activeDirectors = await db.user.count({
    where: { role: "director", isActive: true },
  });
  if (!activeDirectors) {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !email.includes("@") || !password || password.length < 16) {
      throw new Error(
        "First launch requires ADMIN_EMAIL and ADMIN_PASSWORD (minimum 16 characters).",
      );
    }
    if (await db.user.findUnique({ where: { email } })) {
      throw new Error(
        "Bootstrap email is already registered; no privilege changes were made.",
      );
    }
    await db.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 12),
        firstName: "After Sales",
        lastName: "Director",
        role: "director",
      },
    });
    console.log(
      "First director created. Remove bootstrap variables from hosting configuration.",
    );
  }
} finally {
  await db.$disconnect();
}
if (!process.env.SMTP_HOST || !process.env.MAIL_FROM) {
  console.warn(
    "SMTP not configured: guest email verification will remain unavailable.",
  );
}
const app = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "0.0.0.0",
    "--port",
    process.env.PORT || "3000",
  ],
  { stdio: "inherit", env: { ...process.env, NODE_ENV: "production" } },
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => app.kill(signal));
app.on("exit", (code) => process.exit(code ?? 1));
