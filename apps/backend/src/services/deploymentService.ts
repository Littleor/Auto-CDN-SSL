import { nanoid } from "nanoid";
import { getDb } from "../db";
import { decrypt } from "../utils/crypto";
import { ProviderCredential, decryptProviderConfig } from "./providerService";
import { CertificateRecord } from "./certificateService";
import { deployToTencentCdn } from "../providers/tencent";
import { deployToQiniuCdn } from "../providers/qiniu";

export type DeploymentRecord = {
  id: string;
  site_id: string;
  certificate_id: string;
  provider_type: string;
  status: string;
  message: string | null;
  created_at: string;
};

export async function deployCertificate(params: {
  siteId: string;
  domain: string;
  certificate: CertificateRecord;
  providerCredential: ProviderCredential;
}) {
  const db = getDb();
  const record: DeploymentRecord = {
    id: nanoid(),
    site_id: params.siteId,
    certificate_id: params.certificate.id,
    provider_type: params.providerCredential.provider_type,
    status: "running",
    message: null,
    created_at: new Date().toISOString()
  };

  db.prepare(
    `INSERT INTO deployments (id, site_id, certificate_id, provider_type, status, message, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    record.id,
    record.site_id,
    record.certificate_id,
    record.provider_type,
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

    db.prepare(
      `UPDATE deployments SET status = ?, message = ? WHERE id = ?`
    ).run("success", null, record.id);
    return { ...record, status: "success" };
  } catch (error: any) {
    db.prepare(
      `UPDATE deployments SET status = ?, message = ? WHERE id = ?`
    ).run("failed", error?.message ?? "deploy failed", record.id);
    throw error;
  }
}

export function listDeployments(userId: string): DeploymentRecord[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT d.* FROM deployments d
       JOIN sites s ON s.id = d.site_id
       WHERE s.user_id = ?
       ORDER BY d.created_at DESC`
    )
    .all(userId) as DeploymentRecord[];
}
