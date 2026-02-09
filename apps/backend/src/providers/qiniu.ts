import qiniu from "qiniu";

type QiniuDomainInfo = {
  domain: string;
  status: string | null;
  https: string | null;
  certExpiresAt: string | null;
  certName: string | null;
  certDeployAt: string | null;
};

export async function deployToQiniuCdn(params: {
  domain: string;
  certPem: string;
  keyPem: string;
  config: Record<string, any>;
}) {
  const accessKey = params.config.accessKey as string | undefined;
  const secretKey = params.config.secretKey as string | undefined;
  if (!accessKey || !secretKey) {
    throw new Error("Qiniu credentials missing");
  }

  const sdk: any = qiniu as any;
  const mac = new sdk.auth.digest.Mac(accessKey, secretKey);
  const cdnManager = new sdk.cdn.CdnManager(mac);

  const certName = `auto-ssl-${params.domain}-${Date.now()}`;

  if (typeof cdnManager.setDomainHttpsConfig === "function") {
    // Some SDK versions expose setDomainHttpsConfig
    await cdnManager.setDomainHttpsConfig(
      params.domain,
      certName,
      params.certPem,
      params.keyPem,
      true
    );
    return;
  }

  if (typeof cdnManager.setHttpsConfig === "function") {
    // Alternative method name
    await cdnManager.setHttpsConfig(
      params.domain,
      certName,
      params.certPem,
      params.keyPem,
      true
    );
    return;
  }

  throw new Error("Qiniu SDK does not expose HTTPS config methods");
}

export async function listQiniuDomains(config: Record<string, any>): Promise<QiniuDomainInfo[]> {
  const accessKey = config.accessKey as string | undefined;
  const secretKey = config.secretKey as string | undefined;
  if (!accessKey || !secretKey) {
    throw new Error("Qiniu credentials missing");
  }

  const sdk: any = qiniu as any;
  const mac = new sdk.auth.digest.Mac(accessKey, secretKey);

  const results: QiniuDomainInfo[] = [];
  let marker: string | null = null;

  while (true) {
    const url = new URL("https://api.qiniu.com/domain");
    url.searchParams.set("limit", "1000");
    if (marker) {
      url.searchParams.set("marker", marker);
    }

    const token = sdk.util.generateAccessToken(mac, url.toString(), "");
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: token
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Qiniu domain list failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as {
      marker?: string | null;
      domains?: Array<{ name?: string; protocol?: string; operatingState?: string }>;
    };

    for (const item of data.domains ?? []) {
      const domain = item.name;
      if (!domain) continue;
      results.push({
        domain,
        status: item.operatingState ?? null,
        https: item.protocol ?? null,
        certExpiresAt: null,
        certName: null,
        certDeployAt: null
      });
    }

    marker = data.marker ?? null;
    if (!marker) break;
  }

  return results;
}
