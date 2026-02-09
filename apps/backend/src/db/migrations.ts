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
  },
  {
    id: "003_provider_cert_fields",
    sql: `
    ALTER TABLE sites ADD COLUMN provider_cert_expires_at TEXT;
    ALTER TABLE sites ADD COLUMN provider_cert_name TEXT;
    `
  },
  {
    id: "004_provider_cert_deploy_at",
    sql: `
    ALTER TABLE sites ADD COLUMN provider_cert_deploy_at TEXT;
    `
  },
  {
    id: "005_acme_dns_fields",
    sql: `
    ALTER TABLE sites ADD COLUMN dns_credential_id TEXT;
    ALTER TABLE sites ADD COLUMN acme_challenge_type TEXT DEFAULT 'http-01';
    `
  },
  {
    id: "006_domain_settings",
    sql: `
    CREATE TABLE IF NOT EXISTS domain_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      apex_domain TEXT NOT NULL,
      challenge_type TEXT NOT NULL DEFAULT 'http-01',
      dns_credential_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, apex_domain),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(dns_credential_id) REFERENCES provider_credentials(id) ON DELETE SET NULL
    );
    `
  },
  {
    id: "007_user_settings",
    sql: `
    CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      renewal_hour INTEGER NOT NULL DEFAULT 3,
      renewal_minute INTEGER NOT NULL DEFAULT 0,
      renewal_threshold_days INTEGER NOT NULL DEFAULT 30,
      acme_account_email TEXT,
      acme_directory_url TEXT,
      acme_skip_local_verify INTEGER NOT NULL DEFAULT 0,
      acme_dns_wait_seconds INTEGER NOT NULL DEFAULT 20,
      acme_dns_ttl INTEGER NOT NULL DEFAULT 600,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    `
  }
];
