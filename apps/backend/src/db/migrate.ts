import { getDb } from "./index";
import { migrations } from "./migrations";

export function migrate() {
  const db = getDb();
  db.exec(`CREATE TABLE IF NOT EXISTS db_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL);`);
  const applied = new Set(
    db.prepare("SELECT id FROM db_migrations").all().map((row: any) => row.id)
  );

  for (const migration of migrations) {
    if (applied.has(migration.id)) continue;
    db.exec(migration.sql);
    db
      .prepare("INSERT INTO db_migrations (id, applied_at) VALUES (?, ?)")
      .run(migration.id, new Date().toISOString());
  }
}

if (process.argv[1]?.endsWith("migrate.ts")) {
  migrate();
}
