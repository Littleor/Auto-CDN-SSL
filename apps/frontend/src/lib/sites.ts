import type { Tone } from "@/components/ui/chip";
import { daysUntil } from "@/lib/format";

export type Provider = {
  id: string;
  name: string;
  providerType: string;
  createdAt: string;
};

export type SiteRow = {
  id: string;
  name: string;
  domain: string;
  providerCredentialId: string | null;
  providerStatus?: string | null;
  providerHttps?: string | null;
  providerCertExpiresAt?: string | null;
  providerCertName?: string | null;
  providerCertDeployAt?: string | null;
  certificateSource?: string;
  autoRenew?: boolean;
  renewDaysBefore?: number;
  status?: string;
  latestCertificate?: {
    id: string;
    expiresAt: string;
    issuedAt: string;
    status: string;
  } | null;
};

export type SiteHealth = "healthy" | "expiring" | "expired" | "missing";

export type DecoratedSite = SiteRow & {
  expiresAt: string | null;
  issuedAt: string | null;
  days: number | null;
  totalDays: number | null;
  /** Remaining validity as a 0–100 percentage, or null when the range is unknown. */
  progress: number | null;
  health: SiteHealth;
  certificateStatus: string | null;
  providerType: string | null;
  providerName: string | null;
};

const DAY = 24 * 60 * 60 * 1000;

export const EXPIRING_THRESHOLD_DAYS = 30;

export const healthMeta: Record<SiteHealth, { label: string; tone: Tone }> = {
  healthy: { label: "正常", tone: "success" },
  expiring: { label: "即将到期", tone: "warning" },
  expired: { label: "已过期", tone: "danger" },
  missing: { label: "无证书", tone: "neutral" }
};

export function decorateSite(site: SiteRow, providerById: Map<string, Provider>): DecoratedSite {
  const provider = site.providerCredentialId ? providerById.get(site.providerCredentialId) : undefined;
  const expiresAt = site.latestCertificate?.expiresAt ?? site.providerCertExpiresAt ?? null;
  const issuedAt = site.latestCertificate?.issuedAt ?? site.providerCertDeployAt ?? null;
  const days = daysUntil(expiresAt);

  let totalDays: number | null = null;
  let progress: number | null = null;
  if (expiresAt && issuedAt) {
    const end = new Date(expiresAt).getTime();
    const start = new Date(issuedAt).getTime();
    if (!Number.isNaN(end) && !Number.isNaN(start) && end > start) {
      totalDays = Math.max(1, Math.ceil((end - start) / DAY));
      progress = Math.min(100, Math.max(0, ((end - Date.now()) / (end - start)) * 100));
    }
  }

  const health: SiteHealth =
    days === null ? "missing" : days < 0 ? "expired" : days <= EXPIRING_THRESHOLD_DAYS ? "expiring" : "healthy";

  return {
    ...site,
    expiresAt,
    issuedAt,
    days,
    totalDays,
    progress,
    health,
    certificateStatus: site.latestCertificate?.status ?? (expiresAt ? "issued" : null),
    providerType: provider?.providerType ?? null,
    providerName: provider?.name ?? null
  };
}

export function providerMap(providers: Provider[]) {
  return new Map(providers.map((provider) => [provider.id, provider]));
}
