import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

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
  var db: ReturnType<typeof drizzle> | undefined;
}

let db: ReturnType<typeof drizzle>;

if (process.env.NODE_ENV === 'production') {
  db = drizzle({
    schema,
    client: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  });
} else {
  if (!global.db) {
    global.db = drizzle({
      schema,
      client: new Pool({
        connectionString: process.env.DATABASE_URL,
      }),
    });
  }
  db = global.db;
}

export { db };
export * from './schema';
