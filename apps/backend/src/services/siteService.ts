import { nanoid } from "nanoid";
import { getDb } from "../db";

export type Site = {
  id: string;
  user_id: string;
  name: string;
  domain: string;
  provider_credential_id: string | null;
  certificate_source: "letsencrypt" | "self_signed";
  auto_renew: number;
  renew_days_before: number;
  status: string;
  provider_status?: string | null;
  provider_https?: string | null;
  provider_cert_expires_at?: string | null;
  provider_cert_name?: string | null;
  provider_cert_deploy_at?: string | null;
  created_at: string;
  updated_at: string;
};

export function createSite(params: {
  userId: string;
  name: string;
  domain: string;
  providerCredentialId: string | null;
  certificateSource: "letsencrypt" | "self_signed";
  autoRenew: boolean;
  renewDaysBefore: number;
}) {
  const db = getDb();
  const id = nanoid();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO sites (
      id, user_id, name, domain, provider_credential_id, certificate_source,
      auto_renew, renew_days_before, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    params.userId,
    params.name,
    params.domain,
    params.providerCredentialId,
    params.certificateSource,
    params.autoRenew ? 1 : 0,
    params.renewDaysBefore,
    "active",
    now,
    now
  );
  return { id, created_at: now, updated_at: now };
}

export function listSites(userId: string): Site[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM sites WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as Site[];
}

export function getSite(userId: string, id: string): Site | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM sites WHERE id = ? AND user_id = ?")
    .get(id, userId) as Site | undefined;
  return row ?? null;
}

export function updateSite(params: {
  userId: string;
  id: string;
  name: string;
  domain: string;
  providerCredentialId: string | null;
  certificateSource: "letsencrypt" | "self_signed";
  autoRenew: boolean;
  renewDaysBefore: number;
  status: string;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE sites
     SET name = ?, domain = ?, provider_credential_id = ?, certificate_source = ?,
         auto_renew = ?, renew_days_before = ?, status = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`
  ).run(
    params.name,
    params.domain,
    params.providerCredentialId,
    params.certificateSource,
    params.autoRenew ? 1 : 0,
    params.renewDaysBefore,
    params.status,
    now,
    params.id,
    params.userId
  );
}

export function deleteSite(userId: string, id: string) {
  const db = getDb();
  db.prepare("DELETE FROM sites WHERE id = ? AND user_id = ?").run(id, userId);
}
