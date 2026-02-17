import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

const adapter = new PrismaBetterSqlite3({ url: connectionString });

declare const globalThis: {
  prismaGlobal: PrismaClient | undefined;
} & typeof global;

const prismaClientSingleton = (): PrismaClient => {
  return new PrismaClient({ adapter });
};

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export default prisma;
