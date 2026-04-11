import { nanoid } from "nanoid";
import { getDb } from "../db/index.js";

export type Job = {
  id: string;
  site_id: string;
  type: string;
  domain: string | null;
  provider_credential_id: string | null;
  provider_type: string | null;
  provider_name: string | null;
  trigger_source: string;
  status: string;
  message: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
};

export async function createJob(params: {
  siteId: string;
  type: string;
  domain: string;
  triggerSource: "manual_renew" | "scheduled_renew";
  providerCredentialId?: string | null;
  providerType?: string | null;
  providerName?: string | null;
}): Promise<Job> {
  const db = getDb();
  const now = new Date().toISOString();
  const job: Job = {
    id: nanoid(),
    site_id: params.siteId,
    type: params.type,
    domain: params.domain,
    provider_credential_id: params.providerCredentialId ?? null,
    provider_type: params.providerType ?? null,
    provider_name: params.providerName ?? null,
    trigger_source: params.triggerSource,
    status: "queued",
    message: null,
    started_at: null,
    finished_at: null,
    created_at: now
  };
  await db
    .prepare(
      `INSERT INTO jobs (
        id, site_id, type, domain, provider_credential_id, provider_type, provider_name, trigger_source,
        status, message, started_at, finished_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      job.id,
      job.site_id,
      job.type,
      job.domain,
      job.provider_credential_id,
      job.provider_type,
      job.provider_name,
      job.trigger_source,
      job.status,
      job.message,
      job.started_at,
      job.finished_at,
      job.created_at
    );
  return job;
}

export async function startJob(jobId: string) {
  const db = getDb();
  await db
    .prepare("UPDATE jobs SET status = ?, started_at = ? WHERE id = ?")
    .run("running", new Date().toISOString(), jobId);
}

export async function finishJob(jobId: string, status: "success" | "failed", message?: string) {
  const db = getDb();
  await db
    .prepare(
      "UPDATE jobs SET status = ?, message = ?, finished_at = ? WHERE id = ?"
    )
    .run(status, message ?? null, new Date().toISOString(), jobId);
}

export async function updateJobMessage(jobId: string, message: string) {
  const db = getDb();
  await db.prepare("UPDATE jobs SET message = ? WHERE id = ?").run(message, jobId);
}

export async function getJobForUser(userId: string, jobId: string): Promise<Job | null> {
  const db = getDb();
  const row = (await db
    .prepare(
      `SELECT j.* FROM jobs j
       JOIN sites s ON s.id = j.site_id
       WHERE j.id = ? AND s.user_id = ?`
    )
    .get(jobId, userId)) as Job | undefined;
  return row ?? null;
}
