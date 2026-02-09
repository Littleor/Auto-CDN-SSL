import tencentcloud from "tencentcloud-sdk-nodejs";

type TencentDomainInfo = {
  domain: string;
  status: string | null;
  https: string | null;
  certExpiresAt: string | null;
  certName: string | null;
  certDeployAt: string | null;
};

export async function deployToTencentCdn(params: {
  domain: string;
  certPem: string;
  keyPem: string;
  config: Record<string, any>;
}) {
  const secretId = params.config.secretId as string | undefined;
  const secretKey = params.config.secretKey as string | undefined;
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
    region: "",
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

export async function listTencentDomains(config: Record<string, any>): Promise<TencentDomainInfo[]> {
  const secretId = config.secretId as string | undefined;
  const secretKey = config.secretKey as string | undefined;
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
    region: "",
    profile: {
      httpProfile: {
        endpoint: "cdn.tencentcloudapi.com"
      }
    }
  });

  const domainStatus = new Map<string, string | null>();
  let offset = 0;
  const limit = 1000;
  while (true) {
    const res = await client.DescribeDomains({ Offset: offset, Limit: limit });
    const items = res?.Domains ?? [];
    const total = res?.TotalNumber ?? items.length;
    for (const item of items) {
      const domain = item?.Domain;
      if (!domain) continue;
      const status = item?.Status ?? item?.Disable ?? null;
      domainStatus.set(domain, status);
    }
    if (offset + limit >= total) break;
    offset += limit;
  }

  const domainHttps = new Map<string, string | null>();
  const domainCertExpire = new Map<string, string | null>();
  const domainCertName = new Map<string, string | null>();
  const domainCertDeploy = new Map<string, string | null>();
  let cfgOffset = 0;
  const cfgLimit = 100;
  while (true) {
    const res = await client.DescribeDomainsConfig({ Offset: cfgOffset, Limit: cfgLimit });
    const items = res?.Domains ?? [];
    const total = res?.TotalNumber ?? items.length;
    for (const item of items) {
      const domain = item?.Domain;
      if (!domain) continue;
      const https = item?.Https?.SslStatus ?? item?.Https?.Switch ?? null;
      const certInfo = item?.Https?.CertInfo ?? null;
      const certExpiresAt = certInfo?.ExpireTime ?? null;
      const certName = certInfo?.CertName ?? certInfo?.CertId ?? null;
      const certDeployAt = certInfo?.DeployTime ?? null;
      domainHttps.set(domain, https);
      domainCertExpire.set(domain, certExpiresAt);
      domainCertName.set(domain, certName);
      domainCertDeploy.set(domain, certDeployAt);
    }
    if (cfgOffset + cfgLimit >= total) break;
    cfgOffset += cfgLimit;
  }

  const domains = new Set([...domainStatus.keys(), ...domainHttps.keys()]);
  return Array.from(domains).map((domain) => ({
    domain,
    status: domainStatus.get(domain) ?? null,
    https: domainHttps.get(domain) ?? null,
    certExpiresAt: domainCertExpire.get(domain) ?? null,
    certName: domainCertName.get(domain) ?? null,
    certDeployAt: domainCertDeploy.get(domain) ?? null
  }));
}
