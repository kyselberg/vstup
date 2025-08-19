import { defineConfig } from 'drizzle-kit';
import { ENV } from './config/env.ts';

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: ENV.DATABASE_URL,
  },
});