import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}
const globalForPrisma = globalThis;
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = null;
}

let prismaGlobal = globalForPrisma.prismaGlobal;

if (!prismaGlobal) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL");
  }

  const adapter = new PrismaPg({ connectionString });

  prismaGlobal = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaGlobal = prismaGlobal;
  }
}

export default prismaGlobal;
