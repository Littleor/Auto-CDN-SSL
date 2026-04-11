import { nanoid } from "nanoid";
import { getDb } from "../db/index.js";
import { decrypt } from "../utils/crypto.js";
import { ProviderCredential, decryptProviderConfig } from "./providerService.js";
import { CertificateRecord } from "./certificateService.js";
import { deployToTencentCdn } from "../providers/tencent.js";
import { deployToQiniuCdn } from "../providers/qiniu.js";

export type DeploymentRecord = {
  id: string;
  site_id: string;
  certificate_id: string;
  domain: string;
  provider_credential_id: string;
  provider_type: string;
  provider_name: string;
  trigger_source: string;
  status: string;
  message: string | null;
  created_at: string;
};

export async function deployCertificate(params: {
  siteId: string;
  domain: string;
  certificate: CertificateRecord;
  providerCredential: ProviderCredential;
  triggerSource: "manual_deploy" | "scheduled_deploy";
}) {
  const db = getDb();
  const record: DeploymentRecord = {
    id: nanoid(),
    site_id: params.siteId,
    certificate_id: params.certificate.id,
    domain: params.domain,
    provider_credential_id: params.providerCredential.id,
    provider_type: params.providerCredential.provider_type,
    provider_name: params.providerCredential.name,
    trigger_source: params.triggerSource,
    status: "running",
    message: null,
    created_at: new Date().toISOString()
  };

  await db
    .prepare(
      `INSERT INTO deployments (
        id, site_id, certificate_id, domain, provider_credential_id, provider_type, provider_name, trigger_source,
        status, message, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      record.id,
      record.site_id,
      record.certificate_id,
      record.domain,
      record.provider_credential_id,
      record.provider_type,
      record.provider_name,
      record.trigger_source,
      record.status,
      record.message,
      record.created_at
    );

  try {
    const certPem = decrypt(params.certificate.cert_pem_enc);
    const keyPem = decrypt(params.certificate.key_pem_enc);
    const config = decryptProviderConfig(params.providerCredential);

    if (params.providerCredential.provider_type === "tencent") {
      await deployToTencentCdn({
        domain: params.domain,
        certPem,
        keyPem,
        config
      });
    } else if (params.providerCredential.provider_type === "qiniu") {
      await deployToQiniuCdn({
        domain: params.domain,
        certPem,
        keyPem,
        config
      });
    } else {
      throw new Error("Unsupported provider type");
    }

    await db
      .prepare(
        `UPDATE deployments SET status = ?, message = ? WHERE id = ?`
      )
      .run("success", null, record.id);
    return { ...record, status: "success" };
  } catch (error: any) {
    await db
      .prepare(
        `UPDATE deployments SET status = ?, message = ? WHERE id = ?`
      )
      .run("failed", error?.message ?? "deploy failed", record.id);
    throw error;
  }
}

export async function listDeployments(userId: string): Promise<DeploymentRecord[]> {
  const db = getDb();
  return (await db
    .prepare(
      `SELECT d.* FROM deployments d
       JOIN sites s ON s.id = d.site_id
       WHERE s.user_id = ?
       ORDER BY d.created_at DESC`
    )
    .all(userId)) as DeploymentRecord[];
}
