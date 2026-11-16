import { PrismaClient } from "@prisma/client";
const globalDb = globalThis as unknown as { prisma?: PrismaClient; readinessPrisma?: PrismaClient };
export const db = globalDb.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalDb.prisma = db;

// Readiness must not queue behind a long write transaction on the application connection.
export const readinessDb = globalDb.readinessPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalDb.readinessPrisma = readinessDb;
