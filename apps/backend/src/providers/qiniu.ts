import qiniu from "qiniu";

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
