import { nanoid } from "nanoid";
import { getDb } from "../db";
import { encrypt } from "../utils/crypto";
import { issueSelfSigned } from "./issuers/selfSignedIssuer";
import { issueAcme } from "./issuers/acmeIssuer";
import { createJob, finishJob, startJob, updateJobMessage } from "./jobService";
import { Site, listSites } from "./siteService";
import { getProviderCredential, decryptProviderConfig } from "./providerService";
import { getDomainSetting } from "./domainSettingsService";
import { getApexDomain } from "../utils/domain";

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

async function runIssueJob(site: Site, jobId: string) {
  updateJobMessage(jobId, "准备证书申请");
  const sans: string[] = [];
  let cert;
  if (site.certificate_source === "letsencrypt") {
    updateJobMessage(jobId, "进行 ACME 校验");
    let dnsConfig = undefined;
    let challengeType: "http-01" | "dns-01" = "http-01";
    let dnsCredentialId: string | null = null;
    const apexDomain = getApexDomain(site.domain);
    if (apexDomain) {
      const setting = getDomainSetting(site.user_id, apexDomain);
      if (setting) {
        challengeType = setting.challenge_type;
        dnsCredentialId = setting.dns_credential_id ?? null;
      } else {
        const inferred = listSites(site.user_id).find(
          (item) =>
            getApexDomain(item.domain) === apexDomain &&
            item.acme_challenge_type === "dns-01" &&
            item.dns_credential_id
        );
        if (inferred?.dns_credential_id) {
          challengeType = "dns-01";
          dnsCredentialId = inferred.dns_credential_id;
        }
      }
    }
    if (challengeType === "dns-01") {
      if (!dnsCredentialId) {
        throw new Error("DNS 凭据未配置");
      }
      const credential = getProviderCredential(site.user_id, dnsCredentialId);
      if (!credential) {
        throw new Error("DNS 凭据不存在");
      }
      if (!["tencent", "tencent_dns"].includes(credential.provider_type)) {
        throw new Error("当前仅支持腾讯云 DNS 凭据");
      }
      dnsConfig = decryptProviderConfig(credential) as any;
    }
    cert = await issueAcme(site.domain, sans, {
      challengeType,
      dnsConfig,
      onMessage: (message) => updateJobMessage(jobId, message)
    });
  } else {
    updateJobMessage(jobId, "生成自签证书");
    cert = issueSelfSigned(site.domain, sans);
  }
  updateJobMessage(jobId, "保存证书");
  return insertCertificate(site.id, cert);
}

export async function issueCertificateForSite(site: Site) {
  const job = createJob(site.id, "renew");
  startJob(job.id);
  try {
    const record = await runIssueJob(site, job.id);
    finishJob(job.id, "success");
    return record;
  } catch (error: any) {
    finishJob(job.id, "failed", error?.message ?? "issue failed");
    throw error;
  }
}

export function enqueueCertificateIssue(site: Site) {
  const job = createJob(site.id, "renew");
  startJob(job.id);
  setTimeout(async () => {
    try {
      await runIssueJob(site, job.id);
      finishJob(job.id, "success");
    } catch (error: any) {
      finishJob(job.id, "failed", error?.message ?? "issue failed");
    }
  }, 0);
  return { jobId: job.id };
}
