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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      .slice(0, 5);
  }, [sites]);

  const latestDeployments = useMemo(() => {
    return [...deployments]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [deployments]);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Overview"
        title="把证书健康度、续签窗口和部署动作汇总到一个主视图"
        description="新版概览页把真正需要优先关注的信息提到了最前面：即将到期的站点、最近动作、平台覆盖和当前风险面。"
        stats={[
          {
            label: "管理站点",
            value: String(sites.length),
            hint: "已经纳入控制台管理的域名数量"
          },
          {
            label: "30 天风险",
            value: String(expiringSites.length),
            hint: "未来 30 天内需要重点确认的站点"
          },
          {
            label: "凭据总数",
            value: String(providers),
            hint: "CDN 与 DNS 凭据统一计数"
          },
          {
            label: "最近动作",
            value: String(deployments.length),
            hint: "续签与部署产生的历史记录数量"
          }
        ]}
      />

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="surface p-6">
            <div className="skeleton-block h-10 w-44" />
            <div className="mt-5 space-y-3">
              <div className="skeleton-block h-24 w-full" />
              <div className="skeleton-block h-24 w-full" />
              <div className="skeleton-block h-24 w-full" />
            </div>
          </div>
          <div className="grid gap-4">
            <div className="surface p-6">
              <div className="skeleton-block h-10 w-32" />
              <div className="mt-5 space-y-3">
                <div className="skeleton-block h-20 w-full" />
                <div className="skeleton-block h-20 w-full" />
              </div>
            </div>
            <div className="surface p-6">
              <div className="skeleton-block h-10 w-32" />
              <div className="mt-5 space-y-3">
                <div className="skeleton-block h-16 w-full" />
                <div className="skeleton-block h-16 w-full" />
                <div className="skeleton-block h-16 w-full" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
          <Card className="p-1">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <div className="section-label">Renewal Window</div>
                <CardTitle className="mt-3 text-2xl">下一批续签站点</CardTitle>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  优先展示最接近到期时间的站点，便于先处理真正紧急的风险。
                </p>
              </div>
              <ClockCountdown className="h-6 w-6 text-muted-foreground" weight="duotone" />
            </CardHeader>
            <CardContent>
              {nextRenewals.length === 0 ? (
                <EmptyState
                  icon={<GlobeHemisphereWest className="h-6 w-6" weight="duotone" />}
                  title="还没有可展示的证书记录"
                  description="当站点接入并完成证书签发后，这里会自动出现下一批需要关注的续签窗口。"
                />
              ) : (
                <div className="grid gap-4">
                  {nextRenewals.map((site) => {
                    const expiresAt =
                      site.latestCertificate?.expiresAt ?? site.providerCertExpiresAt ?? null;
                    const days = daysUntil(expiresAt);

                    return (
                      <div
                        key={site.id}
                        className="grid gap-4 rounded-[1.8rem] border border-white/80 bg-white/78 p-5 shadow-[0_24px_50px_-40px_rgba(56,46,35,0.24)] md:grid-cols-[minmax(0,1fr)_auto]"
                      >
                        <div>
                          <div className="text-base font-semibold tracking-tight text-foreground">
                            {site.name}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">{site.domain}</div>
                          <div className="mt-4 h-2 rounded-full bg-muted/80">
                            <div
                              className="h-2 rounded-full bg-primary transition-all"
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
                          <div className="text-xs leading-5 text-muted-foreground">
                            到期时间：{formatDate(expiresAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div>
                  <div className="section-label">Risk Snapshot</div>
                  <CardTitle className="mt-3 text-2xl">当前风险面</CardTitle>
                </div>
                <WarningCircle className="h-6 w-6 text-muted-foreground" weight="duotone" />
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="line-panel flex items-center justify-between px-4 py-4">
                  <div>
                    <div className="text-sm font-semibold tracking-tight text-foreground">30 天内到期</div>
                    <div className="mt-1 text-xs text-muted-foreground">优先检查挑战方式和自动部署开关</div>
                  </div>
                  <div className="text-2xl font-semibold tracking-tight text-foreground">
                    {expiringSites.length}
                  </div>
                </div>
                <div className="line-panel flex items-center justify-between px-4 py-4">
                  <div>
                    <div className="text-sm font-semibold tracking-tight text-foreground">已接入平台</div>
                    <div className="mt-1 text-xs text-muted-foreground">可用于同步站点与部署证书的凭据数量</div>
                  </div>
                  <div className="text-2xl font-semibold tracking-tight text-foreground">{providers}</div>
                </div>
                <div className="line-panel flex items-center justify-between px-4 py-4">
                  <div>
                    <div className="text-sm font-semibold tracking-tight text-foreground">最近动作</div>
                    <div className="mt-1 text-xs text-muted-foreground">便于回看系统是否保持稳定运行</div>
                  </div>
                  <div className="text-2xl font-semibold tracking-tight text-foreground">
                    {latestDeployments.length}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div>
                  <div className="section-label">Operation Feed</div>
                  <CardTitle className="mt-3 text-2xl">最近动作</CardTitle>
                </div>
                <Pulse className="h-6 w-6 text-muted-foreground" weight="duotone" />
              </CardHeader>
              <CardContent>
                {latestDeployments.length === 0 ? (
                  <EmptyState
                    icon={<ArrowsClockwise className="h-6 w-6" weight="duotone" />}
                    title="暂无动作历史"
                    description="当发生续签或部署后，这里会开始累计最近动作，方便快速判断系统状态。"
                  />
                ) : (
                  <div className="space-y-3">
                    {latestDeployments.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-[1.5rem] border border-white/80 bg-white/76 px-4 py-4"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
                          <Cloud className="h-4 w-4" weight="duotone" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-sm font-semibold tracking-tight text-foreground">
                              {item.provider_type || "CDN 部署"}
                            </div>
                            <Badge variant={item.status === "success" ? "success" : "warning"}>
                              {item.status === "success" ? "成功" : item.status}
                            </Badge>
                          </div>
                          <div className="mt-1 text-xs leading-5 text-muted-foreground">
                            {formatDate(item.created_at)}
                          </div>
                          {item.message && (
                            <div className="mt-2 text-sm leading-6 text-muted-foreground">
                              {item.message}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
