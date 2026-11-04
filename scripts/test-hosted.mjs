import { PrismaClient } from "@prisma/client";
import assert from "node:assert/strict";
import { mkdtemp, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
const directory = await mkdtemp(join(tmpdir(), "yy-hosted-"));
const env = {
  ...process.env,
  NODE_ENV: "production",
  DATABASE_URL: "file:" + join(directory, "app.db"),
  JWT_SECRET: randomBytes(48).toString("hex"),
  APP_URL: "https://staging.example.invalid",
  ADMIN_EMAIL: "director@example.invalid",
  ADMIN_PASSWORD: "Disposable-test-password-456",
  PORT: "3527",
  SMTP_HOST: "",
  MAIL_FROM: "",
};
const base = "http://127.0.0.1:3527";
let server;
async function request(path, method = "GET", body, cookie) {
  const r = await fetch(base + path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: r.status,
    data: await r.json(),
    cookie: r.headers.get("set-cookie")?.split(";")[0],
  };
}
async function start(overrides = {}) {
  let log = "";
  server = spawn(process.execPath, ["scripts/start-hosted.mjs"], {
    env: { ...env, ...overrides },
    stdio: "pipe",
  });
  server.stderr.on("data", (c) => (log += c));
  server.stdout.on("data", (c) => (log += c));
  for (let i = 0; i < 100; i++) {
    try {
      if ((await request("/api/health")).status === 200) return;
    } catch {}
    if (server.exitCode !== null)
      throw new Error("Hosted start failed: " + log);
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Hosted startup timed out");
}
async function stop() {
  if (!server || server.exitCode !== null) return;
  const exited = new Promise((r) => server.once("exit", r));
  server.kill("SIGTERM");
  await exited;
}
try {
  const missing = spawnSync(process.execPath, ["scripts/start-hosted.mjs"], {
    env: { ...env, JWT_SECRET: "" },
    encoding: "utf8",
  });
  assert.notEqual(missing.status, 0);
  assert.ok(missing.stderr.includes("JWT_SECRET"));
  await start();
  let login = await request("/api/auth/login", "POST", {
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  });
  assert.equal(login.status, 200);
  assert.ok(login.cookie);
  assert.equal(
    (
      await request(
        "/api/yachts",
        "POST",
        {
          hullNumber: "STAGING",
          name: "Persistence test",
          yearBuilt: 2026,
          ownerId: "test",
          captainName: "Test",
        },
        login.cookie,
      )
    ).status,
    201,
  );
  assert.equal(
    (
      await request(
        "/api/claims",
        "POST",
        {
          yachtHullNumber: "STAGING",
          title: "Persist across restarts",
          description: "Test fixture",
        },
        login.cookie,
      )
    ).status,
    201,
  );
  const hostedClaim = (
    await request("/api/claims", "GET", undefined, login.cookie)
  ).data[0];
  const unavailableEmail = await request(
    `/api/claims/${hostedClaim.id}/shares`,
    "POST",
    { email: "supplier@example.invalid", role: "supplier", sendEmail: true },
    login.cookie,
  );
  assert.equal(unavailableEmail.status, 503);
  const failedMailDb = new PrismaClient({
    datasources: { db: { url: env.DATABASE_URL } },
  });
  try {
    assert.equal(
      await failedMailDb.claimGrant.count({ where: { revokedAt: null } }),
      0,
    );
  } finally {
    await failedMailDb.$disconnect();
  }
  await stop();
  // Simulate the existing deployment immediately before the new additive migration.
  const migrationDb = new PrismaClient({
    datasources: { db: { url: env.DATABASE_URL } },
  });
  try {
    await migrationDb.$executeRawUnsafe(
      'ALTER TABLE "Claim" DROP COLUMN "dueDate"',
    );
    await migrationDb.$executeRawUnsafe(
      'DELETE FROM "_prisma_migrations" WHERE migration_name = ?',
      "202611020004_claim_due_date",
    );
  } finally {
    await migrationDb.$disconnect();
  }
  await start({ ADMIN_PASSWORD: "Different-password-must-not-reset" });
  const snapshots = await readdir(join(directory, "backups"));
  assert.equal(
    snapshots.filter((name) => name.startsWith("pre-migration-")).length,
    1,
  );
  const snapshot = new PrismaClient({
    datasources: {
      db: { url: "file:" + join(directory, "backups", snapshots[0]) },
    },
  });
  try {
    assert.equal(
      Number(
        (
          await snapshot.$queryRawUnsafe(
            'SELECT COUNT(*) as total FROM "Claim"',
          )
        )[0].total,
      ),
      1,
    );
  } finally {
    await snapshot.$disconnect();
  }
  login = await request("/api/auth/login", "POST", {
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  });
  assert.equal(login.status, 200);
  assert.equal(
    (await request("/api/claims", "GET", undefined, login.cookie)).data.length,
    1,
  );
  const csrf = await fetch(base + "/api/auth/logout", {
    method: "POST",
    headers: { cookie: login.cookie, Origin: "https://wrong.example.invalid" },
  });
  assert.equal(csrf.status, 403);
  const logout = await fetch(base + "/api/auth/logout", {
    method: "POST",
    headers: { cookie: login.cookie, Origin: env.APP_URL },
  });
  assert.equal(logout.status, 200);
  const oldCookie = login.cookie;
  const rotation = {
    ADMIN_ROTATE_FROM_EMAIL: env.ADMIN_EMAIL,
    ADMIN_EMAIL: "updated@example.invalid",
    ADMIN_PASSWORD: "Test-rotate-99@",
    ADMIN_ROTATION_ID: "test-once",
  };
  await stop();
  await start(rotation);
  assert.equal(
    (await request("/api/claims", "GET", undefined, oldCookie)).status,
    401,
  );
  assert.equal(
    (
      await request("/api/auth/login", "POST", {
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request("/api/auth/login", "POST", {
        email: rotation.ADMIN_EMAIL,
        password: rotation.ADMIN_PASSWORD,
      })
    ).status,
    200,
  );
  await stop();
  await start({ ...rotation, ADMIN_PASSWORD: "Ignore-this-on-restart" });
  login = await request("/api/auth/login", "POST", {
    email: rotation.ADMIN_EMAIL,
    password: rotation.ADMIN_PASSWORD,
  });
  assert.equal(login.status, 200);
  assert.equal(
    (await request("/api/claims", "GET", undefined, login.cookie)).data.length,
    1,
  );
  console.log(
    "PASS: hosted migrations and verified pre-migration snapshot, secure configuration checks, first-director provisioning, health check, restart persistence, no password reset, canonical-origin CSRF validation, one-time director credential rotation and old-session revocation.",
  );
} finally {
  await stop();
  await rm(directory, { recursive: true, force: true });
}
