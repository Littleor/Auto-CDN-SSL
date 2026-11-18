import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleNotch, ShieldCheck } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SearchField } from "@/components/SearchField";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Segmented } from "@/components/ui/segmented";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiRequest, errorMessage } from "@/lib/api";
import type { Provider } from "@/lib/sites";
import { cn } from "@/lib/utils";

type Challenge = "http-01" | "dns-01";

type DomainSetting = {
  apexDomain: string;
  challengeType: Challenge;
  dnsCredentialId: string | null;
  source: "configured" | "inferred" | "default";
};

const sourceMeta = {
  configured: { label: "已配置", tone: "success" as const },
  inferred: { label: "继承", tone: "warning" as const },
  default: { label: "默认", tone: "neutral" as const }
};

export function DomainSettingsPage() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const [saved, setSaved] = useState<DomainSetting[]>([]);
  const [drafts, setDrafts] = useState<Record<string, DomainSetting>>({});
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");

  const dnsOptions = useMemo(
    () => providers.filter((provider) => ["tencent", "tencent_dns"].includes(provider.providerType)),
    [providers]
  );

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [settings, providerItems] = await Promise.all([
        apiRequest<DomainSetting[]>("/domain-settings", {}, accessToken),
        apiRequest<Provider[]>("/providers", {}, accessToken)
      ]);
      setSaved(settings);
      setDrafts(Object.fromEntries(settings.map((item) => [item.apexDomain, item])));
      setProviders(providerItems);
    } catch (err) {
      toast({ title: "加载失败", description: errorMessage(err), tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [accessToken, toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const patch = (apex: string, next: Partial<DomainSetting>) =>
    setDrafts((prev) => ({ ...prev, [apex]: { ...prev[apex], ...next } }));

  const save = async (setting: DomainSetting) => {
    if (!accessToken) return;
    if (setting.challengeType === "dns-01" && !setting.dnsCredentialId) {
      toast({ title: "请选择 DNS 凭据", description: "DNS-01 需要一个腾讯云凭据来写入 TXT 记录。", tone: "error" });
      return;
    }
    setSaving((prev) => ({ ...prev, [setting.apexDomain]: true }));
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
      toast({ title: `${setting.apexDomain} 已保存`, tone: "success" });
      await fetchData();
    } catch (err) {
      toast({ title: "保存失败", description: errorMessage(err), tone: "error" });
    } finally {
      setSaving((prev) => ({ ...prev, [setting.apexDomain]: false }));
    }
  };

  const visible = saved.filter((item) => !query.trim() || item.apexDomain.includes(query.trim().toLowerCase()));

  return (
    <div>
      <PageHeader
        title="域名验证"
        description="按顶级域名统一设置 Let's Encrypt 的验证方式，其下所有子域名站点都会沿用。"
        action={saved.length > 6 ? <SearchField value={query} onChange={setQuery} placeholder="搜索顶级域名" className="w-full md:w-[280px]" /> : undefined}
      />

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-secondary/70 p-5">
          <div className="text-sm font-semibold">HTTP-01</div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            通过访问 <code className="rounded bg-background px-1.5 py-0.5 text-xs">/.well-known/acme-challenge/</code> 验证，需要源站可被访问。
          </p>
        </div>
        <div className="rounded-2xl bg-secondary/70 p-5">
          <div className="text-sm font-semibold">DNS-01</div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            自动写入 TXT 记录验证，适合 CDN 回源受限的域名。可复用腾讯云 CDN 凭据，或在
            <Link to="/app/dns-providers" className="mx-1 font-medium text-foreground underline-offset-4 hover:underline">
              DNS 凭据
            </Link>
            中新建。
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-[88px]" />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck />}
          title="暂无站点域名"
          description="先添加站点，系统会根据域名自动整理出可配置的顶级域名。"
          action={
            <Button asChild>
              <Link to="/app/sites?new=1">新建站点</Link>
            </Button>
          }
        />
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {visible.map((original) => {
            const setting = drafts[original.apexDomain] ?? original;
            const isDns = setting.challengeType === "dns-01";
            const dirty =
              setting.challengeType !== original.challengeType ||
              (isDns && setting.dnsCredentialId !== original.dnsCredentialId);
            const meta = sourceMeta[original.source];
            return (
              <div
                key={original.apexDomain}
                className="grid items-center gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(240px,300px)_auto]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="truncate text-[15px] font-semibold tracking-[-0.015em]">{original.apexDomain}</span>
                  <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                </div>
                <Segmented
                  value={setting.challengeType}
                  onChange={(value) =>
                    patch(original.apexDomain, {
                      challengeType: value,
                      dnsCredentialId: value === "dns-01" ? setting.dnsCredentialId : null
                    })
                  }
                  options={[
                    { value: "http-01", label: "HTTP-01" },
                    { value: "dns-01", label: "DNS-01" }
                  ]}
                />
                <div className={cn("transition-opacity", !isDns && "pointer-events-none opacity-40")}>
                  <Select
                    value={setting.dnsCredentialId ?? undefined}
                    onValueChange={(value) => patch(original.apexDomain, { dnsCredentialId: value })}
                    disabled={!isDns}
                  >
                    <SelectTrigger className="h-9 rounded-full">
                      <SelectValue placeholder={isDns ? (dnsOptions.length ? "选择 DNS 凭据" : "暂无可用凭据") : "仅 DNS-01 需要凭据"} />
                    </SelectTrigger>
                    <SelectContent>
                      {dnsOptions.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                          {provider.providerType === "tencent" ? "（复用 CDN 凭据）" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  className="h-9 justify-self-start px-5 lg:justify-self-end"
                  variant={dirty ? "default" : "secondary"}
                  onClick={() => void save(setting)}
                  disabled={saving[original.apexDomain] || (!dirty && original.source === "configured")}
                >
                  {saving[original.apexDomain] && <CircleNotch className="h-4 w-4 animate-spin" />}
                  {original.source === "configured" && !dirty ? "已保存" : "保存"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
