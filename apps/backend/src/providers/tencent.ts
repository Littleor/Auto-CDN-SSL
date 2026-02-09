import tencentcloud from "tencentcloud-sdk-nodejs";

export async function deployToTencentCdn(params: {
  domain: string;
  certPem: string;
  keyPem: string;
  config: Record<string, any>;
}) {
  const secretId = params.config.secretId as string | undefined;
  const secretKey = params.config.secretKey as string | undefined;
  const region = (params.config.region as string | undefined) ?? "ap-guangzhou";
  if (!secretId || !secretKey) {
    throw new Error("Tencent credentials missing");
  }

  const sdk: any = tencentcloud as any;
  const Client = sdk?.cdn?.v20180606?.Client;
  if (!Client) {
    throw new Error("Tencent Cloud CDN SDK not available");
  }

  const client = new Client({
    credential: { secretId, secretKey },
    region,
    profile: {
      httpProfile: {
        endpoint: "cdn.tencentcloudapi.com"
      }
    }
  });

  const uploadRes = await client.UploadCert({
    Cert: params.certPem,
    Key: params.keyPem,
    CertType: "SVR",
    Alias: `auto-ssl-${params.domain}-${Date.now()}`
  });

  const certId = uploadRes?.CertId || uploadRes?.CertificateId;
  if (!certId) {
    throw new Error("Failed to upload cert to Tencent CDN");
  }

  await client.UpdateDomainConfig({
    Domain: params.domain,
    Https: {
      Switch: "on",
      Http2: "on",
      OcspStapling: "on",
      CertInfo: {
        CertId: certId,
        CertType: "SVR"
      }
    }
  });
}
