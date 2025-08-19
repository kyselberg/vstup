import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { ENV } from '../config/env.ts';

if (!ENV.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = createClient({
  url: ENV.DATABASE_URL,
});

export const db = drizzle(client);
