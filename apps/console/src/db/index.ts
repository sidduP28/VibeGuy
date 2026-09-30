import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import * as path from 'node:path';

const sqlitePath =
  process.cwd().endsWith('apps/console') || process.cwd().endsWith('apps\\console')
    ? path.resolve(process.cwd(), 'local.sqlite')
    : path.resolve(process.cwd(), 'apps/console/local.sqlite');
const dbUrl = process.env.TURSO_DATABASE_URL || `file:${sqlitePath}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

let _db: ReturnType<typeof drizzle> | null = null;
let _schemaReady = false;

export function getDb() {
  if (_db) return _db;
  const client = createClient({ url: dbUrl, authToken });
  _db = drizzle(client, { schema });
  return _db;
}

// Lazy exported singleton for direct use in collect route etc.
export const db = getDb();

export async function ensureSchema() {
  if (_schemaReady) return;
  const db = getDb();
  // Run the seed (which creates tables) if needed
  const { seedDatabase } = await import('./seed');
  await seedDatabase();
  _schemaReady = true;
}
