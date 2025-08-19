import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

console.log(process.env);
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = createClient({
  url: process.env.DATABASE_URL,
});

export const db = drizzle(client);
