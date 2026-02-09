import { nanoid } from "nanoid";
import { getDb } from "../db";

export type DomainSetting = {
  id: string;
  user_id: string;
  apex_domain: string;
  challenge_type: "http-01" | "dns-01";
  dns_credential_id: string | null;
  created_at: string;
  updated_at: string;
};

export function listDomainSettings(userId: string): DomainSetting[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM domain_settings WHERE user_id = ? ORDER BY apex_domain ASC")
    .all(userId) as DomainSetting[];
}

export function getDomainSetting(userId: string, apexDomain: string): DomainSetting | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM domain_settings WHERE user_id = ? AND apex_domain = ?")
    .get(userId, apexDomain) as DomainSetting | undefined;
  return row ?? null;
}

export function upsertDomainSetting(params: {
  userId: string;
  apexDomain: string;
  challengeType: "http-01" | "dns-01";
  dnsCredentialId: string | null;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = nanoid();
  db.prepare(
    `INSERT INTO domain_settings (
      id, user_id, apex_domain, challenge_type, dns_credential_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, apex_domain) DO UPDATE SET
      challenge_type = excluded.challenge_type,
      dns_credential_id = excluded.dns_credential_id,
      updated_at = excluded.updated_at`
  ).run(
    id,
    params.userId,
    params.apexDomain,
    params.challengeType,
    params.dnsCredentialId,
    now,
    now
  );
}
