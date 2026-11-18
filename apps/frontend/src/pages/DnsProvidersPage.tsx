import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { AddCard, CredentialCard } from "@/components/credentials/CredentialCard";
import { CredentialDialog } from "@/components/credentials/CredentialDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiRequest, errorMessage } from "@/lib/api";
import type { Provider } from "@/lib/sites";

export function DnsProvidersPage() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Provider | null>(null);
  const [deleting, setDeleting] = useState(false);

  const dnsProviders = useMemo(() => providers.filter((p) => p.providerType === "tencent_dns"), [providers]);
  const reusable = useMemo(() => providers.filter((p) => p.providerType === "tencent"), [providers]);

  const fetchProviders = useCallback(() => {
    if (!accessToken) return;
    apiRequest<Provider[]>("/providers", {}, accessToken)
      .then(setProviders)
      .catch((err: unknown) => toast({ title: "加载凭据失败", description: errorMessage(err), tone: "error" }))
      .finally(() => setLoading(false));
  }, [accessToken, toast]);

  useEffect(() => fetchProviders(), [fetchProviders]);

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
        title="DNS 凭据"
        description="DNS-01 验证通过添加 TXT 记录完成。可新建独立的 DNS 凭据，也可直接复用腾讯云 CDN 凭据。"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" weight="bold" />
            新建 DNS 凭据
          </Button>
        }
      />

      <h2 className="mb-4 text-base font-semibold tracking-[-0.015em]">独立 DNS 凭据</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-x-4 gap-y-5">
        {loading
          ? Array.from({ length: 2 }).map((_, index) => <div key={index} className="skeleton aspect-[16/9] rounded-2xl" />)
          : dnsProviders.map((provider) => (
              <CredentialCard
                key={provider.id}
                name={provider.name}
                providerType={provider.providerType}
                typeLabel="腾讯云 DNS"
                createdAt={provider.createdAt}
                onDelete={() => setPendingDelete(provider)}
              />
            ))}
        {!loading && <AddCard label="新建 DNS 凭据" hint="腾讯云 SecretId / SecretKey" onClick={() => setCreateOpen(true)} />}
      </div>

      {!loading && reusable.length > 0 && (
        <>
          <h2 className="mb-1 mt-12 text-base font-semibold tracking-[-0.015em]">可复用的 CDN 凭据</h2>
          <p className="mb-5 text-sm text-muted-foreground">以下腾讯云 CDN 凭据可直接在「域名验证」中选作 DNS-01 凭据，管理请前往「CDN 凭据」。</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-x-4 gap-y-5">
            {reusable.map((provider) => (
              <CredentialCard
                key={provider.id}
                name={provider.name}
                providerType={provider.providerType}
                typeLabel="腾讯云 CDN"
                createdAt={provider.createdAt}
                badge={
                  <span className="inline-flex h-8 items-center rounded-full bg-background/80 px-3 text-xs font-medium backdrop-blur">
                    复用
                  </span>
                }
              />
            ))}
          </div>
        </>
      )}

      <CredentialDialog
        mode="dns"
        open={createOpen}
        onOpenChange={setCreateOpen}
        accessToken={accessToken}
        onCreated={(name) => {
          toast({ title: `已添加 ${name}`, tone: "success" });
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
        description="使用该凭据做 DNS-01 验证的顶级域名需要重新选择凭据，否则续签会失败。"
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
