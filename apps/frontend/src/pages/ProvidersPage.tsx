import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowsClockwise, CircleNotch, Plus } from "@phosphor-icons/react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { AddCard, CredentialCard } from "@/components/credentials/CredentialCard";
import { CredentialDialog } from "@/components/credentials/CredentialDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiRequest, errorMessage } from "@/lib/api";
import type { Provider } from "@/lib/sites";
import { getPlatformLabel } from "@/lib/statusDisplay";

export function ProvidersPage() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Provider | null>(null);
  const [deleting, setDeleting] = useState(false);

  const cdnProviders = useMemo(
    () => providers.filter((provider) => ["tencent", "qiniu"].includes(provider.providerType)),
    [providers]
  );

  const fetchProviders = useCallback(() => {
    if (!accessToken) return;
    apiRequest<Provider[]>("/providers", {}, accessToken)
      .then(setProviders)
      .catch((err: unknown) => toast({ title: "加载凭据失败", description: errorMessage(err), tone: "error" }))
      .finally(() => setLoading(false));
  }, [accessToken, toast]);

  useEffect(() => fetchProviders(), [fetchProviders]);

  const sync = async (provider: Provider) => {
    if (!accessToken) return;
    setSyncingId(provider.id);
    try {
      const result = await apiRequest<{ total: number; created: number; updated: number }>(
        `/providers/${provider.id}/sync`,
        { method: "POST" },
        accessToken
      );
      toast({
        title: `${provider.name} 同步完成`,
        description: `共 ${result.total} 个域名：新增 ${result.created}，更新 ${result.updated}`,
        tone: "success"
      });
    } catch (err) {
      toast({ title: "同步失败", description: errorMessage(err), tone: "error" });
    } finally {
      setSyncingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!accessToken || !pendingDelete) return;
    setDeleting(true);
    try {
      await apiRequest(`/providers/${pendingDelete.id}`, { method: "DELETE" }, accessToken);
      toast({ title: `已删除 ${pendingDelete.name}`, tone: "success" });
      setPendingDelete(null);
      fetchProviders();
    } catch (err) {
      toast({ title: "删除失败", description: errorMessage(err), tone: "error" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="CDN 凭据"
        description="用于同步加速域名、并在续签后把证书部署到 CDN。腾讯云凭据也可直接用于 DNS-01 验证。"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" weight="bold" />
            新建凭据
          </Button>
        }
      />

      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-x-4 gap-y-5">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="skeleton aspect-[16/9] rounded-2xl" />)
          : cdnProviders.map((provider) => (
              <CredentialCard
                key={provider.id}
                name={provider.name}
                providerType={provider.providerType}
                typeLabel={getPlatformLabel(provider.providerType)}
                createdAt={provider.createdAt}
                onDelete={() => setPendingDelete(provider)}
                actions={
                  <button
                    type="button"
                    onClick={() => void sync(provider)}
                    disabled={syncingId === provider.id}
                    className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground transition-transform active:scale-95 disabled:opacity-80"
                  >
                    {syncingId === provider.id ? (
                      <CircleNotch className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowsClockwise className="h-4 w-4" weight="bold" />
                    )}
                    {syncingId === provider.id ? "同步中" : "同步站点"}
                  </button>
                }
              />
            ))}
        {!loading && (
          <AddCard
            label={cdnProviders.length === 0 ? "接入第一个 CDN" : "接入新的 CDN"}
            hint="支持腾讯云 CDN 与七牛云 CDN"
            onClick={() => setCreateOpen(true)}
          />
        )}
      </div>

      <CredentialDialog
        mode="cdn"
        open={createOpen}
        onOpenChange={setCreateOpen}
        accessToken={accessToken}
        onCreated={(name) => {
          toast({ title: `已添加 ${name}`, description: "点击「同步站点」导入该账号下的加速域名。", tone: "success" });
          fetchProviders();
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        destructive
        loading={deleting}
        confirmLabel="删除凭据"
        title={`删除 ${pendingDelete?.name ?? ""}？`}
        description="绑定该凭据的站点会变为「未绑定」，续签后将不再自动部署；站点本身和已有证书会保留。"
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
