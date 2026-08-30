// Persistent embedded PostgreSQL for local development/testing.
const EmbeddedPostgres = require("embedded-postgres").default || require("embedded-postgres");
const { Pool } = require("pg");

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: process.env.PGDATA || "/home/user/.pgdata2",
    user: "postgres",
    password: "postgres",
    port: 5432,
    persistent: true,
  });

  const fs = require("fs");
  const dataDir = process.env.PGDATA || "/home/user/.pgdata2";
  const alreadyInit = fs.existsSync(`${dataDir}/PG_VERSION`);

  if (!alreadyInit) {
    console.log("[pg] initialising data dir...");
    await pg.initialise();
  }
  console.log("[pg] starting on 5432...");
  await pg.start();

  const pool = new Pool({ connectionString: "postgresql://postgres:postgres@127.0.0.1:5432/postgres" });
  const r = await pool.query("SELECT current_database() AS db, version() AS v");
  console.log("[pg] READY, db =", r.rows[0].db);

  try {
    await pool.query("CREATE DATABASE app_db");
    console.log("[pg] created app_db");
  } catch (e) {
    if (!String(e.message).includes("already exists")) console.log("[pg] app_db:", e.message);
  }

  setInterval(() => {}, 1 << 30);
}

main().catch((e) => {
  console.error("[pg] fatal", e && e.message);
  process.exit(1);
});
