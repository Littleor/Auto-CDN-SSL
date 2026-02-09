import { nanoid } from "nanoid";
import { getDb } from "../db";

export type User = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  email_verified: number;
  email_verified_at: string | null;
  created_at: string;
};

export async function createUser(params: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<User> {
  const db = getDb();
  const id = nanoid();
  const now = new Date().toISOString();
  const stmt = db.prepare(
    `INSERT INTO users (id, email, name, password_hash, email_verified, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  await stmt.run(id, params.email, params.name, params.passwordHash, 0, now);
  return {
    id,
    email: params.email,
    name: params.name,
    password_hash: params.passwordHash,
    email_verified: 0,
    email_verified_at: null,
    created_at: now
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = getDb();
  const row = await db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  return row ? (row as User) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const db = getDb();
  const row = await db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return row ? (row as User) : null;
}

export async function listUsers(): Promise<User[]> {
  const db = getDb();
  return (await db.prepare("SELECT * FROM users ORDER BY created_at DESC").all()) as User[];
}

export async function markUserEmailVerified(userId: string) {
  const db = getDb();
  const now = new Date().toISOString();
  await db
    .prepare("UPDATE users SET email_verified = ?, email_verified_at = ? WHERE id = ?")
    .run(1, now, userId);
}
