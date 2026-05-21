import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error(
    "Missing DATABASE_URL. Set this environment variable in production and deploy environments."
  );
}

const dbUrl =
  process.env.NODE_ENV === "production" && !/sslmode=/i.test(databaseUrl)
    ? databaseUrl.includes("?")
      ? `${databaseUrl}&sslmode=require`
      : `${databaseUrl}?sslmode=require`
    : databaseUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ datasources: { db: { url: dbUrl } } });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
