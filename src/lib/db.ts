import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot reloads in dev to avoid exhausting
// database connections.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * True when a real database connection string is configured. The example
 * placeholder (user:password@localhost) is treated as "no DB" so local dev
 * runs purely on mock fixtures without attempting a connection.
 */
const url = process.env.DATABASE_URL ?? "";
export const hasDatabase = Boolean(url) && !url.includes("user:password@localhost");
