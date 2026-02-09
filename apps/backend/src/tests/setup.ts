import { beforeEach, afterAll } from "vitest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret-1234567890";
process.env.DATA_ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY ?? "test-encryption-key";
process.env.MYSQL_HOST = process.env.MYSQL_HOST ?? "127.0.0.1";
process.env.MYSQL_PORT = process.env.MYSQL_PORT ?? "3306";
process.env.MYSQL_USER = process.env.MYSQL_USER ?? "root";
process.env.MYSQL_PASSWORD = process.env.MYSQL_PASSWORD ?? "";
process.env.MYSQL_DATABASE = process.env.MYSQL_DATABASE ?? "auto_ssl_test";
process.env.SMTP_HOST = process.env.SMTP_HOST ?? "smtp.test.local";
process.env.SMTP_PORT = process.env.SMTP_PORT ?? "465";
process.env.SMTP_USER = process.env.SMTP_USER ?? "no_reply@test.local";
process.env.SMTP_PASSWORD = process.env.SMTP_PASSWORD ?? "test-password";
process.env.FROM_EMAIL = process.env.FROM_EMAIL ?? "no_reply@test.local";
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
  await migrate();
  const db = getDb();
  await db.exec(`
    DELETE FROM jobs;
    DELETE FROM deployments;
    DELETE FROM certificates;
    DELETE FROM sites;
    DELETE FROM domain_settings;
    DELETE FROM user_settings;
    DELETE FROM email_verifications;
    DELETE FROM provider_credentials;
    DELETE FROM refresh_tokens;
    DELETE FROM users;
  `);
});

afterAll(async () => {
  if (!closeDb) {
    const dbModule = await import("../db");
    closeDb = dbModule.closeDb;
  }
  await closeDb();
});
