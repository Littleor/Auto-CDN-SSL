export type Migration = { id: string; sql: string };

export const migrations: Migration[] = [
  {
    id: "001_init",
    sql: `
    CREATE TABLE IF NOT EXISTS db_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      revoked_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS provider_credentials (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider_type TEXT NOT NULL,
      name TEXT NOT NULL,
      config_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      domain TEXT NOT NULL,
      provider_credential_id TEXT,
      certificate_source TEXT NOT NULL,
      auto_renew INTEGER NOT NULL DEFAULT 1,
      renew_days_before INTEGER NOT NULL DEFAULT 30,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, domain),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(provider_credential_id) REFERENCES provider_credentials(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      common_name TEXT NOT NULL,
      sans TEXT NOT NULL,
      status TEXT NOT NULL,
      issued_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      cert_pem_enc TEXT NOT NULL,
      key_pem_enc TEXT NOT NULL,
      chain_pem_enc TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deployments (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      certificate_id TEXT NOT NULL,
      provider_type TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
      FOREIGN KEY(certificate_id) REFERENCES certificates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT,
      started_at TEXT,
      finished_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    );
    `
  },
  {
    id: "002_provider_sync",
    sql: `
    ALTER TABLE sites ADD COLUMN provider_status TEXT;
    ALTER TABLE sites ADD COLUMN provider_https TEXT;
    `
  }
];
