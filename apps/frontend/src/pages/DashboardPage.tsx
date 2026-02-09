import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Cloud, Globe, RefreshCw } from "lucide-react";
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

export function DashboardPage() {
  const { accessToken } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [providers, setProviders] = useState<number>(0);

  useEffect(() => {
    if (!accessToken) return;
    apiRequest<Site[]>("/sites", {}, accessToken).then(setSites);
    apiRequest<Deployment[]>("/deployments", {}, accessToken).then(setDeployments);
    apiRequest<any[]>("/providers", {}, accessToken).then((items) => setProviders(items.length));
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
      .slice(0, 4);
  }, [sites]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">控制台概览</h2>
        <p className="text-sm text-muted-foreground">实时掌握证书状态与部署节奏。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">管理网站</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">{sites.length}</p>
                <p className="text-xs text-muted-foreground">个站点</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Globe className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">即将到期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">{expiringSites.length}</p>
                <p className="text-xs text-muted-foreground">30 天内</p>
              </div>
              <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">云平台凭据</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">{providers}</p>
                <p className="text-xs text-muted-foreground">腾讯云 / 七牛云</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Cloud className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">部署动作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">{deployments.length}</p>
                <p className="text-xs text-muted-foreground">最近部署记录</p>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
                <RefreshCw className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>下一批续签</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextRenewals.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无证书记录。</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {nextRenewals.map((site) => {
                const expiresAt =
                  site.latestCertificate?.expiresAt ?? site.providerCertExpiresAt ?? null;
                const days = daysUntil(expiresAt);
                return (
                  <div key={site.id} className="rounded-2xl border border-border bg-white/70 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{site.name}</p>
                        <p className="text-xs text-muted-foreground">{site.domain}</p>
                      </div>
                      <Badge variant={days !== null && days <= 7 ? "warning" : "muted"}>
                        {days !== null ? `${days} 天` : "-"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      到期时间：{formatDate(expiresAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
