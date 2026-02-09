import tencentcloud from "tencentcloud-sdk-nodejs";

export type TencentDnsConfig = {
  secretId: string;
  secretKey: string;
};

export type TencentDnsRecord = {
  zone: string;
  recordId: number;
  subDomain: string;
};

function getClient(config: TencentDnsConfig) {
  const sdk: any = tencentcloud as any;
  const Client = sdk?.dnspod?.v20210323?.Client;
  if (!Client) {
    throw new Error("Tencent DNSPod SDK not available");
  }

  return new Client({
    credential: { secretId: config.secretId, secretKey: config.secretKey },
    region: "",
    profile: {
      httpProfile: {
        endpoint: "dnspod.tencentcloudapi.com"
      }
    }
  });
}

async function listZones(config: TencentDnsConfig): Promise<string[]> {
  const client = getClient(config);
  const res = await client.DescribeDomainList({});
  const items = res?.DomainList ?? [];
  return items
    .map((item: any) => item?.Name)
    .filter((name: string | undefined) => Boolean(name));
}

function normalizeDomain(domain: string) {
  return domain.replace(/^\*\./, "").replace(/\.$/, "");
}

function findBestZone(domain: string, zones: string[]) {
  const normalized = normalizeDomain(domain);
  const candidates = zones.filter((zone) => normalized === zone || normalized.endsWith(`.${zone}`));
  if (!candidates.length) return null;
  return candidates.sort((a, b) => b.length - a.length)[0];
}

function getSubDomain(domain: string, zone: string) {
  const normalized = normalizeDomain(domain);
  if (normalized === zone) return "_acme-challenge";
  const prefix = normalized.slice(0, normalized.length - zone.length - 1);
  return `_acme-challenge.${prefix}`;
}

export async function createTxtRecord(params: {
  domain: string;
  value: string;
  config: TencentDnsConfig;
  ttl?: number;
}): Promise<TencentDnsRecord> {
  const zones = await listZones(params.config);
  const zone = findBestZone(params.domain, zones);
  if (!zone) {
    throw new Error(`DNSPod zone not found for ${params.domain}`);
  }
  const subDomain = getSubDomain(params.domain, zone);
  const client = getClient(params.config);
  const res = await client.CreateTXTRecord({
    Domain: zone,
    SubDomain: subDomain,
    RecordLine: "默认",
    Value: params.value,
    TTL: params.ttl ?? 600
  });
  if (!res?.RecordId) {
    throw new Error("Create TXT record failed");
  }
  return { zone, recordId: res.RecordId, subDomain };
}

export async function deleteRecord(params: { record: TencentDnsRecord; config: TencentDnsConfig }) {
  const client = getClient(params.config);
  await client.DeleteRecord({
    Domain: params.record.zone,
    RecordId: params.record.recordId
  });
}
