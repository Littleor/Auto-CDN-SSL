import { TencentDnsRecord } from "../../providers/tencentDns.js";

const store = new Map<string, TencentDnsRecord>();

export function setDnsRecord(token: string, record: TencentDnsRecord) {
  store.set(token, record);
}

export function getDnsRecord(token: string): TencentDnsRecord | undefined {
  return store.get(token);
}

export function removeDnsRecord(token: string) {
  store.delete(token);
}
