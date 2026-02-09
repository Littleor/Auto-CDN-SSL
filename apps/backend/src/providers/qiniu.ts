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

  const certId = await uploadQiniuCertificate({
    sdk,
    mac,
    certName,
    domain: params.domain,
    certPem: params.certPem,
    keyPem: params.keyPem
  });

  const sslizePayload = {
    certid: certId,
    forceHttps: true,
    http2Enable: false
  };
  const sslizeUrl = new URL(`https://api.qiniu.com/domain/${encodeURIComponent(params.domain)}/sslize`);
  const sslizeResult = await qiniuJsonRequest({
    sdk,
    mac,
    url: sslizeUrl,
    method: "PUT",
    payload: sslizePayload
  });

  if (sslizeResult.ok) {
    return;
  }

  const httpsconfPayload = {
    certId: certId,
    forceHttps: true,
    http2Enable: false
  };
  const httpsconfUrl = new URL(
    `https://api.qiniu.com/domain/${encodeURIComponent(params.domain)}/httpsconf`
  );
  const httpsconfResult = await qiniuJsonRequest({
    sdk,
    mac,
    url: httpsconfUrl,
    method: "PUT",
    payload: httpsconfPayload
  });

  if (!httpsconfResult.ok) {
    throw new Error(
      `Qiniu HTTPS config failed. sslize: ${formatQiniuError(sslizeResult)}; httpsconf: ${formatQiniuError(
        httpsconfResult
      )}`
    );
  }
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

async function uploadQiniuCertificate(params: {
  sdk: any;
  mac: any;
  certName: string;
  domain: string;
  certPem: string;
  keyPem: string;
}): Promise<string> {
  const url = new URL("https://api.qiniu.com/sslcert");
  const payload = {
    name: params.certName,
    common_name: params.domain,
    pri: params.keyPem,
    ca: params.certPem
  };

  const result = await qiniuJsonRequest({
    sdk: params.sdk,
    mac: params.mac,
    url,
    method: "POST",
    payload
  });

  if (!result.ok) {
    throw new Error(`Qiniu certificate upload failed: ${formatQiniuError(result)}`);
  }

  const certId = result.data?.certID ?? result.data?.certId;
  if (!certId) {
    throw new Error("Qiniu certificate upload did not return certID");
  }

  return String(certId);
}

async function qiniuJsonRequest(params: {
  sdk: any;
  mac: any;
  url: URL;
  method: "GET" | "POST" | "PUT" | "DELETE";
  payload?: Record<string, any>;
}): Promise<{
  ok: boolean;
  status: number;
  data?: any;
  text?: string;
}> {
  const body = params.payload ? JSON.stringify(params.payload) : "";
  const token = params.sdk.util.generateAccessToken(params.mac, params.url.toString(), body);
  const response = await fetch(params.url.toString(), {
    method: params.method,
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: params.payload ? body : undefined
  });

  const text = await response.text();
  let data: any = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = undefined;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
    text
  };
}

function formatQiniuError(result: { status: number; data?: any; text?: string }) {
  const code = result.data?.code ?? result.data?.error_code ?? result.data?.errCode;
  const message = result.data?.error ?? result.data?.message ?? result.text ?? "unknown error";
  return `status=${result.status}, code=${code ?? "unknown"}, message=${message}`;
}
