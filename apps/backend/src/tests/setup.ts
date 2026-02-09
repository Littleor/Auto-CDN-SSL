import { beforeEach, afterAll } from "vitest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret-1234567890";
process.env.DATA_ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY ?? "test-encryption-key";
process.env.DATABASE_URL = ":memory:";
process.env.ACME_ACCOUNT_EMAIL = "test@example.com";

let getDb: typeof import("../db").getDb;
let closeDb: typeof import("../db").closeDb;
let migrate: typeof import("../db/migrate").migrate;

beforeEach(async () => {
  if (!getDb || !closeDb || !migrate) {
    const dbModule = await import("../db");
    const migrateModule = await import("../db/migrate");
    getDb = dbModule.getDb;
    closeDb = dbModule.closeDb;
    migrate = migrateModule.migrate;
  }
  migrate();
  const db = getDb();
  db.exec(`
    DELETE FROM deployments;
    DELETE FROM certificates;
    DELETE FROM sites;
    DELETE FROM provider_credentials;
    DELETE FROM refresh_tokens;
    DELETE FROM users;
    DELETE FROM jobs;
  `);
});

afterAll(async () => {
  if (!closeDb) {
    const dbModule = await import("../db");
    closeDb = dbModule.closeDb;
  }
  closeDb();
});
