import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";

type DomainSetting = {
  apexDomain: string;
  challengeType: "http-01" | "dns-01";
  dnsCredentialId: string | null;
  source: "configured" | "inferred" | "default";
};

export function DomainSettingsPage() {
  const { accessToken } = useAuth();
  const [settings, setSettings] = useState<DomainSetting[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<Record<string, string>>({});

  const dnsOptions = useMemo(
    () => providers.filter((provider) => ["tencent", "tencent_dns"].includes(provider.providerType)),
    [providers]
  );

  const dnsLabel = (provider: any) => {
    if (provider.providerType === "tencent") return `${provider.name}（复用 CDN 凭据）`;
    return provider.name;
  };

  const fetchData = () => {
    if (!accessToken) return;
    apiRequest<DomainSetting[]>("/domain-settings", {}, accessToken).then(setSettings);
    apiRequest<any[]>("/providers", {}, accessToken).then(setProviders);
  };

  useEffect(() => {
    fetchData();
  }, [accessToken]);

  const updateSetting = (apexDomain: string, patch: Partial<DomainSetting>) => {
    setSettings((prev) =>
      prev.map((item) => (item.apexDomain === apexDomain ? { ...item, ...patch } : item))
    );
  };

  const handleSave = async (setting: DomainSetting) => {
    if (!accessToken) return;
    setSaving((prev) => ({ ...prev, [setting.apexDomain]: true }));
    setMessage((prev) => ({ ...prev, [setting.apexDomain]: "" }));
    try {
      await apiRequest(
        `/domain-settings/${encodeURIComponent(setting.apexDomain)}`,
        {
          method: "PUT",
          body: JSON.stringify({
            challengeType: setting.challengeType,
            dnsCredentialId: setting.challengeType === "dns-01" ? setting.dnsCredentialId : null
          })
        },
        accessToken
      );
      setMessage((prev) => ({ ...prev, [setting.apexDomain]: "已保存" }));
      fetchData();
    } catch (err: any) {
      setMessage((prev) => ({ ...prev, [setting.apexDomain]: err.message || "保存失败" }));
    } finally {
      setSaving((prev) => ({ ...prev, [setting.apexDomain]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">域名验证</h2>
        <p className="text-sm text-muted-foreground">
          按顶级域名统一配置 HTTP-01 或 DNS-01 验证方式。
        </p>
      </div>

      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          DNS-01 可复用腾讯云 CDN 凭据；如需独立管理，可在「DNS 凭据」中新建。
        </CardContent>
      </Card>

      {settings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
            <ShieldCheck className="h-6 w-6" />
            暂无站点域名，请先创建网站。
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>顶级域名配置</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>顶级域名</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>验证方式</TableHead>
                  <TableHead>DNS 凭据</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((setting) => {
                  const isDns = setting.challengeType === "dns-01";
                  const statusBadge =
                    setting.source === "configured"
                      ? { variant: "success" as const, label: "已配置" }
                      : setting.source === "inferred"
                        ? { variant: "warning" as const, label: "继承" }
                        : { variant: "muted" as const, label: "默认" };
                  return (
                    <TableRow key={setting.apexDomain}>
                      <TableCell className="font-medium">{setting.apexDomain}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={setting.challengeType}
                          onValueChange={(value) => {
                            updateSetting(setting.apexDomain, {
                              challengeType: value as "http-01" | "dns-01",
                              dnsCredentialId: value === "dns-01" ? setting.dnsCredentialId : null
                            });
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="选择方式" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="http-01">HTTP-01</SelectItem>
                            <SelectItem value="dns-01">DNS-01</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={setting.dnsCredentialId ?? ""}
                          onValueChange={(value) =>
                            updateSetting(setting.apexDomain, {
                              dnsCredentialId: value || null
                            })
                          }
                          disabled={!isDns}
                        >
                          <SelectTrigger className="min-w-[220px]">
                            <SelectValue placeholder={isDns ? "选择 DNS 凭据" : "仅 DNS-01 需要"} />
                          </SelectTrigger>
                          <SelectContent>
                            {dnsOptions.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {dnsLabel(provider)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isDns && dnsOptions.length === 0 && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            还没有腾讯云凭据，请先到「CDN 凭据」或「DNS 凭据」创建。
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleSave(setting)}
                          disabled={saving[setting.apexDomain]}
                        >
                          {saving[setting.apexDomain] ? "保存中..." : "保存"}
                        </Button>
                        {message[setting.apexDomain] && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {message[setting.apexDomain]}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
