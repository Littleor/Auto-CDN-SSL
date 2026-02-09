import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { env } from "../config/env";

let db: Database.Database | null = null;

function ensureDirForDb(dbPath: string) {
  if (dbPath === ":memory:") return;
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getDb(): Database.Database {
  if (db) return db;
  const dbPath = env.DATABASE_URL;
  ensureDirForDb(dbPath);
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
