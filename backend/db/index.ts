import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({
  url: 'file:storage.db',
});

export const db = drizzle(client);
