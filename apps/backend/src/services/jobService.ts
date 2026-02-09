import { nanoid } from "nanoid";
import { getDb } from "../db";

export type Job = {
  id: string;
  site_id: string;
  type: string;
  status: string;
  message: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
};

export function createJob(siteId: string, type: string): Job {
  const db = getDb();
  const now = new Date().toISOString();
  const job: Job = {
    id: nanoid(),
    site_id: siteId,
    type,
    status: "queued",
    message: null,
    started_at: null,
    finished_at: null,
    created_at: now
  };
  db.prepare(
    `INSERT INTO jobs (id, site_id, type, status, message, started_at, finished_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    job.id,
    job.site_id,
    job.type,
    job.status,
    job.message,
    job.started_at,
    job.finished_at,
    job.created_at
  );
  return job;
}

export function startJob(jobId: string) {
  const db = getDb();
  db.prepare("UPDATE jobs SET status = ?, started_at = ? WHERE id = ?").run(
    "running",
    new Date().toISOString(),
    jobId
  );
}

export function finishJob(jobId: string, status: "success" | "failed", message?: string) {
  const db = getDb();
  db.prepare(
    "UPDATE jobs SET status = ?, message = ?, finished_at = ? WHERE id = ?"
  ).run(status, message ?? null, new Date().toISOString(), jobId);
}

export function updateJobMessage(jobId: string, message: string) {
  const db = getDb();
  db.prepare("UPDATE jobs SET message = ? WHERE id = ?").run(message, jobId);
}

export function getJobForUser(userId: string, jobId: string): Job | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT j.* FROM jobs j
       JOIN sites s ON s.id = j.site_id
       WHERE j.id = ? AND s.user_id = ?`
    )
    .get(jobId, userId) as Job | undefined;
  return row ?? null;
}
