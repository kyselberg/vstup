
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findRepoRoot(startDir: string): string {
  let dir = startDir;
  for (;;) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return startDir;
    dir = parent;
  }
}

const repoRoot = findRepoRoot(__dirname);

const candidates = [
  process.env.ENV_PATH,
  path.join(repoRoot, '.env'),
  path.join(process.cwd(), '.env'),
].filter(Boolean) as string[];

const envPath = candidates.find(p => fs.existsSync(p));
dotenv.config(envPath ? { path: envPath } : undefined);

if (process.env.DEBUG_ENV) {
  console.log('[env] repoRoot =', repoRoot);
  console.log('[env] loaded =', envPath ?? '(default .env resolution)');
}

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;
