import { nanoid } from "nanoid";
import { getDb } from "../db/index.js";
import { encrypt, decrypt } from "../utils/crypto.js";
import { ProviderType } from "../providers/definitions.js";

export type ProviderCredential = {
  id: string;
  user_id: string;
  provider_type: ProviderType;
  name: string;
  config_json: string;
  created_at: string;
  updated_at: string;
};

export async function createProviderCredential(params: {
  userId: string;
  providerType: ProviderType;
  name: string;
  config: Record<string, unknown>;
}) {
  const db = getDb();
  const id = nanoid();
  const now = new Date().toISOString();
  const configEnc = encrypt(JSON.stringify(params.config));
  await db
    .prepare(
      `INSERT INTO provider_credentials (id, user_id, provider_type, name, config_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, params.userId, params.providerType, params.name, configEnc, now, now);
  return { id, created_at: now, updated_at: now };
}

export async function listProviderCredentials(userId: string): Promise<Array<ProviderCredential>> {
  const db = getDb();
  return (await db
    .prepare("SELECT * FROM provider_credentials WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId)) as ProviderCredential[];
}

export async function getProviderCredential(userId: string, id: string): Promise<ProviderCredential | null> {
  const db = getDb();
  const row = (await db
    .prepare("SELECT * FROM provider_credentials WHERE id = ? AND user_id = ?")
    .get(id, userId)) as ProviderCredential | undefined;
  return row ?? null;
}

export async function updateProviderCredential(params: {
  userId: string;
  id: string;
  name: string;
  config: Record<string, unknown>;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const configEnc = encrypt(JSON.stringify(params.config));
  await db
    .prepare(
      `UPDATE provider_credentials
       SET name = ?, config_json = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`
    )
    .run(params.name, configEnc, now, params.id, params.userId);
}

export async function deleteProviderCredential(userId: string, id: string) {
  const db = getDb();
  await db.prepare("DELETE FROM provider_credentials WHERE id = ? AND user_id = ?").run(id, userId);
}

export function decryptProviderConfig(row: ProviderCredential): Record<string, unknown> {
  return JSON.parse(decrypt(row.config_json));
}
