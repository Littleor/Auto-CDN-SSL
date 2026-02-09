import { nanoid } from "nanoid";
import { getDb } from "../db/index.js";

export type DomainSetting = {
  id: string;
  user_id: string;
  apex_domain: string;
  challenge_type: "http-01" | "dns-01";
  dns_credential_id: string | null;
  created_at: string;
  updated_at: string;
};

export async function listDomainSettings(userId: string): Promise<DomainSetting[]> {
  const db = getDb();
  return (await db
    .prepare("SELECT * FROM domain_settings WHERE user_id = ? ORDER BY apex_domain ASC")
    .all(userId)) as DomainSetting[];
}

export async function getDomainSetting(userId: string, apexDomain: string): Promise<DomainSetting | null> {
  const db = getDb();
  const row = (await db
    .prepare("SELECT * FROM domain_settings WHERE user_id = ? AND apex_domain = ?")
    .get(userId, apexDomain)) as DomainSetting | undefined;
  return row ?? null;
}

export async function upsertDomainSetting(params: {
  userId: string;
  apexDomain: string;
  challengeType: "http-01" | "dns-01";
  dnsCredentialId: string | null;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = nanoid();
  await db
    .prepare(
      `INSERT INTO domain_settings (
        id, user_id, apex_domain, challenge_type, dns_credential_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        challenge_type = VALUES(challenge_type),
        dns_credential_id = VALUES(dns_credential_id),
        updated_at = VALUES(updated_at)`
    )
    .run(
      id,
      params.userId,
      params.apexDomain,
      params.challengeType,
      params.dnsCredentialId,
      now,
      now
    );
}
