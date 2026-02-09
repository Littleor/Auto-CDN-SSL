import { nanoid } from "nanoid";
import { getDb } from "../db";
import { ProviderCredential, decryptProviderConfig } from "./providerService";
import { listTencentDomains } from "../providers/tencent";
import { listQiniuDomains } from "../providers/qiniu";

export type SyncedDomain = {
  domain: string;
  status: string | null;
  https: string | null;
  certExpiresAt: string | null;
  certName: string | null;
  certDeployAt: string | null;
};

export async function syncProviderSites(userId: string, credential: ProviderCredential) {
  const config = decryptProviderConfig(credential);
  let domains: SyncedDomain[] = [];

  if (credential.provider_type === "tencent") {
    domains = await listTencentDomains(config);
  } else if (credential.provider_type === "qiniu") {
    domains = await listQiniuDomains(config);
  } else if (credential.provider_type === "tencent_dns") {
    throw new Error("DNS 凭据不支持站点同步");
  } else {
    throw new Error("Unsupported provider type");
  }

  const db = getDb();
  const now = new Date().toISOString();
  let created = 0;
  let updated = 0;

  const findStmt = db.prepare(
    "SELECT id, name FROM sites WHERE user_id = ? AND domain = ?"
  );
  const upsertStmt = db.prepare(
    `INSERT INTO sites (
      id, user_id, name, domain, provider_credential_id, certificate_source,
      auto_renew, renew_days_before, status, provider_status, provider_https,
      provider_cert_expires_at, provider_cert_name, provider_cert_deploy_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      provider_credential_id = VALUES(provider_credential_id),
      provider_status = VALUES(provider_status),
      provider_https = VALUES(provider_https),
      provider_cert_expires_at = VALUES(provider_cert_expires_at),
      provider_cert_name = VALUES(provider_cert_name),
      provider_cert_deploy_at = VALUES(provider_cert_deploy_at),
      updated_at = VALUES(updated_at)`
  );

  for (const item of domains) {
    const existing = (await findStmt.get(userId, item.domain)) as
      | { id: string; name: string }
      | undefined;
    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }

    await upsertStmt.run(
      existing?.id ?? nanoid(),
      userId,
      existing?.name ?? item.domain,
      item.domain,
      credential.id,
      "letsencrypt",
      0,
      30,
      "active",
      item.status,
      item.https,
      item.certExpiresAt,
      item.certName,
      item.certDeployAt,
      now,
      now
    );
  }

  return {
    total: domains.length,
    created,
    updated
  };
}
