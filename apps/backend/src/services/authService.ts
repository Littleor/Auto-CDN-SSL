import { nanoid } from "nanoid";
import { getDb } from "../db/index.js";
import { hashToken } from "../utils/crypto.js";

export type RefreshTokenRecord = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  revoked_at: string | null;
};

export async function createRefreshToken(userId: string, ttlDays: number): Promise<{
  token: string;
  record: RefreshTokenRecord;
}> {
  const db = getDb();
  const token = nanoid(64);
  const now = new Date();
  const expires = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);
  const record: RefreshTokenRecord = {
    id: nanoid(),
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expires.toISOString(),
    created_at: now.toISOString(),
    revoked_at: null
  };
  await db
    .prepare(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at, revoked_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      record.id,
      record.user_id,
      record.token_hash,
      record.expires_at,
      record.created_at,
      record.revoked_at
    );
  return { token, record };
}

export async function findValidRefreshToken(token: string): Promise<RefreshTokenRecord | null> {
  const db = getDb();
  const hash = hashToken(token);
  const row = (await db
    .prepare(
      `SELECT * FROM refresh_tokens
       WHERE token_hash = ? AND revoked_at IS NULL`
    )
    .get(hash)) as RefreshTokenRecord | undefined;
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return row;
}

export async function revokeRefreshToken(token: string) {
  const db = getDb();
  const hash = hashToken(token);
  await db
    .prepare(
      `UPDATE refresh_tokens SET revoked_at = ? WHERE token_hash = ?`
    )
    .run(new Date().toISOString(), hash);
}
