import { nanoid } from "nanoid";
import { getDb } from "../db";

export type User = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
};

export function createUser(params: {
  email: string;
  name: string;
  passwordHash: string;
}): User {
  const db = getDb();
  const id = nanoid();
  const now = new Date().toISOString();
  const stmt = db.prepare(
    `INSERT INTO users (id, email, name, password_hash, created_at)
     VALUES (?, ?, ?, ?, ?)`
  );
  stmt.run(id, params.email, params.name, params.passwordHash, now);
  return { id, email: params.email, name: params.name, password_hash: params.passwordHash, created_at: now };
}

export function findUserByEmail(email: string): User | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  return row ? (row as User) : null;
}

export function findUserById(id: string): User | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return row ? (row as User) : null;
}

export function listUsers(): User[] {
  const db = getDb();
  return db.prepare("SELECT * FROM users ORDER BY created_at DESC").all() as User[];
}
