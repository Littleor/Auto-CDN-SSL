import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Plus, ShieldCheck, Server, Settings } from "lucide-react";
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
  dnsCredentialId: "",
  certificateSource: "self_signed",
  acmeChallengeType: "http-01",
  autoRenew: true,
  renewDaysBefore: 30
};

export function SitesPage() {
  const { accessToken } = useAuth();
  const [sites, setSites] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<any | null>(null);
  const [editForm, setEditForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [issuing, setIssuing] = useState<Record<string, "idle" | "loading" | "success" | "error">>({});
  const [deploying, setDeploying] = useState<Record<string, "idle" | "loading" | "success" | "error">>({});
  const [actionMessage, setActionMessage] = useState<Record<string, string>>({});
  const jobTimers = useRef<Record<string, number>>({});

  const providerOptions = useMemo(
    () => providers.filter((provider) => ["tencent", "qiniu"].includes(provider.providerType)),
    [providers]
  );
  const dnsOptions = useMemo(
    () =>
      providers.filter((provider) =>
        ["tencent_dns", "tencent"].includes(provider.providerType)
      ),
    [providers]
  );
  const hasDnsOptions = dnsOptions.length > 0;
  const providerLabel = (providerType: string) => {
    if (providerType === "tencent") return "腾讯云 CDN";
    if (providerType === "qiniu") return "七牛云 CDN";
    if (providerType === "tencent_dns") return "腾讯云 DNS";
    return providerType;
  };
  const dnsLabel = (provider: any) => {
    if (provider.providerType === "tencent") return `${provider.name}（复用 CDN 凭据）`;
    return provider.name;
  };

  const fetchData = () => {
    if (!accessToken) return;
    apiRequest<any[]>("/sites", {}, accessToken).then(setSites);
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
            dnsCredentialId:
              form.certificateSource === "letsencrypt" && form.acmeChallengeType === "dns-01"
                ? form.dnsCredentialId || null
                : null,
            certificateSource: form.certificateSource,
            acmeChallengeType: form.acmeChallengeType,
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

  const openEdit = (site: any) => {
    setEditingSite(site);
    setEditForm({
      name: site.name ?? "",
      domain: site.domain ?? "",
      providerCredentialId: site.providerCredentialId ?? "",
      dnsCredentialId: site.dnsCredentialId ?? "",
      certificateSource: site.certificateSource ?? "self_signed",
      acmeChallengeType: site.acmeChallengeType ?? "http-01",
      autoRenew: Boolean(site.autoRenew),
      renewDaysBefore: Number(site.renewDaysBefore ?? 30)
    });
    setEditError(null);
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!accessToken || !editingSite) return;
    setLoading(true);
    setEditError(null);
    try {
      await apiRequest(
        `/sites/${editingSite.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name: editForm.name,
            domain: editForm.domain,
            providerCredentialId: editForm.providerCredentialId || null,
            dnsCredentialId:
              editForm.certificateSource === "letsencrypt" &&
              editForm.acmeChallengeType === "dns-01"
                ? editForm.dnsCredentialId || null
                : null,
            certificateSource: editForm.certificateSource,
            acmeChallengeType: editForm.acmeChallengeType,
            autoRenew: editForm.autoRenew,
            renewDaysBefore: Number(editForm.renewDaysBefore)
          })
        },
        accessToken
      );
      setEditOpen(false);
      setEditingSite(null);
      fetchData();
    } catch (err: any) {
      setEditError(err.message || "更新失败");
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-semibold">网站管理</h2>
          <p className="text-sm text-muted-foreground">为每个站点配置证书来源与 CDN 平台。</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新建网站
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增网站</DialogTitle>
              <DialogDescription>填写站点与证书信息。</DialogDescription>
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
              </div>
              {form.certificateSource === "letsencrypt" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">验证方式</label>
                  <Select
                    value={form.acmeChallengeType}
                    onValueChange={(value) => setForm({ ...form, acmeChallengeType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择验证方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="http-01">HTTP-01（需开放 80 端口）</SelectItem>
                      <SelectItem value="dns-01" disabled={!hasDnsOptions}>
                        DNS-01（腾讯云 DNS）
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {!hasDnsOptions && (
                    <p className="text-xs text-muted-foreground">
                      还没有 DNS 凭据，先到“云平台凭据”创建腾讯云 DNS。
                    </p>
                  )}
                </div>
              )}
              {form.certificateSource === "letsencrypt" && form.acmeChallengeType === "dns-01" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">DNS 凭据（腾讯云）</label>
                  <Select
                    value={form.dnsCredentialId}
                    onValueChange={(value) => setForm({ ...form, dnsCredentialId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择 DNS 凭据" />
                    </SelectTrigger>
                    <SelectContent>
                      {dnsOptions.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {dnsLabel(provider)} ({providerLabel(provider.providerType)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {dnsOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      还没有腾讯云凭据，请先到“CDN 凭据”或“DNS 凭据”里创建腾讯云凭据。
                    </p>
                  )}
                </div>
              )}
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
        <Dialog
          open={editOpen}
          onOpenChange={(value) => {
            setEditOpen(value);
            if (!value) {
              setEditingSite(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑网站设置</DialogTitle>
              <DialogDescription>调整续签验证方式或凭据。</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">站点名称</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">域名</label>
                <Input
                  value={editForm.domain}
                  onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">证书来源</label>
                <Select
                  value={editForm.certificateSource}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, certificateSource: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择证书来源" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="letsencrypt">Let's Encrypt</SelectItem>
                    <SelectItem value="self_signed">自签证书 (开发环境)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editForm.certificateSource === "letsencrypt" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">验证方式</label>
                  <Select
                    value={editForm.acmeChallengeType}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, acmeChallengeType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择验证方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="http-01">HTTP-01（需开放 80 端口）</SelectItem>
                      <SelectItem value="dns-01" disabled={!hasDnsOptions}>
                        DNS-01（腾讯云 DNS）
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {!hasDnsOptions && (
                    <p className="text-xs text-muted-foreground">
                      还没有 DNS 凭据，先到“云平台凭据”创建腾讯云 DNS。
                    </p>
                  )}
                </div>
              )}
              {editForm.certificateSource === "letsencrypt" &&
                editForm.acmeChallengeType === "dns-01" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">DNS 凭据（腾讯云）</label>
                    <Select
                      value={editForm.dnsCredentialId}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, dnsCredentialId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择 DNS 凭据" />
                      </SelectTrigger>
                      <SelectContent>
                        {dnsOptions.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {dnsLabel(provider)} ({providerLabel(provider.providerType)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              <div className="space-y-2">
                <label className="text-sm font-medium">CDN 平台凭据</label>
                <Select
                  value={editForm.providerCredentialId}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, providerCredentialId: value })
                  }
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
              {editError && <p className="text-sm text-destructive">{editError}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                取消
              </Button>
              <Button onClick={handleUpdate} disabled={loading}>
                {loading ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>站点列表</CardTitle>
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
                const overdueDays =
                  remainingDays !== null && remainingDays < 0 ? Math.abs(remainingDays) : 0;
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
                    <TableCell className="min-w-[220px]">
                      {hasRange ? (
                        <div className="space-y-2">
                          <div className="h-2 w-full rounded-full bg-muted/70">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            有效期 {totalDays} 天 · {remainingDays !== null && remainingDays >= 0
                              ? `剩余 ${remainingDays} 天`
                              : `已过期 ${overdueDays} 天`}
                          </div>
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Server className="h-3.5 w-3.5" />
                        {site.providerCredentialId ? "已绑定" : "未绑定"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(site)}
                        >
                          <Settings className="mr-1 h-3.5 w-3.5" />
                          设置
                        </Button>
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
