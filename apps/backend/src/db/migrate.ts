import { getDb } from "./index.js";
import { migrations } from "./migrations.js";

export async function migrate() {
  const db = getDb();
  await db.exec(
    "CREATE TABLE IF NOT EXISTS db_migrations (id VARCHAR(64) PRIMARY KEY, applied_at VARCHAR(32) NOT NULL);"
  );
  const appliedRows = await db.prepare("SELECT id FROM db_migrations").all();
  const applied = new Set(appliedRows.map((row: any) => row.id));

  for (const migration of migrations) {
    if (applied.has(migration.id)) continue;
    await db.exec(migration.sql);
    await db
      .prepare("INSERT INTO db_migrations (id, applied_at) VALUES (?, ?)")
      .run(migration.id, new Date().toISOString());
  }
}

if (process.argv[1]?.endsWith("migrate.ts")) {
  migrate().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
}
