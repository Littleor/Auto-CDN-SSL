import { nanoid } from "nanoid";
import { getDb } from "../db/index.js";
import { encrypt } from "../utils/crypto.js";
import { issueSelfSigned } from "./issuers/selfSignedIssuer.js";
import { issueAcme } from "./issuers/acmeIssuer.js";
import { createJob, finishJob, startJob, updateJobMessage } from "./jobService.js";
import { Site } from "./siteService.js";
import { decryptProviderConfig } from "./providerService.js";
import { getResolvedUserSettings, ResolvedUserSettings } from "./userSettingsService.js";
import { ResolvedAcmeChallenge, resolveAcmeChallenge } from "./acmeChallengeService.js";
import { getErrorMessage } from "../utils/errors.js";

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

type IssueTriggerSource = "manual_renew" | "scheduled_renew";

type IssueExecutionContext = {
  resolvedSettings: ResolvedUserSettings;
  challenge?: ResolvedAcmeChallenge;
};

type IssueRequestOptions = {
  triggerSource: IssueTriggerSource;
};

export async function getLatestCertificateForSite(siteId: string): Promise<CertificateRecord | null> {
  const db = getDb();
  const row = (await db
    .prepare(
      `SELECT * FROM certificates WHERE site_id = ? ORDER BY issued_at DESC LIMIT 1`
    )
    .get(siteId)) as CertificateRecord | undefined;
  return row ?? null;
}

export async function getCertificateByIdForSite(
  siteId: string,
  certificateId: string
): Promise<CertificateRecord | null> {
  const db = getDb();
  const row = (await db
    .prepare(
      `SELECT * FROM certificates WHERE id = ? AND site_id = ?`
    )
    .get(certificateId, siteId)) as CertificateRecord | undefined;
  return row ?? null;
}

export async function listCertificatesForUser(userId: string): Promise<CertificateRecord[]> {
  const db = getDb();
  return (await db
    .prepare(
      `SELECT c.* FROM certificates c
       JOIN sites s ON s.id = c.site_id
       WHERE s.user_id = ?
       ORDER BY c.issued_at DESC`
    )
    .all(userId)) as CertificateRecord[];
}

async function insertCertificate(siteId: string, cert: {
  certPem: string;
  keyPem: string;
  chainPem: string;
  commonName: string;
  sans: string[];
  issuedAt: string;
  expiresAt: string;
}): Promise<CertificateRecord> {
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
  await db
    .prepare(
      `INSERT INTO certificates (
        id, site_id, common_name, sans, status, issued_at, expires_at,
        cert_pem_enc, key_pem_enc, chain_pem_enc, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
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

async function prepareIssueExecutionContext(
  site: Site,
  settings?: ResolvedUserSettings
): Promise<IssueExecutionContext> {
  const resolvedSettings = settings ?? (await getResolvedUserSettings(site.user_id));
  const challenge =
    site.certificate_source === "letsencrypt"
      ? await resolveAcmeChallenge({
          userId: site.user_id,
          domain: site.domain,
          siteProviderCredentialId: site.provider_credential_id
        })
      : undefined;

  return {
    resolvedSettings,
    challenge
  };
}

function getIssueProviderSnapshot(site: Site, context: IssueExecutionContext) {
  if (site.certificate_source === "self_signed") {
    return {
      providerCredentialId: null,
      providerType: "self_signed",
      providerName: "自签证书"
    };
  }

  if (!context.challenge) {
    return {
      providerCredentialId: null,
      providerType: "letsencrypt",
      providerName: "Let's Encrypt"
    };
  }

  if (context.challenge.challengeType === "http-01") {
    return {
      providerCredentialId: null,
      providerType: "http-01",
      providerName: "HTTP-01 验证"
    };
  }

  return {
    providerCredentialId: context.challenge.dnsCredentialId,
    providerType: context.challenge.dnsCredential?.provider_type ?? "dns-01",
    providerName: context.challenge.dnsCredential?.name ?? "DNS-01 验证"
  };
}

async function runIssueJob(site: Site, jobId: string, context: IssueExecutionContext) {
  const resolvedSettings = context.resolvedSettings;
  await updateJobMessage(jobId, "准备证书申请");
  const sans: string[] = [];
  let cert;
  if (site.certificate_source === "letsencrypt") {
    await updateJobMessage(jobId, "准备 ACME 校验");
    let dnsConfig = undefined;
    const challenge = context.challenge ?? (await resolveAcmeChallenge({
      userId: site.user_id,
      domain: site.domain,
      siteProviderCredentialId: site.provider_credential_id
    }));
    const challengeType = challenge.challengeType;

    if (challengeType === "dns-01") {
      if (!challenge.dnsCredential) {
        throw new Error(
          "默认使用 DNS-01 续签，但未找到可用的腾讯云 DNS 凭据。请先在“域名验证”中绑定 DNS 凭据，或为站点绑定可复用的腾讯云凭据。"
        );
      }
      await updateJobMessage(jobId, "使用 DNS-01 进行 ACME 校验");
      dnsConfig = decryptProviderConfig(challenge.dnsCredential) as any;
    } else {
      await updateJobMessage(jobId, "使用 HTTP-01 进行 ACME 校验");
    }

    cert = await issueAcme(site.domain, sans, {
      challengeType,
      dnsConfig,
      onMessage: (message) => {
        void updateJobMessage(jobId, message).catch(() => undefined);
      },
      config: resolvedSettings.acme
    });
  } else {
    await updateJobMessage(jobId, "生成自签证书");
    cert = issueSelfSigned(site.domain, sans);
  }
  await updateJobMessage(jobId, "保存证书");
  return insertCertificate(site.id, cert);
}

export async function issueCertificateForSite(
  site: Site,
  settings?: ResolvedUserSettings,
  options: IssueRequestOptions = { triggerSource: "manual_renew" }
) {
  const context = await prepareIssueExecutionContext(site, settings);
  const providerSnapshot = getIssueProviderSnapshot(site, context);
  const job = await createJob({
    siteId: site.id,
    type: "renew",
    domain: site.domain,
    triggerSource: options.triggerSource,
    providerCredentialId: providerSnapshot.providerCredentialId,
    providerType: providerSnapshot.providerType,
    providerName: providerSnapshot.providerName
  });
  await startJob(job.id);
  try {
    const record = await runIssueJob(site, job.id, context);
    await finishJob(job.id, "success");
    return record;
  } catch (error: unknown) {
    await finishJob(job.id, "failed", getErrorMessage(error, "issue failed"));
    throw error;
  }
}

export async function enqueueCertificateIssue(
  site: Site,
  settings?: ResolvedUserSettings,
  options: IssueRequestOptions = { triggerSource: "manual_renew" }
) {
  const context = await prepareIssueExecutionContext(site, settings);
  const providerSnapshot = getIssueProviderSnapshot(site, context);
  const job = await createJob({
    siteId: site.id,
    type: "renew",
    domain: site.domain,
    triggerSource: options.triggerSource,
    providerCredentialId: providerSnapshot.providerCredentialId,
    providerType: providerSnapshot.providerType,
    providerName: providerSnapshot.providerName
  });
  await startJob(job.id);
  setTimeout(() => {
    void (async () => {
      try {
        await runIssueJob(site, job.id, context);
        await finishJob(job.id, "success");
      } catch (error: unknown) {
        try {
          await finishJob(job.id, "failed", getErrorMessage(error, "issue failed"));
        } catch {
          // Ignore secondary job update failures to avoid unhandled rejections.
        }
      }
    })();
  }, 0);
  return { jobId: job.id };
}
