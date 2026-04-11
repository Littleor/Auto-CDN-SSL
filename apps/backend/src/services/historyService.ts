import { getDb } from "../db/index.js";

type JobHistoryRow = {
  id: string;
  site_id: string;
  type: string;
  status: string;
  message: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  resolved_domain: string | null;
  resolved_provider_credential_id: string | null;
  resolved_provider_type: string | null;
  resolved_provider_name: string | null;
  trigger_source: string;
};

type DeploymentHistoryRow = {
  id: string;
  site_id: string;
  certificate_id: string;
  status: string;
  message: string | null;
  created_at: string;
  resolved_domain: string | null;
  resolved_provider_credential_id: string | null;
  resolved_provider_type: string | null;
  resolved_provider_name: string | null;
  trigger_source: string;
};

export type HistoryRecord = {
  id: string;
  category: "renew" | "deploy";
  siteId: string;
  domain: string | null;
  providerCredentialId: string | null;
  providerType: string | null;
  providerName: string | null;
  triggerSource: string;
  status: string;
  message: string | null;
  occurredAt: string;
  createdAt: string;
};

export async function listHistoryForUser(userId: string): Promise<HistoryRecord[]> {
  const db = getDb();

  const jobs = (await db
    .prepare(
      `SELECT
         j.*,
         COALESCE(j.domain, s.domain) AS resolved_domain,
         COALESCE(j.provider_credential_id, p.id) AS resolved_provider_credential_id,
         COALESCE(j.provider_type, p.provider_type) AS resolved_provider_type,
         COALESCE(j.provider_name, p.name) AS resolved_provider_name
       FROM jobs j
       JOIN sites s ON s.id = j.site_id
       LEFT JOIN provider_credentials p ON p.id = COALESCE(j.provider_credential_id, s.provider_credential_id)
       WHERE s.user_id = ?
       ORDER BY COALESCE(j.finished_at, j.started_at, j.created_at) DESC`
    )
    .all(userId)) as JobHistoryRow[];

  const deployments = (await db
    .prepare(
      `SELECT
         d.*,
         COALESCE(d.domain, s.domain) AS resolved_domain,
         COALESCE(d.provider_credential_id, p.id) AS resolved_provider_credential_id,
         COALESCE(d.provider_type, p.provider_type) AS resolved_provider_type,
         COALESCE(d.provider_name, p.name) AS resolved_provider_name
       FROM deployments d
       JOIN sites s ON s.id = d.site_id
       LEFT JOIN provider_credentials p ON p.id = COALESCE(d.provider_credential_id, s.provider_credential_id)
       WHERE s.user_id = ?
       ORDER BY d.created_at DESC`
    )
    .all(userId)) as DeploymentHistoryRow[];

  const history = [
    ...jobs.map((job) => ({
      id: job.id,
      category: "renew" as const,
      siteId: job.site_id,
      domain: job.resolved_domain,
      providerCredentialId: job.resolved_provider_credential_id,
      providerType: job.resolved_provider_type,
      providerName: job.resolved_provider_name,
      triggerSource: job.trigger_source,
      status: job.status,
      message: job.message,
      occurredAt: job.finished_at ?? job.started_at ?? job.created_at,
      createdAt: job.created_at
    })),
    ...deployments.map((deployment) => ({
      id: deployment.id,
      category: "deploy" as const,
      siteId: deployment.site_id,
      domain: deployment.resolved_domain,
      providerCredentialId: deployment.resolved_provider_credential_id,
      providerType: deployment.resolved_provider_type,
      providerName: deployment.resolved_provider_name,
      triggerSource: deployment.trigger_source,
      status: deployment.status,
      message: deployment.message,
      occurredAt: deployment.created_at,
      createdAt: deployment.created_at
    }))
  ];

  return history.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
}
