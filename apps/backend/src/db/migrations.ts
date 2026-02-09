export type Migration = { id: string; sql: string };

export const migrations: Migration[] = [
  {
    id: "001_init",
    sql: `
    CREATE TABLE IF NOT EXISTS db_migrations (
      id VARCHAR(64) PRIMARY KEY,
      applied_at VARCHAR(32) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(32) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at VARCHAR(32) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(32) NOT NULL,
      token_hash VARCHAR(64) NOT NULL,
      expires_at VARCHAR(32) NOT NULL,
      created_at VARCHAR(32) NOT NULL,
      revoked_at VARCHAR(32) NULL,
      INDEX idx_refresh_tokens_user_id (user_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS provider_credentials (
      id VARCHAR(32) PRIMARY KEY,
      user_id VARCHAR(32) NOT NULL,
      provider_type VARCHAR(32) NOT NULL,
      name VARCHAR(255) NOT NULL,
      config_json LONGTEXT NOT NULL,
      created_at VARCHAR(32) NOT NULL,
      updated_at VARCHAR(32) NOT NULL,
      INDEX idx_provider_credentials_user_id (user_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS sites (
      id VARCHAR(32) PRIMARY KEY,
      user_id VARCHAR(32) NOT NULL,
      name VARCHAR(255) NOT NULL,
      domain VARCHAR(255) NOT NULL,
      provider_credential_id VARCHAR(32),
      certificate_source VARCHAR(32) NOT NULL,
      auto_renew TINYINT NOT NULL DEFAULT 1,
      renew_days_before INT NOT NULL DEFAULT 30,
      status VARCHAR(32) NOT NULL DEFAULT 'active',
      created_at VARCHAR(32) NOT NULL,
      updated_at VARCHAR(32) NOT NULL,
      UNIQUE KEY uniq_sites_user_domain (user_id, domain),
      INDEX idx_sites_user_id (user_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(provider_credential_id) REFERENCES provider_credentials(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS certificates (
      id VARCHAR(32) PRIMARY KEY,
      site_id VARCHAR(32) NOT NULL,
      common_name VARCHAR(255) NOT NULL,
      sans LONGTEXT NOT NULL,
      status VARCHAR(32) NOT NULL,
      issued_at VARCHAR(32) NOT NULL,
      expires_at VARCHAR(32) NOT NULL,
      cert_pem_enc LONGTEXT NOT NULL,
      key_pem_enc LONGTEXT NOT NULL,
      chain_pem_enc LONGTEXT NOT NULL,
      created_at VARCHAR(32) NOT NULL,
      INDEX idx_certificates_site_id (site_id),
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS deployments (
      id VARCHAR(32) PRIMARY KEY,
      site_id VARCHAR(32) NOT NULL,
      certificate_id VARCHAR(32) NOT NULL,
      provider_type VARCHAR(32) NOT NULL,
      status VARCHAR(32) NOT NULL,
      message TEXT,
      created_at VARCHAR(32) NOT NULL,
      INDEX idx_deployments_site_id (site_id),
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
      FOREIGN KEY(certificate_id) REFERENCES certificates(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS jobs (
      id VARCHAR(32) PRIMARY KEY,
      site_id VARCHAR(32) NOT NULL,
      type VARCHAR(32) NOT NULL,
      status VARCHAR(32) NOT NULL,
      message TEXT,
      started_at VARCHAR(32),
      finished_at VARCHAR(32),
      created_at VARCHAR(32) NOT NULL,
      INDEX idx_jobs_site_id (site_id),
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    id: "002_provider_sync",
    sql: `
    ALTER TABLE sites ADD COLUMN provider_status VARCHAR(64);
    ALTER TABLE sites ADD COLUMN provider_https VARCHAR(64);
    `
  },
  {
    id: "003_provider_cert_fields",
    sql: `
    ALTER TABLE sites ADD COLUMN provider_cert_expires_at VARCHAR(32);
    ALTER TABLE sites ADD COLUMN provider_cert_name VARCHAR(255);
    `
  },
  {
    id: "004_provider_cert_deploy_at",
    sql: `
    ALTER TABLE sites ADD COLUMN provider_cert_deploy_at VARCHAR(32);
    `
  },
  {
    id: "005_acme_dns_fields",
    sql: `
    ALTER TABLE sites ADD COLUMN dns_credential_id VARCHAR(32);
    ALTER TABLE sites ADD COLUMN acme_challenge_type VARCHAR(32) DEFAULT 'http-01';
    `
  },
  {
    id: "006_domain_settings",
    sql: `
    CREATE TABLE IF NOT EXISTS domain_settings (
      id VARCHAR(32) PRIMARY KEY,
      user_id VARCHAR(32) NOT NULL,
      apex_domain VARCHAR(255) NOT NULL,
      challenge_type VARCHAR(32) NOT NULL DEFAULT 'http-01',
      dns_credential_id VARCHAR(32),
      created_at VARCHAR(32) NOT NULL,
      updated_at VARCHAR(32) NOT NULL,
      UNIQUE KEY uniq_domain_settings_user_domain (user_id, apex_domain),
      INDEX idx_domain_settings_user_id (user_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(dns_credential_id) REFERENCES provider_credentials(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    id: "007_user_settings",
    sql: `
    CREATE TABLE IF NOT EXISTS user_settings (
      id VARCHAR(32) PRIMARY KEY,
      user_id VARCHAR(32) NOT NULL UNIQUE,
      renewal_hour INT NOT NULL DEFAULT 3,
      renewal_minute INT NOT NULL DEFAULT 0,
      renewal_threshold_days INT NOT NULL DEFAULT 30,
      acme_account_email VARCHAR(255),
      acme_directory_url VARCHAR(255),
      acme_skip_local_verify TINYINT NOT NULL DEFAULT 0,
      acme_dns_wait_seconds INT NOT NULL DEFAULT 20,
      acme_dns_ttl INT NOT NULL DEFAULT 600,
      created_at VARCHAR(32) NOT NULL,
      updated_at VARCHAR(32) NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    id: "008_email_verification",
    sql: `
    ALTER TABLE users ADD COLUMN email_verified TINYINT NOT NULL DEFAULT 0;
    ALTER TABLE users ADD COLUMN email_verified_at VARCHAR(32);

    CREATE TABLE IF NOT EXISTS email_verifications (
      id VARCHAR(32) PRIMARY KEY,
      user_id VARCHAR(32) NOT NULL,
      token_hash VARCHAR(64) NOT NULL,
      expires_at VARCHAR(32) NOT NULL,
      created_at VARCHAR(32) NOT NULL,
      used_at VARCHAR(32),
      UNIQUE KEY uniq_email_verifications_token (token_hash),
      INDEX idx_email_verifications_user_id (user_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  }
];
