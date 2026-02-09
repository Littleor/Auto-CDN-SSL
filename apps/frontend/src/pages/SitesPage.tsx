import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Plus, ShieldCheck, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { daysUntil, formatDate } from "@/lib/format";

const defaultForm = {
  name: "",
  domain: "",
  providerCredentialId: "",
  certificateSource: "self_signed",
  autoRenew: true,
  renewDaysBefore: 30
};

type UserSettingsForm = {
  renewalHour: number;
  renewalMinute: number;
  renewalThresholdDays: number;
  acmeAccountEmail: string | null;
  acmeDirectoryUrl: string;
  acmeSkipLocalVerify: boolean;
  acmeDnsWaitSeconds: number;
  acmeDnsTtl: number;
};

const formatTimeValue = (hour: number, minute: number) =>
  `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

export function SitesPage() {
  const { accessToken } = useAuth();
  const [sites, setSites] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettingsForm | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [issuing, setIssuing] = useState<Record<string, "idle" | "loading" | "success" | "error">>({});
  const [issuingAll, setIssuingAll] = useState(false);
  const [deploying, setDeploying] = useState<Record<string, "idle" | "loading" | "success" | "error">>({});
  const [actionMessage, setActionMessage] = useState<Record<string, string>>({});
  const jobTimers = useRef<Record<string, number>>({});

  const providerOptions = useMemo(
    () => providers.filter((provider) => ["tencent", "qiniu"].includes(provider.providerType)),
    [providers]
  );
  const providerLabel = (providerType: string) => {
    if (providerType === "tencent") return "腾讯云 CDN";
    if (providerType === "qiniu") return "七牛云 CDN";
    if (providerType === "tencent_dns") return "腾讯云 DNS";
    return providerType;
  };

  const fetchData = () => {
    if (!accessToken) return;
    apiRequest<any[]>("/sites", {}, accessToken).then(setSites);
    apiRequest<any[]>("/providers", {}, accessToken).then(setProviders);
  };

  const fetchSettings = () => {
    if (!accessToken) return;
    apiRequest<UserSettingsForm>("/user-settings", {}, accessToken).then(setSettings);
  };

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, [accessToken]);

  useEffect(() => {
    return () => {
      Object.values(jobTimers.current).forEach((timer) => clearInterval(timer));
    };
  }, []);

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

  const updateSettings = (patch: Partial<UserSettingsForm>) => {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSettingsSave = async () => {
    if (!accessToken || !settings) return;
    setSettingsSaving(true);
    setSettingsMessage(null);
    try {
      await apiRequest(
        "/user-settings",
        {
          method: "PUT",
          body: JSON.stringify({
            renewalHour: settings.renewalHour,
            renewalMinute: settings.renewalMinute,
            renewalThresholdDays: settings.renewalThresholdDays,
            acmeAccountEmail: settings.acmeAccountEmail || null,
            acmeDirectoryUrl: settings.acmeDirectoryUrl || null,
            acmeSkipLocalVerify: settings.acmeSkipLocalVerify,
            acmeDnsWaitSeconds: settings.acmeDnsWaitSeconds,
            acmeDnsTtl: settings.acmeDnsTtl
          })
        },
        accessToken
      );
      setSettingsMessage("已保存");
      fetchSettings();
    } catch (err: any) {
      setSettingsMessage(err.message || "保存失败");
    } finally {
      setSettingsSaving(false);
    }
  };


  const handleIssue = async (siteId: string) => {
    if (!accessToken) return;
    setIssuing((prev) => ({ ...prev, [siteId]: "loading" }));
    setActionMessage((prev) => ({ ...prev, [siteId]: "正在续签证书..." }));
    try {
      const result = await apiRequest<{ jobId: string }>(
        "/certificates/issue",
        { method: "POST", body: JSON.stringify({ siteId }) },
        accessToken
      );
      setActionMessage((prev) => ({ ...prev, [siteId]: "已提交续签任务，等待处理中..." }));
      const poll = async () => {
        try {
          const job = await apiRequest<{
            id: string;
            status: string;
            message: string | null;
          }>(`/jobs/${result.jobId}`, {}, accessToken);
          if (job.message) {
            setActionMessage((prev) => ({ ...prev, [siteId]: job.message || "" }));
          }
          if (job.status === "success") {
            setIssuing((prev) => ({ ...prev, [siteId]: "success" }));
            setActionMessage((prev) => ({ ...prev, [siteId]: "续签成功" }));
            clearInterval(jobTimers.current[result.jobId]);
            fetchData();
          }
          if (job.status === "failed") {
            setIssuing((prev) => ({ ...prev, [siteId]: "error" }));
            setActionMessage((prev) => ({ ...prev, [siteId]: job.message || "续签失败" }));
            clearInterval(jobTimers.current[result.jobId]);
          }
        } catch (err: any) {
          setIssuing((prev) => ({ ...prev, [siteId]: "error" }));
          setActionMessage((prev) => ({ ...prev, [siteId]: err.message || "续签失败" }));
          clearInterval(jobTimers.current[result.jobId]);
        }
      };
      await poll();
      jobTimers.current[result.jobId] = window.setInterval(poll, 2000);
    } catch (err: any) {
      setIssuing((prev) => ({ ...prev, [siteId]: "error" }));
      setActionMessage((prev) => ({ ...prev, [siteId]: err.message || "续签失败" }));
    }
  };

  const handleIssueAll = async () => {
    if (!accessToken || sites.length === 0) return;
    setIssuingAll(true);
    try {
      await Promise.all(sites.map((site) => handleIssue(site.id)));
    } finally {
      setIssuingAll(false);
    }
  };

  const handleDeploy = async (siteId: string) => {
    if (!accessToken) return;
    setDeploying((prev) => ({ ...prev, [siteId]: "loading" }));
    setActionMessage((prev) => ({ ...prev, [siteId]: "正在部署 CDN..." }));
    try {
      await apiRequest(
        "/deployments",
        { method: "POST", body: JSON.stringify({ siteId }) },
        accessToken
      );
      setDeploying((prev) => ({ ...prev, [siteId]: "success" }));
      setActionMessage((prev) => ({ ...prev, [siteId]: "部署成功" }));
      fetchData();
    } catch (err: any) {
      setDeploying((prev) => ({ ...prev, [siteId]: "error" }));
      setActionMessage((prev) => ({ ...prev, [siteId]: err.message || "部署失败" }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">CDN SSL 证书管理</h2>
          <p className="text-sm text-muted-foreground">
            专用于 CDN 服务的 SSL 证书续签与部署管理。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleIssueAll}
            disabled={issuingAll || sites.length === 0}
          >
            {issuingAll ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2 h-4 w-4" />
            )}
            {issuingAll ? "续签中..." : "一键续签 CDN 证书"}
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
                <Plus className="mr-2 h-4 w-4" />
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
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="如：主站"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">域名</label>
                  <Input
                    value={form.domain}
                    onChange={(e) => setForm({ ...form, domain: e.target.value })}
                    placeholder="example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">证书来源</label>
                  <Select
                    value={form.certificateSource}
                    onValueChange={(value) => setForm({ ...form, certificateSource: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择证书来源" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="letsencrypt">Let's Encrypt</SelectItem>
                      <SelectItem value="self_signed">自签证书 (开发环境)</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.certificateSource === "letsencrypt" && (
                    <p className="text-xs text-muted-foreground">
                      验证方式在「域名验证」里按顶级域名统一配置。
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CDN 平台凭据</label>
                  <Select
                    value={form.providerCredentialId}
                    onValueChange={(value) => setForm({ ...form, providerCredentialId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择凭据 (可选)" />
                    </SelectTrigger>
                    <SelectContent>
                      {providerOptions.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name} ({providerLabel(provider.providerType)})
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
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CDN 续签与 ACME 设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!settings ? (
            <div className="text-sm text-muted-foreground">加载中...</div>
          ) : (
            <>
              <div className="space-y-3">
                <p className="text-sm font-semibold">续签策略</p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">每日续签时间</label>
                    <Input
                      type="time"
                      value={formatTimeValue(settings.renewalHour, settings.renewalMinute)}
                      onChange={(e) => {
                        const [hour, minute] = e.target.value.split(":").map(Number);
                        if (Number.isNaN(hour) || Number.isNaN(minute)) return;
                        updateSettings({ renewalHour: hour, renewalMinute: minute });
                      }}
                    />
                    <p className="text-xs text-muted-foreground">每天定时执行自动续签。</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">提前续签（天）</label>
                    <Input
                      type="number"
                      min={1}
                      max={90}
                      value={settings.renewalThresholdDays}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (Number.isNaN(value)) return;
                        updateSettings({ renewalThresholdDays: value });
                      }}
                    />
                    <p className="text-xs text-muted-foreground">证书到期前多少天开始续签。</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">ACME 参数</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">账户邮箱</label>
                    <Input
                      type="email"
                      value={settings.acmeAccountEmail ?? ""}
                      onChange={(e) => updateSettings({ acmeAccountEmail: e.target.value })}
                      placeholder="acme@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">目录地址</label>
                    <Input
                      value={settings.acmeDirectoryUrl}
                      onChange={(e) => updateSettings({ acmeDirectoryUrl: e.target.value })}
                      placeholder="https://acme-v02.api.letsencrypt.org/directory"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">DNS 等待时间（秒）</label>
                    <Input
                      type="number"
                      min={0}
                      value={settings.acmeDnsWaitSeconds}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (Number.isNaN(value)) return;
                        updateSettings({ acmeDnsWaitSeconds: value });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">DNS TTL（秒）</label>
                    <Input
                      type="number"
                      min={60}
                      value={settings.acmeDnsTtl}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (Number.isNaN(value)) return;
                        updateSettings({ acmeDnsTtl: value });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">跳过本地校验</label>
                    <Select
                      value={settings.acmeSkipLocalVerify ? "true" : "false"}
                      onValueChange={(value) =>
                        updateSettings({ acmeSkipLocalVerify: value === "true" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">关闭</SelectItem>
                        <SelectItem value="true">启用</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button onClick={handleSettingsSave} disabled={settingsSaving}>
                  {settingsSaving ? "保存中..." : "保存设置"}
                </Button>
                {settingsMessage && (
                  <p className="text-xs text-muted-foreground">{settingsMessage}</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CDN 站点列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>站点</TableHead>
                <TableHead>证书状态</TableHead>
                <TableHead>到期时间</TableHead>
                <TableHead>有效期进度</TableHead>
                <TableHead>CDN 状态</TableHead>
                <TableHead>HTTPS</TableHead>
                <TableHead>平台</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => {
                const providerExpiresAt =
                  site.providerCertExpiresAt || site.provider_cert_expires_at || null;
                const providerDeployAt =
                  site.providerCertDeployAt || site.provider_cert_deploy_at || null;
                const latestExpiresAt = site.latestCertificate?.expiresAt || null;
                const latestIssuedAt = site.latestCertificate?.issuedAt || null;
                const displayExpiresAt = latestExpiresAt ?? providerExpiresAt;
                const displayIssuedAt = latestIssuedAt ?? providerDeployAt;
                const days = daysUntil(displayExpiresAt);
                const providerStatus = site.providerStatus || site.provider_status;
                const providerHttps = site.providerHttps || site.provider_https;
                const hasLatest = Boolean(site.latestCertificate);
                const hasRange = Boolean(displayIssuedAt && displayExpiresAt);
                const totalDays = hasRange
                  ? Math.max(
                      1,
                      Math.ceil(
                        (new Date(displayExpiresAt!).getTime() -
                          new Date(displayIssuedAt!).getTime()) /
                          (24 * 60 * 60 * 1000)
                      )
                    )
                  : null;
                const remainingDays = hasRange
                  ? Math.ceil(
                      (new Date(displayExpiresAt!).getTime() - Date.now()) /
                        (24 * 60 * 60 * 1000)
                    )
                  : null;
                const normalizedRemaining =
                  remainingDays !== null ? Math.max(0, remainingDays) : null;
                const ratioText =
                  hasRange && normalizedRemaining !== null && totalDays
                    ? `${normalizedRemaining}/${totalDays}`
                    : "-";
                const progress = hasRange
                  ? Math.min(
                      100,
                      Math.max(
                        0,
                        ((Date.now() - new Date(displayIssuedAt!).getTime()) /
                          (new Date(displayExpiresAt!).getTime() -
                            new Date(displayIssuedAt!).getTime())) *
                          100
                      )
                    )
                  : 0;
                const isOverdue = remainingDays !== null && remainingDays < 0;
                const isUrgent = remainingDays !== null && remainingDays <= 7;
                const progressTone = isOverdue
                  ? "bg-destructive"
                  : isUrgent
                    ? "bg-amber-500"
                    : "bg-emerald-500";
                const progressTextTone = isOverdue
                  ? "text-destructive"
                  : isUrgent
                    ? "text-amber-600"
                    : "text-emerald-600";
                const issueState = issuing[site.id] ?? "idle";
                const deployState = deploying[site.id] ?? "idle";
                const actionState = issueState !== "idle" ? issueState : deployState;
                const messageClass =
                  actionState === "error"
                    ? "text-destructive"
                    : actionState === "success"
                      ? "text-emerald-600"
                      : "text-muted-foreground";
                return (
                  <TableRow key={site.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold">{site.name}</p>
                        <p className="text-xs text-muted-foreground">{site.domain}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {hasLatest ? (
                        <Badge variant={days !== null && days <= 7 ? "warning" : "success"}>
                          {site.latestCertificate.status}
                        </Badge>
                      ) : providerExpiresAt ? (
                        <Badge variant={days !== null && days <= 0 ? "warning" : "muted"}>
                          云端证书
                        </Badge>
                      ) : (
                        <Badge variant="muted">未签发</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {displayExpiresAt ? formatDate(displayExpiresAt) : "-"}
                    </TableCell>
                    <TableCell className="w-28 text-xs">
                      {hasRange ? (
                        <div className="flex flex-col gap-1">
                          <div className="h-1.5 w-20 rounded-full bg-muted/70">
                            <div
                              className={`h-1.5 rounded-full transition-all ${progressTone}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className={`font-mono text-[11px] ${progressTextTone}`}>
                            {ratioText}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {providerStatus ? (
                        <Badge
                          variant={
                            ["online", "success", "normal"].includes(providerStatus)
                              ? "success"
                              : ["offline", "disabled", "frozen"].includes(providerStatus)
                                ? "warning"
                                : "muted"
                          }
                        >
                          {providerStatus}
                        </Badge>
                      ) : (
                        <Badge variant="muted">-</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {providerHttps || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                        <Server className="h-3.5 w-3.5" />
                        {site.providerCredentialId ? "已绑定" : "未绑定"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIssue(site.id)}
                          disabled={issueState === "loading"}
                        >
                          {issuing[site.id] === "loading" ? (
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                          )}
                          {issuing[site.id] === "loading" ? "续签中..." : "续签"}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeploy(site.id)}
                          disabled={deployState === "loading"}
                        >
                          {deploying[site.id] === "loading" ? (
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          {deploying[site.id] === "loading" ? "部署中..." : "部署"}
                        </Button>
                      </div>
                      {actionMessage[site.id] && (
                        <div className={`mt-2 text-xs ${messageClass}`}>
                          {actionMessage[site.id]}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {sites.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">暂无站点，先创建一个吧。</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
