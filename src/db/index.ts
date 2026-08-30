import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPostgresqlDb?: NodePgDatabase;
};

function getRealDb(): NodePgDatabase {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({ connectionString: databaseUrl });
  }
  if (!globalForDb.__arenaNextJsPostgresqlDb) {
    globalForDb.__arenaNextJsPostgresqlDb = drizzle(globalForDb.__arenaNextJsPostgresqlPool);
  }
  return globalForDb.__arenaNextJsPostgresqlDb;
}

/**
 * Lazy, resilient DB access.
 * Importing this module never throws at build time even if DATABASE_URL is
 * absent. The pool is created on first actual query. When the URL is missing,
 * query methods throw at call time and the data layer falls back to seed data.
 */
export const db: NodePgDatabase = new Proxy({} as NodePgDatabase, {
  get(_target, prop: string | symbol) {
    if (prop === "then") return undefined; // not a thenable
    const real = getRealDb();
    const value = (real as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") return value.bind(real);
    return value;
  },
});

// Keep the pool exported for advanced usage when configured.
export const pool = new Proxy(
  {},
  {
    get(_t, prop: string | symbol) {
      if (prop === "then") return undefined;
      const real = getRealDb();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = (real as any).$client as Pool;
      const value = (p as unknown as Record<string | symbol, unknown>)[prop];
      if (typeof value === "function") return value.bind(p);
      return value;
    },
  }
) as unknown as Pool;
