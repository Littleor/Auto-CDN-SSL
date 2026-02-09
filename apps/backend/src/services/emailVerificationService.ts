import { nanoid } from "nanoid";
import { getDb } from "../db/index.js";
import { hashToken } from "../utils/crypto.js";
import { markUserEmailVerified } from "./userService.js";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

type EmailVerificationRecord = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  used_at: string | null;
};

export async function createEmailVerification(userId: string) {
  const db = getDb();
  const token = nanoid(48);
  const now = new Date();
  const expires = new Date(now.getTime() + DEFAULT_TTL_MS);
  const record: EmailVerificationRecord = {
    id: nanoid(),
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expires.toISOString(),
    created_at: now.toISOString(),
    used_at: null
  };

  await db
    .prepare(
      `INSERT INTO email_verifications (id, user_id, token_hash, expires_at, created_at, used_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      record.id,
      record.user_id,
      record.token_hash,
      record.expires_at,
      record.created_at,
      record.used_at
    );

  return { token, expiresAt: record.expires_at };
}

export async function verifyEmailToken(token: string) {
  const db = getDb();
  const hash = hashToken(token);
  const record = (await db
    .prepare("SELECT * FROM email_verifications WHERE token_hash = ?")
    .get(hash)) as EmailVerificationRecord | undefined;

  if (!record) {
    return { status: "invalid" as const };
  }
  if (record.used_at) {
    return { status: "used" as const };
  }
  if (new Date(record.expires_at).getTime() < Date.now()) {
    return { status: "expired" as const };
  }

  const usedAt = new Date().toISOString();
  await db
    .prepare("UPDATE email_verifications SET used_at = ? WHERE id = ?")
    .run(usedAt, record.id);
  await markUserEmailVerified(record.user_id);

  return { status: "verified" as const };
}
