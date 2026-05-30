import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./lib/db/schema.ts', './lib/db/relations.ts'],
  out: './drizzle',
  dbCredentials: {
    url: process.env.USE_LOCAL_DB! == 'true' ? process.env.LOCAL_DATABASE_URL! : process.env.CLOUD_DATABASE_URL!,
  },
});
