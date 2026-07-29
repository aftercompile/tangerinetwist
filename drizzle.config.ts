import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

if (!process.env.DIRECT_URL) {
  throw new Error("DIRECT_URL is not set — copy .env.example to .env.local and fill it in.");
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL,
  },
  strict: true,
  verbose: true,
});
