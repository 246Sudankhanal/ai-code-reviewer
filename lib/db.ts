import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaId: string | undefined;
};

/** Bump when PullRequest (or other models) gain fields so dev does not keep a stale client. */
const PRISMA_SCHEMA_ID = "pull-request-posted-head-sha-v1";

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

const reuse =
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prisma &&
  globalForPrisma.prismaSchemaId === PRISMA_SCHEMA_ID;

export const prisma = reuse
  ? globalForPrisma.prisma!
  : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaId = PRISMA_SCHEMA_ID;
}
