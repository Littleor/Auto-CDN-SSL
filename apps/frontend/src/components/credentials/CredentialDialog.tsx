import { useEffect, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { apiRequest, errorMessage } from "@/lib/api";

type Kind = "tencent" | "qiniu" | "tencent_dns";

type CredentialDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessToken: string | null;
  /** CDN mode lets the user choose between Tencent and Qiniu; DNS mode is fixed to Tencent DNS. */
  mode: "cdn" | "dns";
  onCreated: (name: string) => void;
};

const empty = { name: "", secretId: "", secretKey: "", accessKey: "" };

export function CredentialDialog({ open, onOpenChange, accessToken, mode, onCreated }: CredentialDialogProps) {
  const [kind, setKind] = useState<Kind>(mode === "dns" ? "tencent_dns" : "tencent");
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setKind(mode === "dns" ? "tencent_dns" : "tencent");
      setForm(empty);
      setError(null);
    }
  }, [open, mode]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const config =
        kind === "qiniu"
          ? { accessKey: form.accessKey.trim(), secretKey: form.secretKey.trim() }
          : { secretId: form.secretId.trim(), secretKey: form.secretKey.trim() };
      await apiRequest(
        "/providers",
        { method: "POST", body: JSON.stringify({ providerType: kind, name: form.name.trim(), config }) },
        accessToken
      );
      onOpenChange(false);
      onCreated(form.name.trim());
    } catch (err) {
      setError(errorMessage(err, "保存失败"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{mode === "dns" ? "新建 DNS 凭据" : "新建 CDN 凭据"}</DialogTitle>
            <DialogDescription>
              {mode === "dns" ? "腾讯云 DNS 的 SecretId / SecretKey，用于 DNS-01 验证。" : "API 密钥会使用 AES-256-GCM 加密存储。"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {mode === "cdn" && (
              <Field label="平台">
                <Segmented
                  value={kind}
                  onChange={setKind}
                  options={[
                    { value: "tencent", label: "腾讯云 CDN" },
                    { value: "qiniu", label: "七牛云 CDN" }
                  ]}
                />
              </Field>
            )}
            <Field label="名称" htmlFor="cred-name">
              <Input
                id="cred-name"
                required
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={mode === "dns" ? "如：DNS 生产环境" : "如：生产环境"}
              />
            </Field>
            {kind === "qiniu" ? (
              <Field label="AccessKey" htmlFor="cred-ak">
                <Input
                  id="cred-ak"
                  required
                  autoComplete="off"
                  value={form.accessKey}
                  onChange={(e) => setForm({ ...form, accessKey: e.target.value })}
                />
              </Field>
            ) : (
              <Field label="SecretId" htmlFor="cred-id">
                <Input
                  id="cred-id"
                  required
                  autoComplete="off"
                  value={form.secretId}
                  onChange={(e) => setForm({ ...form, secretId: e.target.value })}
                />
              </Field>
            )}
            <Field label="SecretKey" htmlFor="cred-key">
              <Input
                id="cred-key"
                required
                type="password"
                autoComplete="new-password"
                value={form.secretKey}
                onChange={(e) => setForm({ ...form, secretKey: e.target.value })}
              />
            </Field>
            {error && <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <CircleNotch className="h-4 w-4 animate-spin" />}
              保存凭据
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
