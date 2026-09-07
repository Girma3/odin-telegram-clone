import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const globalForPrisma = globalThis;

const PrismaGlobal =
  globalForPrisma.PrismaGlobal ||
  (() => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      idleTimeoutMillis: 30000,
    });
    const adapter = new PrismaPg(pool);
    const client = new PrismaClient({ adapter });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.PrismaGlobal = client;
    }

    return client;
  })();

export default PrismaGlobal;
