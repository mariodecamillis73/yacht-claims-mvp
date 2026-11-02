import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();
try {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !email.includes("@") || !password || password.length < 16)
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD (minimum 16 characters).",
    );
  if (await db.user.findUnique({ where: { email } }))
    throw new Error("Account already exists; no changes made.");
  await db.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      firstName: "After Sales",
      lastName: "Director",
      role: "director",
    },
  });
  console.log("Director account created.");
} finally {
  await db.$disconnect();
}
