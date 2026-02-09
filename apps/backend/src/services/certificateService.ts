import { nanoid } from "nanoid";
import { getDb } from "../db";
import { encrypt } from "../utils/crypto";
import { issueSelfSigned } from "./issuers/selfSignedIssuer";
import { issueAcme } from "./issuers/acmeIssuer";
import { createJob, finishJob, startJob } from "./jobService";
import { Site } from "./siteService";

export type CertificateRecord = {
  id: string;
  site_id: string;
  common_name: string;
  sans: string;
  status: string;
  issued_at: string;
  expires_at: string;
  cert_pem_enc: string;
  key_pem_enc: string;
  chain_pem_enc: string;
  created_at: string;
};

export function getLatestCertificateForSite(siteId: string): CertificateRecord | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT * FROM certificates WHERE site_id = ? ORDER BY issued_at DESC LIMIT 1`
    )
    .get(siteId) as CertificateRecord | undefined;
  return row ?? null;
}

export function listCertificatesForUser(userId: string): CertificateRecord[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT c.* FROM certificates c
       JOIN sites s ON s.id = c.site_id
       WHERE s.user_id = ?
       ORDER BY c.issued_at DESC`
    )
    .all(userId) as CertificateRecord[];
}

function insertCertificate(siteId: string, cert: {
  certPem: string;
  keyPem: string;
  chainPem: string;
  commonName: string;
  sans: string[];
  issuedAt: string;
  expiresAt: string;
}): CertificateRecord {
  const db = getDb();
  const record: CertificateRecord = {
    id: nanoid(),
    site_id: siteId,
    common_name: cert.commonName,
    sans: JSON.stringify(cert.sans),
    status: "issued",
    issued_at: cert.issuedAt,
    expires_at: cert.expiresAt,
    cert_pem_enc: encrypt(cert.certPem),
    key_pem_enc: encrypt(cert.keyPem),
    chain_pem_enc: encrypt(cert.chainPem),
    created_at: new Date().toISOString()
  };
  db.prepare(
    `INSERT INTO certificates (
      id, site_id, common_name, sans, status, issued_at, expires_at,
      cert_pem_enc, key_pem_enc, chain_pem_enc, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    record.id,
    record.site_id,
    record.common_name,
    record.sans,
    record.status,
    record.issued_at,
    record.expires_at,
    record.cert_pem_enc,
    record.key_pem_enc,
    record.chain_pem_enc,
    record.created_at
  );
  return record;
}

export async function issueCertificateForSite(site: Site) {
  const job = createJob(site.id, "renew");
  startJob(job.id);
  try {
    const sans: string[] = [];
    const cert = site.certificate_source === "letsencrypt"
      ? await issueAcme(site.domain, sans)
      : issueSelfSigned(site.domain, sans);
    const record = insertCertificate(site.id, cert);
    finishJob(job.id, "success");
    return record;
  } catch (error: any) {
    finishJob(job.id, "failed", error?.message ?? "issue failed");
    throw error;
  }
}
