import { parse } from "tldts";

export function normalizeDomain(domain: string) {
  return domain.trim().toLowerCase().replace(/^\*\./, "").replace(/\.$/, "");
}

export function getApexDomain(domain: string): string | null {
  const normalized = normalizeDomain(domain);
  if (!normalized) return null;
  const result = parse(normalized);
  return result.domain ?? null;
}
