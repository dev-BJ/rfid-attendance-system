import { drizzle as pgDrizzle } from "drizzle-orm/node-postgres";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Database connection setup
 *
 * To connect to a real database:
 * 1. Set DATABASE_URL environment variable to your PostgreSQL connection string
 * 2. Examples:
 *    - Neon: postgresql://user:password@ep-xxxx.neon.tech/dbname
 *    - Local: postgresql://user:password@localhost:5432/dbname
 *
 * The database will be automatically initialized with the schema from lib/db/schema.ts
 */

declare global {
  var db: ReturnType<typeof pgDrizzle | typeof neonDrizzle> | undefined;
}

let db: ReturnType<typeof pgDrizzle | typeof neonDrizzle>;
console.log('[DB Init] NODE_ENV:', process.env.NODE_ENV);

if (process.env.USE_LOCAL_DB == "true") {
  const pool = new Pool({
    connectionString: process.env.LOCAL_DATABASE_URL!,
  });
  db = pgDrizzle(pool, {
    schema,
  });
} else {
  const sql = neon(process.env.CLOUD_DATABASE_URL!);
  db = neonDrizzle(sql, {
    schema,
  });
}

export { db };
export * from "./schema";
