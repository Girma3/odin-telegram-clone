import dotenv from "dotenv";
dotenv.config();
import { defineConfig, env } from "prisma/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  // Direct Prisma to custom models folder
  schema: "src/models/schema.prisma",

  migrations: {
    // Keep migrations organized inside models folder
    path: "src/models/migrations",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});
