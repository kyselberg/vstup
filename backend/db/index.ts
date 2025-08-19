import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const client = createClient({
  url: `file:${join(__dirname, '..', 'storage.db')}`,
});

export const db = drizzle(client);
