import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowsDownUp,
  CircleNotch,
  Database,
  MagnifyingGlass,
  Plus,
  ShieldCheck
} from "@phosphor-icons/react";
import { EmptyState } from "@/components/EmptyState";
import { PageIntro } from "@/components/PageIntro";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationControls } from "@/components/PaginationControls";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { daysUntil, formatDate } from "@/lib/format";
import {
  getBadgeVariantByStatus,
  getCdnStatusLabel,
  getCertificateStatusLabel,
  getHttpsStatusLabel,
  getPlatformLabel
} from "@/lib/statusDisplay";

const defaultForm = {
  name: "",
  domain: "",
  providerCredentialId: "",
  certificateSource: "self_signed",
  autoRenew: true,
  renewDaysBefore: 30
};

type SiteRow = {
  id: string;
  name: string;
  domain: string;
  providerCredentialId: string | null;
  providerStatus?: string | null;
  providerHttps?: string | null;
  providerCertExpiresAt?: string | null;
  providerCertDeployAt?: string | null;
  latestCertificate?: {
    id: string;
    expiresAt: string;
    issuedAt: string;
    status: string;
  } | null;
};

type SortField = "expiresAt" | "name" | "domain" | "provider" | "providerStatus" | "certificateStatus";

type DecoratedSite = SiteRow & {
  displayExpiresAt: string | null;
  displayIssuedAt: string | null;
  days: number | null;
  providerStatusRaw: string | null;
  providerHttpsRaw: string | null;
  certificateStatus: string | null;
  providerType: string | null;
  providerName: string | null;
};

function compareNullable(a: string | number | null, b: string | number | null) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "zh-CN");
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

export function SitesPage() {
  const { accessToken } = useAuth();
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuing, setIssuing] = useState<Record<string, "idle" | "loading" | "success" | "error">>({});
  const [deploying, setDeploying] = useState<Record<string, "idle" | "loading" | "success" | "error">>({});
  const [issuingAll, setIssuingAll] = useState(false);
  const [actionMessage, setActionMessage] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [certificateFilter, setCertificateFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("expiresAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const jobTimers = useRef<Record<string, number>>({});

  const providerOptions = useMemo(
    () => providers.filter((provider) => ["tencent", "qiniu"].includes(provider.providerType)),
    [providers]
  );

  const providerById = useMemo(
    () =>
      new Map(
        providers.map((provider) => [
          provider.id,
          {
            name: provider.name,
            providerType: provider.providerType
          }
        ])
      ),
    [providers]
  );

  const fetchData = () => {
    if (!accessToken) return;
    apiRequest<SiteRow[]>("/sites", {}, accessToken).then(setSites);
    apiRequest<any[]>("/providers", {}, accessToken).then(setProviders);
  };

  useEffect(() => {
    fetchData();
  }, [accessToken]);

  useEffect(() => {
    return () => {
      Object.values(jobTimers.current).forEach((timer) => clearInterval(timer));
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, providerFilter, certificateFilter, sortField, sortOrder, pageSize]);

  const handleSubmit = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      await apiRequest(
        "/sites",
        {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            domain: form.domain,
            providerCredentialId: form.providerCredentialId || null,
            certificateSource: form.certificateSource,
            autoRenew: form.autoRenew,
            renewDaysBefore: Number(form.renewDaysBefore)
          })
        },
        accessToken
      );
      setOpen(false);
      setForm(defaultForm);
      fetchData();
    } catch (err: any) {
      setError(err.message || "创建失败");
    } finally {
      setLoading(false);
    }
  };

  const deploySite = async (site: DecoratedSite) => {
    if (!accessToken || !site.providerCredentialId) {
      setDeploying((prev) => ({ ...prev, [site.id]: "success" }));
      setActionMessage((prev) => ({
        ...prev,
        [site.id]: "续签成功，未绑定 CDN 凭据，已跳过自动部署"
      }));
      return;
    }

    setDeploying((prev) => ({ ...prev, [site.id]: "loading" }));
    setActionMessage((prev) => ({ ...prev, [site.id]: "证书续签成功，正在自动部署..." }));
    try {
      await apiRequest(
        "/deployments",
        { method: "POST", body: JSON.stringify({ siteId: site.id }) },
        accessToken
      );
      setDeploying((prev) => ({ ...prev, [site.id]: "success" }));
      setActionMessage((prev) => ({ ...prev, [site.id]: "续签并部署成功" }));
      fetchData();
    } catch (err: any) {
      setDeploying((prev) => ({ ...prev, [site.id]: "error" }));
      setActionMessage((prev) => ({
        ...prev,
        [site.id]: `续签成功，但自动部署失败：${err.message || "部署失败"}`
      }));
    }
  };

  const handleIssue = async (site: DecoratedSite) => {
    if (!accessToken) return;
    setIssuing((prev) => ({ ...prev, [site.id]: "loading" }));
    setDeploying((prev) => ({ ...prev, [site.id]: "idle" }));
    setActionMessage((prev) => ({ ...prev, [site.id]: "正在续签证书..." }));
    try {
      const result = await apiRequest<{ jobId: string }>(
        "/certificates/issue",
        { method: "POST", body: JSON.stringify({ siteId: site.id }) },
        accessToken
      );
      setActionMessage((prev) => ({ ...prev, [site.id]: "已提交续签任务，等待处理中..." }));
      let completed = false;

      const poll = async () => {
        try {
          const job = await apiRequest<{
            id: string;
            status: string;
            message: string | null;
          }>(`/jobs/${result.jobId}`, {}, accessToken);

          if (job.message) {
            setActionMessage((prev) => ({ ...prev, [site.id]: truncateText(job.message || "", 80) }));
          }

          if (job.status === "success") {
            completed = true;
            setIssuing((prev) => ({ ...prev, [site.id]: "success" }));
            clearInterval(jobTimers.current[result.jobId]);
            delete jobTimers.current[result.jobId];
            await deploySite(site);
            fetchData();
          }

          if (job.status === "failed") {
            completed = true;
            setIssuing((prev) => ({ ...prev, [site.id]: "error" }));
            setActionMessage((prev) => ({ ...prev, [site.id]: job.message || "续签失败" }));
            clearInterval(jobTimers.current[result.jobId]);
            delete jobTimers.current[result.jobId];
          }
        } catch (err: any) {
          completed = true;
          setIssuing((prev) => ({ ...prev, [site.id]: "error" }));
          setActionMessage((prev) => ({ ...prev, [site.id]: err.message || "续签失败" }));
          clearInterval(jobTimers.current[result.jobId]);
          delete jobTimers.current[result.jobId];
        }
      };

      await poll();
      if (!completed) {
        jobTimers.current[result.jobId] = window.setInterval(() => {
          void poll();
        }, 2000);
      }
    } catch (err: any) {
      setIssuing((prev) => ({ ...prev, [site.id]: "error" }));
      setActionMessage((prev) => ({ ...prev, [site.id]: err.message || "续签失败" }));
    }
  };

  const decoratedSites = useMemo<DecoratedSite[]>(() => {
    return sites.map((site) => {
      const providerInfo = site.providerCredentialId ? providerById.get(site.providerCredentialId) : null;
      const displayExpiresAt = site.latestCertificate?.expiresAt ?? site.providerCertExpiresAt ?? null;
      const displayIssuedAt = site.latestCertificate?.issuedAt ?? site.providerCertDeployAt ?? null;
      const certificateStatus = site.latestCertificate?.status ?? (displayExpiresAt ? "issued" : null);

      return {
        ...site,
        displayExpiresAt,
        displayIssuedAt,
        days: daysUntil(displayExpiresAt),
        providerStatusRaw: site.providerStatus ?? null,
        providerHttpsRaw: site.providerHttps ?? null,
        certificateStatus,
        providerType: providerInfo?.providerType ?? null,
        providerName: providerInfo?.name ?? null
      };
    });
  }, [sites, providerById]);

  const filteredSites = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = decoratedSites.filter((site) => {
      const matchesQuery =
        !normalizedQuery ||
        site.name.toLowerCase().includes(normalizedQuery) ||
        site.domain.toLowerCase().includes(normalizedQuery) ||
        (site.providerName ?? "").toLowerCase().includes(normalizedQuery);

      const matchesProvider =
        providerFilter === "all" ||
        (providerFilter === "unbound" && !site.providerType) ||
        site.providerType === providerFilter;

      const matchesCertificate =
        certificateFilter === "all" ||
        (certificateFilter === "expiring" && site.days !== null && site.days <= 30) ||
        (certificateFilter === "expired" && site.days !== null && site.days < 0) ||
        (certificateFilter === "healthy" && site.days !== null && site.days > 30) ||
        (certificateFilter === "missing" && !site.displayExpiresAt);

      return matchesQuery && matchesProvider && matchesCertificate;
    });

    return result.sort((a, b) => {
      const direction = sortOrder === "asc" ? 1 : -1;
      if (sortField === "name") return compareNullable(a.name, b.name) * direction;
      if (sortField === "domain") return compareNullable(a.domain, b.domain) * direction;
      if (sortField === "provider") {
        return compareNullable(getPlatformLabel(a.providerType), getPlatformLabel(b.providerType)) * direction;
      }
      if (sortField === "providerStatus") {
        return compareNullable(getCdnStatusLabel(a.providerStatusRaw), getCdnStatusLabel(b.providerStatusRaw)) * direction;
      }
      if (sortField === "certificateStatus") {
        return compareNullable(
          getCertificateStatusLabel(a.certificateStatus),
          getCertificateStatusLabel(b.certificateStatus)
        ) * direction;
      }
      return compareNullable(
        a.displayExpiresAt ? new Date(a.displayExpiresAt).getTime() : null,
        b.displayExpiresAt ? new Date(b.displayExpiresAt).getTime() : null
      ) * direction;
    });
  }, [certificateFilter, decoratedSites, providerFilter, query, sortField, sortOrder]);

  const pagedSites = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSites.slice(start, start + pageSize);
  }, [filteredSites, page, pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredSites.length / pageSize));
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [filteredSites.length, page, pageSize]);

  const handleIssueAll = async () => {
    if (!accessToken || filteredSites.length === 0) return;
    setIssuingAll(true);
    try {
      await Promise.all(filteredSites.map((site) => handleIssue(site)));
    } finally {
      setIssuingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="CDN 站点"
        description="管理站点、证书状态和部署动作。"
        action={
          <>
            <Button variant="secondary" onClick={handleIssueAll} disabled={issuingAll || filteredSites.length === 0}>
              {issuingAll ? (
                <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" weight="bold" />
              )}
              {issuingAll ? "续签中..." : "一键续签并部署"}
            </Button>
            <Dialog
              open={open}
              onOpenChange={(value) => {
                setOpen(value);
                if (value) {
                  setForm(defaultForm);
                  setError(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" weight="bold" />
                  新建 CDN 站点
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新增 CDN 站点</DialogTitle>
                  <DialogDescription>填写 CDN 站点与证书信息。</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">站点名称</label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="如：主站" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">域名</label>
                    <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">证书来源</label>
                    <Select value={form.certificateSource} onValueChange={(value) => setForm({ ...form, certificateSource: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择证书来源" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="letsencrypt">Let's Encrypt</SelectItem>
                        <SelectItem value="self_signed">自签证书 (开发环境)</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.certificateSource === "letsencrypt" && (
                      <p className="text-xs text-muted-foreground">验证方式在“域名验证”里按顶级域名统一配置。</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CDN 平台凭据</label>
                    <Select value={form.providerCredentialId} onValueChange={(value) => setForm({ ...form, providerCredentialId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择凭据 (可选)" />
                      </SelectTrigger>
                      <SelectContent>
                        {providerOptions.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name} ({getPlatformLabel(provider.providerType)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "创建中..." : "创建"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <Card className="p-1">
        <CardHeader>
          <CardTitle>站点列表</CardTitle>
          <p className="text-sm text-muted-foreground">HTTPS 配置表示 CDN 平台侧该域名当前是否已启用 HTTPS。</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.4fr)_repeat(4,minmax(0,1fr))]">
            <div className="relative">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
                placeholder="搜索站点、域名、凭据名"
              />
            </div>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="服务商筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部服务商</SelectItem>
                <SelectItem value="tencent">腾讯云 CDN</SelectItem>
                <SelectItem value="qiniu">七牛云 CDN</SelectItem>
                <SelectItem value="unbound">未绑定平台</SelectItem>
              </SelectContent>
            </Select>
            <Select value={certificateFilter} onValueChange={setCertificateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="证书状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部证书状态</SelectItem>
                <SelectItem value="healthy">正常</SelectItem>
                <SelectItem value="expiring">30 天内到期</SelectItem>
                <SelectItem value="expired">已过期</SelectItem>
                <SelectItem value="missing">无证书</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
              <SelectTrigger>
                <SelectValue placeholder="排序字段" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expiresAt">按到期时间</SelectItem>
                <SelectItem value="name">按站点名称</SelectItem>
                <SelectItem value="domain">按域名</SelectItem>
                <SelectItem value="provider">按服务商</SelectItem>
                <SelectItem value="providerStatus">按 CDN 状态</SelectItem>
                <SelectItem value="certificateStatus">按证书状态</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="justify-between" onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}>
              <span>{sortOrder === "asc" ? "升序" : "降序"}</span>
              <ArrowsDownUp className="h-4 w-4" />
            </Button>
          </div>

          <Table className="min-w-[1220px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">站点</TableHead>
                <TableHead className="min-w-[120px] whitespace-nowrap">证书状态</TableHead>
                <TableHead className="min-w-[170px] whitespace-nowrap">到期时间</TableHead>
                <TableHead className="min-w-[160px] whitespace-nowrap">有效期进度</TableHead>
                <TableHead className="min-w-[120px] whitespace-nowrap">CDN 状态</TableHead>
                <TableHead className="min-w-[140px] whitespace-nowrap">HTTPS 配置（CDN侧）</TableHead>
                <TableHead className="min-w-[170px] whitespace-nowrap">平台</TableHead>
                <TableHead className="min-w-[220px] text-right whitespace-nowrap">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedSites.map((site) => {
                const hasRange = Boolean(site.displayIssuedAt && site.displayExpiresAt);
                const totalDays = hasRange
                  ? Math.max(
                      1,
                      Math.ceil(
                        (new Date(site.displayExpiresAt!).getTime() - new Date(site.displayIssuedAt!).getTime()) /
                          (24 * 60 * 60 * 1000)
                      )
                    )
                  : null;
                const remainingDays = hasRange
                  ? Math.ceil((new Date(site.displayExpiresAt!).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
                  : null;
                const normalizedRemaining = remainingDays !== null ? Math.max(0, remainingDays) : null;
                const ratioText =
                  hasRange && normalizedRemaining !== null && totalDays
                    ? remainingDays !== null && remainingDays < 0
                      ? "已过期"
                      : `${normalizedRemaining}/${totalDays} 天`
                    : "-";
                const progress = hasRange
                  ? Math.min(
                      100,
                      Math.max(
                        0,
                        ((new Date(site.displayExpiresAt!).getTime() - Date.now()) /
                          (new Date(site.displayExpiresAt!).getTime() - new Date(site.displayIssuedAt!).getTime())) *
                          100
                      )
                    )
                  : 0;
                const isOverdue = remainingDays !== null && remainingDays < 0;
                const isCritical = remainingDays !== null && remainingDays <= 30;
                const isWarning = remainingDays !== null && remainingDays <= 60;
                const progressTone = isOverdue || isCritical ? "bg-destructive" : isWarning ? "bg-amber-500" : "bg-emerald-500";
                const progressTextTone =
                  isOverdue || isCritical ? "text-destructive" : isWarning ? "text-amber-600" : "text-emerald-600";
                const issueState = issuing[site.id] ?? "idle";
                const deployState = deploying[site.id] ?? "idle";
                const isWorking = issueState === "loading" || deployState === "loading";
                const isErrored = issueState === "error" || deployState === "error";
                const isSuccessful = !isWorking && (issueState === "success" || deployState === "success");
                const messageClass = isErrored
                  ? "text-destructive"
                  : isSuccessful
                    ? "text-emerald-600"
                    : "text-muted-foreground";

                return (
                  <TableRow key={site.id}>
                    <TableCell className="align-top">
                      <div className="space-y-1">
                        <p className="font-semibold">{site.name}</p>
                        <p className="text-xs text-muted-foreground">{site.domain}</p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap">
                      {site.certificateStatus ? (
                        <Badge variant={site.days !== null && site.days <= 30 ? "warning" : "success"}>
                          {getCertificateStatusLabel(site.certificateStatus)}
                        </Badge>
                      ) : (
                        <Badge variant="muted">未签发</Badge>
                      )}
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap">
                      {site.displayExpiresAt ? formatDate(site.displayExpiresAt) : "-"}
                    </TableCell>
                    <TableCell className="align-top">
                      {hasRange ? (
                        <div className="flex min-w-[120px] flex-col gap-1">
                          <div className="h-1.5 w-full rounded-full bg-muted/70">
                            <div className={`h-1.5 rounded-full transition-all ${progressTone}`} style={{ width: `${progress}%` }} />
                          </div>
                          <span className={`font-mono text-[11px] ${progressTextTone}`}>{ratioText}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap">
                      {site.providerStatusRaw ? (
                        <Badge variant={getBadgeVariantByStatus(site.providerStatusRaw)}>
                          {getCdnStatusLabel(site.providerStatusRaw)}
                        </Badge>
                      ) : (
                        <Badge variant="muted">-</Badge>
                      )}
                    </TableCell>
                    <TableCell className="align-top text-xs text-muted-foreground whitespace-nowrap">
                      {getHttpsStatusLabel(site.providerHttpsRaw)}
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap">
                      <div className="flex items-start gap-2">
                        <Database className="mt-0.5 h-3.5 w-3.5 shrink-0" weight="duotone" />
                        {site.providerType ? (
                          <div className="text-left">
                            <div className="text-xs font-medium text-foreground">{getPlatformLabel(site.providerType)}</div>
                            <div className="text-[11px] text-muted-foreground">{site.providerName}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">未绑定</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-right">
                      <div className="flex flex-col items-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleIssue(site)} disabled={isWorking}>
                          {isWorking ? (
                            <CircleNotch className="mr-1 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ShieldCheck className="mr-1 h-3.5 w-3.5" weight="bold" />
                          )}
                          {issueState === "loading"
                            ? "续签中..."
                            : deployState === "loading"
                              ? "部署中..."
                              : "续签"}
                        </Button>
                        {actionMessage[site.id] && (
                          <div title={actionMessage[site.id]} className={`max-w-[180px] truncate text-right text-xs ${messageClass}`}>
                            {truncateText(actionMessage[site.id], 32)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredSites.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="h-6 w-6" weight="duotone" />}
              title="暂无匹配的站点结果"
              description="可以调整筛选条件，或者直接新增一个 CDN 站点开始接入证书管理。"
            />
          ) : (
            <PaginationControls
              totalItems={filteredSites.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
