import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const dir = await mkdtemp(join(tmpdir(), "yy-access-"));
const url = "file:" + join(dir, "test.db");
const env = {
  ...process.env,
  DATABASE_URL: url,
  JWT_SECRET: randomBytes(48).toString("hex"),
  SMTP_HOST: "127.0.0.1",
  SMTP_PORT: "3526",
  SMTP_USER: "",
  SMTP_PASSWORD: "",
  MAIL_FROM: "test@example.invalid",
};
let server;
let db;
let mail = "";
// Local-only SMTP sink. No messages leave the test process.
const smtp = createServer((socket) => {
  socket.write("220 localhost test\r\n");
  let input = "",
    data = false;
  socket.on("data", (chunk) => {
    input += chunk.toString();
    while (input.includes("\r\n")) {
      const i = input.indexOf("\r\n");
      const line = input.slice(0, i);
      input = input.slice(i + 2);
      if (data) {
        if (line === ".") {
          data = false;
          socket.write("250 accepted\r\n");
        } else mail += line + "\n";
      } else if (line.startsWith("EHLO")) socket.write("250 localhost\r\n");
      else if (line === "DATA") {
        data = true;
        socket.write("354 send\r\n");
      } else if (line === "QUIT") {
        socket.end("221 bye\r\n");
      } else socket.write("250 ok\r\n");
    }
  });
});
try {
  await new Promise((resolve) => smtp.listen(3526, "127.0.0.1", resolve));
  await writeFile(join(dir, "test.db"), "");
  execFileSync(
    process.execPath,
    ["node_modules/prisma/build/index.js", "migrate", "deploy"],
    { env, stdio: "pipe" },
  );
  db = new PrismaClient({ datasources: { db: { url } } });
  const password = "Test-only-long-password-456";
  const passwordHash = await bcrypt.hash(password, 4);
  for (const role of [
    "director",
    "staff",
    "representative",
    "supplier",
    "dealer",
  ])
    await db.user.create({
      data: {
        id: role,
        email: role + "@example.invalid",
        passwordHash,
        firstName: role,
        lastName: "Test",
        role,
      },
    });
  for (const hullNumber of ["A", "B"])
    await db.yacht.create({
      data: {
        hullNumber,
        name: hullNumber,
        yearBuilt: 2026,
        ownerId: "owner",
        captainName: "Captain",
      },
    });
  await db.yachtMember.create({
    data: { userId: "representative", hullNumber: "A" },
  });
  for (const id of ["A1", "A2", "B1"])
    await db.claim.create({
      data: {
        id,
        yachtHullNumber: id[0],
        title: id,
        description: "Shared description",
      },
    });
  await db.comment.createMany({
    data: [
      {
        claimId: "A1",
        userId: "director",
        message: "secret internal",
        visibility: "internal",
      },
      {
        claimId: "A1",
        userId: "director",
        message: "shared note",
        visibility: "shared",
      },
    ],
  });
  const doc = await db.document.create({
    data: {
      claimId: "A1",
      fileName: "private.txt",
      storagePath: "",
      content: Buffer.from("secret file"),
      mimeType: "text/plain",
      visibility: "internal",
      uploadedBy: "director",
    },
  });
  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3525",
    ],
    { env, stdio: "pipe" },
  );
  let log = "";
  server.stderr.on("data", (c) => (log += c));
  server.stdout.on("data", (c) => (log += c));
  const base = "http://127.0.0.1:3525";
  async function req(path, { cookie = "", method = "GET", body, form } = {}) {
    const r = await fetch(base + path, {
      method,
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: form || (body ? JSON.stringify(body) : undefined),
      redirect: "manual",
    });
    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return {
      status: r.status,
      data,
      cookie: r.headers.get("set-cookie")?.split(";")[0],
    };
  }
  for (let i = 0; i < 80; i++) {
    try {
      await req("/api/auth/me");
      break;
    } catch {
      if (i === 79) throw new Error(log);
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  assert.equal((await req("/api/claims")).status, 401);
  assert.equal(
    (
      await req("/api/auth/login", {
        method: "POST",
        body: { email: "director@example.invalid", password: "bad" },
      })
    ).status,
    401,
  );
  const cookies = {};
  for (const role of [
    "director",
    "staff",
    "representative",
    "supplier",
    "dealer",
  ]) {
    const r = await req("/api/auth/login", {
      method: "POST",
      body: { email: role + "@example.invalid", password },
    });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    cookies[role] = r.cookie;
  }
  assert.equal(
    (await req("/api/users", { cookie: cookies.staff })).status,
    403,
  );
  assert.equal(
    (await req("/api/my-yacht", { cookie: cookies.supplier })).status,
    403,
  );
  assert.equal(
    (
      await req("/api/users", {
        cookie: cookies.director,
        method: "POST",
        body: {
          email: "new@example.invalid",
          password,
          firstName: "New",
          lastName: "User",
          role: "representative",
          yachts: ["B"],
        },
      })
    ).status,
    201,
  );
  for (const [candidate, expected] of [
    ["abcd12@", 400],
    ["abcdefgh1", 400],
    ["abcdefgh@", 400],
    ["1234567@", 400],
    ["abc12345 ", 400],
    ["a".repeat(71) + "1@", 400],
    ["abcd123@", 201],
    ["lowercase9#", 201],
    ["letters9 @", 201],
  ]) {
    const email = `policy-${Math.random().toString(36).slice(2)}@example.invalid`;
    const result = await req("/api/users", {
      cookie: cookies.director,
      method: "POST",
      body: {
        email,
        password: candidate,
        firstName: "Policy",
        lastName: "Test",
        role: "staff",
      },
    });
    assert.equal(
      result.status,
      expected,
      `Password policy case must return ${expected}`,
    );
    if (expected === 201) {
      assert.equal(
        (
          await req("/api/auth/login", {
            method: "POST",
            body: { email, password: candidate },
          })
        ).status,
        200,
      );
    }
  }
  const newLogin = await req("/api/auth/login", {
    method: "POST",
    body: { email: "new@example.invalid", password },
  });
  assert.equal(
    (await req("/api/claims", { cookie: newLogin.cookie })).data.length,
    1,
  );
  const listUsers = await req("/api/users", { cookie: cookies.director });
  assert.ok(!JSON.stringify(listUsers.data).includes("passwordHash"));
  const newUser = listUsers.data.find((u) => u.email === "new@example.invalid");
  assert.equal(
    (
      await req("/api/users", {
        cookie: cookies.director,
        method: "PATCH",
        body: { id: newUser.id, yachts: ["A"] },
      })
    ).status,
    200,
  );
  assert.equal(
    (await req("/api/claims/B1", { cookie: newLogin.cookie })).status,
    404,
  );
  assert.equal(
    (await req("/api/claims", { cookie: newLogin.cookie })).data.length,
    2,
  );
  for (let i = 0; i < 10; i++)
    assert.equal(
      (
        await req("/api/auth/login", {
          method: "POST",
          body: { email: "absent@example.invalid", password: "wrong" },
        })
      ).status,
      401,
    );
  assert.equal(
    (
      await req("/api/auth/login", {
        method: "POST",
        body: { email: "absent@example.invalid", password: "wrong" },
      })
    ).status,
    429,
  );
  const csrf = await fetch(base + "/api/claims/A1/shares", {
    method: "POST",
    headers: {
      cookie: cookies.director,
      Origin: "https://untrusted.example",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "supplier@example.invalid",
      role: "supplier",
    }),
  });
  assert.equal(csrf.status, 403);
  assert.equal(
    (await req("/api/claims", { cookie: cookies.director })).data.length,
    3,
  );
  assert.equal(
    (await req("/api/claims", { cookie: cookies.representative })).data.length,
    2,
  );
  assert.equal(
    (await req("/api/claims/B1", { cookie: cookies.representative })).status,
    404,
  );
  assert.equal(
    (await req("/api/claims/A1", { cookie: cookies.supplier })).status,
    404,
  );
  assert.equal((await req("/api/public/claims/A1")).status, 404);
  assert.equal(
    (
      await req("/api/claims/A1/validate", {
        cookie: cookies.staff,
        method: "POST",
        body: { decision: "approved" },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await req("/api/claims/A1", {
        cookie: cookies.staff,
        method: "PATCH",
        body: { status: "in_progress" },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await req("/api/claims/A1/validate", {
        cookie: cookies.director,
        method: "POST",
        body: { decision: "invalid" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await req("/api/claims/A1/validate", {
        cookie: cookies.director,
        method: "POST",
        body: { decision: "approved", validatedBy: "spoofed" },
      })
    ).status,
    200,
  );
  assert.equal(
    (await db.claim.findUnique({ where: { id: "A1" } })).validatedBy,
    "director",
  );
  const grant = await req("/api/claims/A1/shares", {
    cookie: cookies.director,
    method: "POST",
    body: { email: "supplier@example.invalid", role: "supplier", days: 1 },
  });
  assert.equal(grant.status, 201);
  const token = grant.data.path.split("/").pop();
  const portal = "/api/public/claims/" + token;
  assert.equal((await req(portal)).status, 401);
  let r = await req("/api/claims/A1", { cookie: cookies.supplier });
  assert.equal(r.status, 200);
  assert.equal(r.data.comments.length, 1);
  assert.equal(r.data.documents.length, 0);
  assert.ok(!JSON.stringify(r.data).includes("secret internal"));
  assert.equal(
    (await req("/api/claims/A2", { cookie: cookies.supplier })).status,
    404,
  );
  assert.equal(
    (
      await req("/api/claims/A1/documents/" + doc.id, {
        cookie: cookies.supplier,
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await req("/api/claims/A1/comments", {
        cookie: cookies.supplier,
        method: "POST",
        body: { message: "no", visibility: "internal" },
      })
    ).status,
    403,
  );
  assert.equal(
    (await req(portal + "/verify", { method: "POST", body: {} })).status,
    200,
  );
  assert.equal(
    (await req(portal + "/verify", { method: "POST", body: {} })).status,
    429,
  );
  const code = mail.match(/code is (\d{6})/)?.[1];
  assert.ok(code, "Local SMTP must receive code");
  assert.equal(
    (
      await req(portal + "/verify", {
        method: "POST",
        body: { code: "000000" },
      })
    ).status,
    401,
  );
  r = await req(portal + "/verify", { method: "POST", body: { code } });
  assert.equal(r.status, 200);
  const guest = r.cookie;
  assert.equal(
    (await req(portal + "/verify", { method: "POST", body: { code } })).status,
    401,
  );
  r = await req(portal, { cookie: guest });
  assert.equal(r.status, 200);
  assert.equal(r.data.comments.length, 1);
  assert.equal(r.data.documents.length, 0);
  assert.equal((await req("/api/claims/A1", { cookie: guest })).status, 401);
  assert.equal(
    (
      await req(portal + "/comments", {
        cookie: guest,
        method: "POST",
        body: { message: "hidden", visibility: "internal" },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await req(portal + "/comments", {
        cookie: guest,
        method: "POST",
        body: { message: "Supplier response" },
      })
    ).status,
    201,
  );
  const form = new FormData();
  form.set("file", new Blob(["shared document"]), "shared.txt");
  r = await req(portal + "/documents", { cookie: guest, method: "POST", form });
  assert.equal(r.status, 201);
  const uploaded = r.data.id;
  assert.equal(
    (await req(portal + "/documents/" + uploaded, { cookie: guest })).data,
    "shared document",
  );
  assert.equal(
    (await req(portal + "/documents/" + doc.id, { cookie: guest })).status,
    404,
  );
  if (process.env.YY_UI_TEST === "1") {
    const { chromium } = createRequire(import.meta.url)("playwright");
    const browser = await chromium.launch({ headless: true });
    try {
      for (const [name, cookie, path, title] of [
        ["director", cookies.director, "/claims/A1", "Share this claim"],
        ["guest", guest, "/supplier/" + token, "Photos and documents"],
      ]) {
        const context = await browser.newContext({
          viewport: { width: 1280, height: 900 },
        });
        const split = cookie.indexOf("=");
        await context.addCookies([
          {
            name: cookie.slice(0, split),
            value: cookie.slice(split + 1),
            domain: "127.0.0.1",
            path: "/",
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
          },
        ]);
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(base + path);
        await page.getByRole("heading", { name: title, exact: true }).waitFor();
        await page.screenshot({
          path: join(process.env.YY_QA_DIR || dir, name + "-claim-qa.png"),
          fullPage: true,
        });
        assert.deepEqual(errors, []);
        if (name === "guest") {
          assert.equal(await page.getByText("secret internal").count(), 0);
          assert.equal(await page.getByText("Supplier response").count(), 1);
        }
        await context.close();
      }
    } finally {
      await browser.close();
    }
    console.log(
      "PASS: Chromium director and guest portals, no page errors, internal comment absent from guest page.",
    );
  }
  await req("/api/claims/A1/shares", {
    cookie: cookies.director,
    method: "DELETE",
    body: { id: grant.data.id },
  });
  assert.equal((await req(portal, { cookie: guest })).status, 404);
  assert.equal(
    (await req(portal + "/documents/" + uploaded, { cookie: guest })).status,
    404,
  );
  assert.equal(
    (await req("/api/claims/A1", { cookie: cookies.supplier })).status,
    404,
  );
  const expired = await req("/api/claims/A2/shares", {
    cookie: cookies.director,
    method: "POST",
    body: { email: "dealer@example.invalid", role: "dealer", days: 1 },
  });
  await db.claimGrant.update({
    where: { id: expired.data.id },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });
  assert.equal(
    (await req("/api/public/claims/" + expired.data.path.split("/").pop()))
      .status,
    404,
  );
  assert.equal(
    (await req("/api/claims/A2", { cookie: cookies.dealer })).status,
    404,
  );
  const yacht = await req("/api/yachts", {
    cookie: cookies.staff,
    method: "POST",
    body: {
      hullNumber: "flow",
      name: "Workflow test",
      yearBuilt: 2026,
      deliveryDate: "2026-11-02",
      warrantyYears: 2,
      technicalProfile: {
        equipment: Object.fromEntries(
          [
            "engine",
            "genset",
            "bowThruster",
            "sternThruster",
            "propellers",
            "airConditioning",
            "watermaker",
          ].map((key) => [
            key,
            {
              brand: "Brand " + key,
              model: "Model",
              power: key === "propellers" ? "" : "10 kW",
              serialNumber: "SN-" + key,
            },
          ]),
        ),
        painting: {
          hullPainting: {
            brand: "Hull brand",
            paintType: "Polyurethane",
            colorCode: "RAL 9010",
          },
          deckPainting: {
            brand: "Deck brand",
            paintType: "Non-slip",
            colorCode: "RAL 7035",
          },
        },
      },
    },
  });
  assert.equal(yacht.status, 201);
  assert.equal(yacht.data.deliveryDate, "2026-11-02T00:00:00.000Z");
  assert.equal(yacht.data.warrantyExpiresAt, "2028-11-02T00:00:00.000Z");
  const profile = (await req("/api/yachts/FLOW", { cookie: cookies.staff }))
    .data.technicalProfile;
  assert.deepEqual(profile, yacht.data.technicalProfile);
  assert.equal(profile.painting.deckPainting.colorCode, "RAL 7035");
  for (const key of [
    "engine",
    "genset",
    "bowThruster",
    "sternThruster",
    "propellers",
    "airConditioning",
    "watermaker",
  ])
    assert.equal(profile.equipment[key].serialNumber, "SN-" + key);
  assert.equal(
    (await req("/api/yachts/FLOW", { cookie: cookies.supplier })).status,
    404,
  );
  assert.equal(
    (await req("/api/yachts/FLOW", { cookie: cookies.representative })).status,
    404,
  );
  const baseYacht = { hullNumber: "DATE", name: "Date test", yearBuilt: 2024 };
  for (const fields of [
    { deliveryDate: "2026-02-30", warrantyYears: 1 },
    { deliveryDate: "2026-01-01", warrantyYears: 3 },
    { warrantyYears: 1 },
    { deliveryDate: "2026-01-01" },
  ]) {
    assert.equal(
      (
        await req("/api/yachts", {
          cookie: cookies.staff,
          method: "POST",
          body: { ...baseYacht, ...fields },
        })
      ).status,
      400,
    );
  }
  const leap = await req("/api/yachts", {
    cookie: cookies.staff,
    method: "POST",
    body: { ...baseYacht, deliveryDate: "2024-02-29", warrantyYears: 1 },
  });
  assert.equal(leap.status, 201);
  assert.equal(leap.data.warrantyExpiresAt, "2025-02-28T00:00:00.000Z");
  // Existing yachts stay readable after the additive migration, with no invented delivery date.
  const legacyRow = await db.yacht.findFirst({
    where: { hullNumber: { notIn: ["FLOW", "DATE"] } },
  });
  assert.equal(legacyRow.deliveryDate, null);
  assert.equal(legacyRow.warrantyExpiresAt, null);

  assert.equal(
    (
      await req("/api/yachts", {
        cookie: cookies.staff,
        method: "POST",
        body: { hullNumber: "flow", name: "Duplicate", yearBuilt: 2026 },
      })
    ).status,
    409,
  );
  const draft = await req("/api/claims", {
    cookie: cookies.staff,
    method: "POST",
    body: {
      yachtHullNumber: "FLOW",
      title: "Workflow claim",
      description: "Test description",
      priority: "medium",
    },
  });
  assert.equal(draft.status, 201, JSON.stringify(draft.data));
  const flowId = draft.data.id;
  assert.ok(flowId);
  const editBody = {
    hullNumber: "FLOW",
    name: "Updated yacht",
    yearBuilt: 2025,
    ownerId: "New owner",
    captainName: "New captain",
    deliveryDate: "2026-12-01",
    warrantyYears: 1,
    technicalProfile: yacht.data.technicalProfile,
    updatedAt: yacht.data.updatedAt,
  };
  for (const role of ["staff", "supplier", "representative", "dealer"])
    assert.equal(
      (
        await req("/api/yachts/FLOW", {
          cookie: cookies[role],
          method: "PATCH",
          body: editBody,
        })
      ).status,
      403,
    );
  assert.equal(
    (
      await req("/api/yachts/FLOW", {
        cookie: cookies.director,
        method: "PATCH",
        body: { ...editBody, warrantyYears: 3 },
      })
    ).status,
    400,
  );
  const updated = await req("/api/yachts/FLOW", {
    cookie: cookies.director,
    method: "PATCH",
    body: editBody,
  });
  assert.equal(updated.status, 200, JSON.stringify(updated.data));
  assert.equal(updated.data.name, "Updated yacht");
  assert.equal(updated.data.warrantyExpiresAt, "2027-12-01T00:00:00.000Z");
  assert.deepEqual(updated.data.technicalProfile, yacht.data.technicalProfile);
  assert.equal(
    (
      await req("/api/yachts/FLOW", {
        cookie: cookies.director,
        method: "PATCH",
        body: editBody,
      })
    ).status,
    409,
  );
  await db.yachtMember.create({
    data: { userId: "representative", hullNumber: "FLOW" },
  });
  const collision = await req("/api/yachts/FLOW", {
    cookie: cookies.director,
    method: "PATCH",
    body: { ...editBody, updatedAt: updated.data.updatedAt, hullNumber: "A" },
  });
  assert.equal(collision.status, 409);
  const renamed = await req("/api/yachts/FLOW", {
    cookie: cookies.director,
    method: "PATCH",
    body: {
      ...editBody,
      updatedAt: updated.data.updatedAt,
      hullNumber: "FLOW2",
      deliveryDate: undefined,
      warrantyYears: undefined,
    },
  });
  assert.equal(renamed.status, 200, JSON.stringify(renamed.data));
  assert.equal(renamed.data.deliveryDate, null);
  assert.equal(renamed.data.warrantyExpiresAt, null);
  assert.equal(
    (await db.claim.findUnique({ where: { id: flowId } })).yachtHullNumber,
    "FLOW2",
  );
  assert.equal(
    (await req("/api/yachts/FLOW2", { cookie: cookies.representative })).status,
    200,
  );
  assert.equal(
    (await req("/api/yachts/FLOW", { cookie: cookies.director })).status,
    404,
  );
  assert.ok(
    await db.activityLog.findFirst({
      where: {
        entityType: "yacht",
        entityId: "FLOW2",
        action: "updated",
        actorId: "director",
      },
    }),
  );

  assert.equal(
    (
      await req(`/api/claims/${flowId}`, {
        cookie: cookies.staff,
        method: "PATCH",
        body: { status: "closed" },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await req(`/api/claims/${flowId}/validate`, {
        cookie: cookies.director,
        method: "POST",
        body: { decision: "approved" },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await req(`/api/claims/${flowId}/validate`, {
        cookie: cookies.director,
        method: "POST",
        body: { decision: "approved" },
      })
    ).status,
    409,
  );
  for (const status of ["in_progress", "supplier_pending", "closed"]) {
    assert.equal(
      (
        await req(`/api/claims/${flowId}`, {
          cookie: cookies.staff,
          method: "PATCH",
          body: { status },
        })
      ).status,
      200,
    );
  }
  const closed = await req(`/api/claims/${flowId}`, { cookie: cookies.staff });
  assert.ok(closed.data.claim.closedAt);
  assert.equal(
    closed.data.activity.filter((x) => x.action === "status_changed").length,
    3,
  );
  assert.equal(
    (
      await req(`/api/claims/${flowId}`, {
        cookie: cookies.staff,
        method: "PATCH",
        body: { status: "assigned" },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await req(`/api/claims/${flowId}`, {
        cookie: cookies.staff,
        method: "PATCH",
        body: { status: "in_progress" },
      })
    ).status,
    200,
  );
  assert.equal(
    (await req(`/api/claims/${flowId}`, { cookie: cookies.staff })).data.claim
      .closedAt,
    null,
  );
  await db.user.update({ where: { id: "staff" }, data: { isActive: false } });
  assert.equal(
    (await req("/api/claims", { cookie: cookies.staff })).status,
    401,
  );
  console.log(
    "PASS: password authentication; role/yacht isolation; director validation; invitation email code through local SMTP; comments/documents visibility; guest upload/download; revocation; inactive users.",
  );
} finally {
  if (server) {
    server.kill();
    await new Promise((r) => server.once("exit", r));
  }
  await db?.$disconnect();
  await new Promise((r) => smtp.close(r));
  await rm(dir, { recursive: true, force: true });
}
