import { useEffect, useMemo, useState } from "react";
import { Cloud, Plus, Trash } from "@phosphor-icons/react";
import { EmptyState } from "@/components/EmptyState";
import { PageIntro } from "@/components/PageIntro";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";

const initialForm = {
  providerType: "tencent_dns",
  name: "",
  secretId: "",
  secretKey: ""
};

export function DnsProvidersPage() {
  const { accessToken } = useAuth();
  const [providers, setProviders] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dnsProviders = useMemo(
    () => providers.filter((provider) => provider.providerType === "tencent_dns"),
    [providers]
  );
  const reusableCdnProviders = useMemo(
    () => providers.filter((provider) => provider.providerType === "tencent"),
    [providers]
  );

  const displayProviders = useMemo(
    () =>
      [
        ...dnsProviders.map((provider) => ({
          ...provider,
          source: "dns" as const
        })),
        ...reusableCdnProviders.map((provider) => ({
          ...provider,
          source: "cdn" as const
        }))
      ],
    [dnsProviders, reusableCdnProviders]
  );

  const fetchProviders = () => {
    if (!accessToken) return;
    apiRequest<any[]>("/providers", {}, accessToken).then(setProviders);
  };

  useEffect(() => {
    fetchProviders();
  }, [accessToken]);

  const handleSubmit = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      await apiRequest(
        "/providers",
        {
          method: "POST",
          body: JSON.stringify({
            providerType: "tencent_dns",
            name: form.name,
            config: { secretId: form.secretId, secretKey: form.secretKey }
          })
        },
        accessToken
      );
      setOpen(false);
      setForm(initialForm);
      fetchProviders();
    } catch (err: any) {
      setError(err.message || "创建失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    await apiRequest(`/providers/${id}`, { method: "DELETE" }, accessToken);
    fetchProviders();
  };

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="DNS Credentials"
        title="把 DNS-01 需要的凭据单独管理，同时允许复用腾讯云 CDN 凭据"
        description="DNS 凭据页也统一到了新的布局，重点信息变得更清楚，复用关系也不会再埋在说明文字里。"
        stats={[
          {
            label: "独立 DNS",
            value: String(dnsProviders.length),
            hint: "专门为 DNS-01 创建的凭据"
          },
          {
            label: "可复用 CDN",
            value: String(reusableCdnProviders.length),
            hint: "可直接用于 DNS-01 的腾讯云 CDN 凭据"
          }
        ]}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" weight="bold" />
                新建 DNS 凭据
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增 DNS 凭据</DialogTitle>
                <DialogDescription>填写腾讯云 SecretId / SecretKey。</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">凭据名称</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="如：DNS 生产环境"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SecretId</label>
                  <Input
                    value={form.secretId}
                    onChange={(e) => setForm({ ...form, secretId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SecretKey</label>
                  <Input
                    value={form.secretKey}
                    onChange={(e) => setForm({ ...form, secretKey: e.target.value })}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "保存中..." : "保存"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="p-1">
        <CardContent className="py-4 text-sm text-muted-foreground">
          「CDN 凭据」里的腾讯云凭据也会出现在这里，可直接用于 DNS-01 验证。
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {displayProviders.map((provider) => (
          <Card key={`${provider.source}-${provider.id}`} className="p-1">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <div className="section-label">Credential</div>
                <CardTitle className="text-base">{provider.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {provider.source === "dns" ? "腾讯云 DNS" : "腾讯云 CDN"}
                </p>
              </div>
              <Cloud className="h-5 w-5 text-primary" weight="duotone" />
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                创建时间：{new Date(provider.createdAt).toLocaleDateString("zh-CN")}
              </div>
              {provider.source === "dns" ? (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(provider.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">可复用</span>
              )}
            </CardContent>
          </Card>
        ))}
        {displayProviders.length === 0 && (
          <EmptyState
            icon={<Cloud className="h-6 w-6" weight="duotone" />}
            title="暂无 DNS / CDN 凭据"
            description="创建 DNS 凭据或先接入腾讯云 CDN 凭据后，这里会自动形成可复用的 DNS-01 验证能力。"
          />
        )}
      </div>
    </div>
  );
}
