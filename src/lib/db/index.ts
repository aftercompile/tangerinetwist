import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — copy .env.example to .env.local and fill it in.");
}

// Next.js dev mode re-evaluates this module on every hot-reload; without caching the client
// on `globalThis`, each reload opens a fresh postgres.js connection pool without closing the
// old one, exhausting Supabase's pooler connection limit within a few edits.
const globalForDb = globalThis as unknown as { postgresClient?: postgres.Sql };

const client =
  globalForDb.postgresClient ??
  // prepare: false is required for Supabase's transaction pooler (pgbouncer) mode.
  postgres(process.env.DATABASE_URL, { prepare: false, max: 10 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgresClient = client;
}

export const db = drizzle(client, { schema });
