import {
  ArrowsClockwise,
  Cloud,
  ClockCountdown,
  GlobeHemisphereWest,
  Pulse,
  WarningCircle
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PageIntro } from "@/components/PageIntro";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { daysUntil, formatDate } from "@/lib/format";

type Site = {
  id: string;
  name: string;
  domain: string;
  providerCredentialId: string | null;
  certificateSource: string;
  autoRenew: boolean;
  renewDaysBefore: number;
  status: string;
  providerCertExpiresAt?: string | null;
  latestCertificate: null | {
    id: string;
    expiresAt: string;
    issuedAt: string;
    status: string;
  };
};

type Deployment = {
  id: string;
  site_id: string;
  certificate_id: string;
  provider_type: string;
  status: string;
  message: string | null;
  created_at: string;
};

function getTone(days: number | null) {
  if (days === null) return "muted" as const;
  if (days <= 14) return "warning" as const;
  if (days <= 30) return "default" as const;
  return "success" as const;
}

export function DashboardPage() {
  const { accessToken } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [providers, setProviders] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [siteItems, deploymentItems, providerItems] = await Promise.all([
          apiRequest<Site[]>("/sites", {}, accessToken),
          apiRequest<Deployment[]>("/deployments", {}, accessToken),
          apiRequest<any[]>("/providers", {}, accessToken)
        ]);

        if (cancelled) return;
        setSites(siteItems);
        setDeployments(deploymentItems);
        setProviders(providerItems.length);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const expiringSites = useMemo(() => {
    return sites.filter((site) => {
      const expiresAt =
        site.latestCertificate?.expiresAt ?? site.providerCertExpiresAt ?? null;
      const days = daysUntil(expiresAt);
      return days !== null && days <= 30;
    });
  }, [sites]);

  const nextRenewals = useMemo(() => {
    return [...sites]
      .filter((site) => site.latestCertificate?.expiresAt || site.providerCertExpiresAt)
      .sort(
        (a, b) =>
          new Date(
            a.latestCertificate?.expiresAt ?? a.providerCertExpiresAt!
          ).getTime() -
          new Date(
            b.latestCertificate?.expiresAt ?? b.providerCertExpiresAt!
          ).getTime()
      )
      .slice(0, 6);
  }, [sites]);

  const latestDeployments = useMemo(() => {
    return [...deployments]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [deployments]);

  return (
    <div className="space-y-6">
      <PageIntro
        title="概览"
        description="查看近期风险、续签窗口和最近动作。"
      />

      {loading ? (
        <div className="grid gap-5 xl:grid-cols-[1.14fr_0.86fr]">
          <div className="surface p-6">
            <div className="skeleton-block h-9 w-40" />
            <div className="mt-5 space-y-3">
              <div className="skeleton-block h-20 w-full" />
              <div className="skeleton-block h-20 w-full" />
              <div className="skeleton-block h-20 w-full" />
            </div>
          </div>
          <div className="space-y-5">
            <div className="surface p-6">
              <div className="skeleton-block h-9 w-36" />
              <div className="mt-5 space-y-3">
                <div className="skeleton-block h-16 w-full" />
                <div className="skeleton-block h-16 w-full" />
                <div className="skeleton-block h-16 w-full" />
              </div>
            </div>
            <div className="surface p-6">
              <div className="skeleton-block h-9 w-36" />
              <div className="mt-5 space-y-3">
                <div className="skeleton-block h-16 w-full" />
                <div className="skeleton-block h-16 w-full" />
                <div className="skeleton-block h-16 w-full" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.14fr_0.86fr]">
          <section className="surface overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 md:px-6">
              <div>
                <h2 className="text-[1.1rem] font-semibold tracking-[-0.03em] text-foreground">
                  下一批续签站点
                </h2>
              </div>
              <ClockCountdown className="h-5 w-5 text-primary" weight="duotone" />
            </div>

            {nextRenewals.length === 0 ? (
              <div className="p-5 md:p-6">
                <EmptyState
                  icon={<GlobeHemisphereWest className="h-6 w-6" weight="duotone" />}
                  title="还没有证书记录"
                  description="当站点接入并完成证书签发后，这里会自动整理出下一批需要关注的续签窗口。"
                />
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {nextRenewals.map((site) => {
                  const expiresAt =
                    site.latestCertificate?.expiresAt ?? site.providerCertExpiresAt ?? null;
                  const days = daysUntil(expiresAt);

                  return (
                    <div
                      key={site.id}
                      className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:px-6 md:items-center"
                    >
                      <div>
                        <div className="text-sm font-medium tracking-tight text-foreground">
                          {site.name}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">{site.domain}</div>
                        <div className="mt-3 h-1.5 rounded-full bg-muted/80">
                          <div
                            className="h-1.5 rounded-full bg-primary"
                            style={{
                              width:
                                days === null
                                  ? "0%"
                                  : `${Math.max(8, Math.min(100, (days / 90) * 100))}%`
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-2 md:items-end">
                        <Badge variant={getTone(days)}>
                          {days !== null ? `${days} 天` : "待同步"}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          到期时间：{formatDate(expiresAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="space-y-5">
            <section className="surface overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 md:px-6">
                <div>
                  <h2 className="text-[1.1rem] font-semibold tracking-[-0.03em] text-foreground">
                    当前风险面
                  </h2>
                </div>
                <WarningCircle className="h-5 w-5 text-primary" weight="duotone" />
              </div>
              <div className="divide-y divide-border/60">
                <div className="flex items-center justify-between px-5 py-4 md:px-6">
                  <div>
                    <div className="text-sm font-medium tracking-tight text-foreground">
                      30 天内到期
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      优先检查挑战方式和自动部署开关
                    </div>
                  </div>
                  <div className="text-[1.55rem] font-semibold tracking-[-0.05em] text-foreground">
                    {expiringSites.length}
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 py-4 md:px-6">
                  <div>
                    <div className="text-sm font-medium tracking-tight text-foreground">
                      已接入平台
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      当前可用于部署和同步的凭据数量
                    </div>
                  </div>
                  <div className="text-[1.55rem] font-semibold tracking-[-0.05em] text-foreground">
                    {providers}
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 py-4 md:px-6">
                  <div>
                    <div className="text-sm font-medium tracking-tight text-foreground">
                      最近动作
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      方便确认系统是否持续稳定运行
                    </div>
                  </div>
                  <div className="text-[1.55rem] font-semibold tracking-[-0.05em] text-foreground">
                    {latestDeployments.length}
                  </div>
                </div>
              </div>
            </section>

            <section className="surface overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 md:px-6">
                <div>
                  <h2 className="text-[1.1rem] font-semibold tracking-[-0.03em] text-foreground">
                    最近动作
                  </h2>
                </div>
                <Pulse className="h-5 w-5 text-primary" weight="duotone" />
              </div>

              {latestDeployments.length === 0 ? (
                <div className="p-5 md:p-6">
                  <EmptyState
                    icon={<ArrowsClockwise className="h-6 w-6" weight="duotone" />}
                    title="暂无动作历史"
                    description="当发生续签或部署后，这里会开始累计最近动作，方便快速判断系统状态。"
                  />
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {latestDeployments.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 px-5 py-4 md:px-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/75 bg-white/74">
                        <Cloud className="h-4 w-4 text-primary" weight="duotone" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-medium tracking-tight text-foreground">
                            {item.provider_type || "CDN 部署"}
                          </div>
                          <Badge variant={item.status === "success" ? "success" : "warning"}>
                            {item.status === "success" ? "成功" : item.status}
                          </Badge>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatDate(item.created_at)}
                        </div>
                        {item.message && (
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {item.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
