import { nanoid } from "nanoid";
import { getDb } from "../db";
import { encrypt, decrypt } from "../utils/crypto";
import { ProviderType } from "../providers/definitions";

export type ProviderCredential = {
  id: string;
  user_id: string;
  provider_type: ProviderType;
  name: string;
  config_json: string;
  created_at: string;
  updated_at: string;
};

export function createProviderCredential(params: {
  userId: string;
  providerType: ProviderType;
  name: string;
  config: Record<string, unknown>;
}) {
  const db = getDb();
  const id = nanoid();
  const now = new Date().toISOString();
  const configEnc = encrypt(JSON.stringify(params.config));
  db.prepare(
    `INSERT INTO provider_credentials (id, user_id, provider_type, name, config_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    params.userId,
    params.providerType,
    params.name,
    configEnc,
    now,
    now
  );
  return { id, created_at: now, updated_at: now };
}

export function listProviderCredentials(userId: string): Array<ProviderCredential> {
  const db = getDb();
  return db
    .prepare("SELECT * FROM provider_credentials WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as ProviderCredential[];
}

export function getProviderCredential(userId: string, id: string): ProviderCredential | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM provider_credentials WHERE id = ? AND user_id = ?")
    .get(id, userId) as ProviderCredential | undefined;
  return row ?? null;
}

export function updateProviderCredential(params: {
  userId: string;
  id: string;
  name: string;
  config: Record<string, unknown>;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const configEnc = encrypt(JSON.stringify(params.config));
  db.prepare(
    `UPDATE provider_credentials
     SET name = ?, config_json = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`
  ).run(params.name, configEnc, now, params.id, params.userId);
}

export function deleteProviderCredential(userId: string, id: string) {
  const db = getDb();
  db.prepare("DELETE FROM provider_credentials WHERE id = ? AND user_id = ?").run(id, userId);
}

export function decryptProviderConfig(row: ProviderCredential): Record<string, unknown> {
  return JSON.parse(decrypt(row.config_json));
}
