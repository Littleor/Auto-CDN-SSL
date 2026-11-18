import { useEffect, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, errorMessage } from "@/lib/api";
import type { Provider } from "@/lib/sites";
import { getPlatformLabel } from "@/lib/statusDisplay";

const NONE = "__none__";

const defaultForm = {
  name: "",
  domain: "",
  providerCredentialId: NONE,
  certificateSource: "letsencrypt" as "letsencrypt" | "self_signed"
};

type CreateSiteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers: Provider[];
  accessToken: string | null;
  onCreated: (domain: string) => void;
};

export function CreateSiteDialog({ open, onOpenChange, providers, accessToken, onCreated }: CreateSiteDialogProps) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cdnProviders = providers.filter((provider) => ["tencent", "qiniu"].includes(provider.providerType));

  useEffect(() => {
    if (open) {
      setForm(defaultForm);
      setError(null);
    }
  }, [open]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    const domain = form.domain.trim();
    try {
      await apiRequest(
        "/sites",
        {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim() || domain,
            domain,
            providerCredentialId: form.providerCredentialId === NONE ? null : form.providerCredentialId,
            certificateSource: form.certificateSource,
            autoRenew: true,
            renewDaysBefore: 30
          })
        },
        accessToken
      );
      onOpenChange(false);
      onCreated(domain);
    } catch (err) {
      setError(errorMessage(err, "创建失败"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>新建站点</DialogTitle>
            <DialogDescription>添加一个 CDN 加速域名，开始自动管理它的证书。</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <Field label="域名" htmlFor="site-domain">
              <Input
                id="site-domain"
                autoFocus
                required
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                placeholder="static.example.com"
              />
            </Field>
            <Field label="站点名称" htmlFor="site-name" hint="留空时使用域名作为名称。">
              <Input
                id="site-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="如：主站静态资源"
              />
            </Field>
            <Field
              label="证书来源"
              hint={form.certificateSource === "letsencrypt" ? "验证方式在「域名验证」中按顶级域名统一配置。" : "自签证书仅适合开发环境。"}
            >
              <Segmented
                value={form.certificateSource}
                onChange={(value) => setForm({ ...form, certificateSource: value })}
                options={[
                  { value: "letsencrypt", label: "Let's Encrypt" },
                  { value: "self_signed", label: "自签证书" }
                ]}
              />
            </Field>
            <Field label="CDN 凭据" hint="绑定后，续签成功会自动部署到该平台。">
              <Select value={form.providerCredentialId} onValueChange={(value) => setForm({ ...form, providerCredentialId: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>暂不绑定</SelectItem>
                  {cdnProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name} · {getPlatformLabel(provider.providerType)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {error && <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading || !form.domain.trim()}>
              {loading && <CircleNotch className="h-4 w-4 animate-spin" />}
              创建站点
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
