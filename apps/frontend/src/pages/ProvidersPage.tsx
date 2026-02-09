import { useEffect, useState } from "react";
import { Cloud, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";

const initialForm = {
  providerType: "tencent",
  name: "",
  secretId: "",
  secretKey: "",
  accessKey: ""
};

export function ProvidersPage() {
  const { accessToken } = useAuth();
  const [providers, setProviders] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const config =
        form.providerType === "tencent"
          ? { secretId: form.secretId, secretKey: form.secretKey }
          : { accessKey: form.accessKey, secretKey: form.secretKey };

      await apiRequest(
        "/providers",
        {
          method: "POST",
          body: JSON.stringify({
            providerType: form.providerType,
            name: form.name,
            config
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">云平台凭据</h2>
          <p className="text-sm text-muted-foreground">安全保存并用于自动部署 CDN 证书。</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新建凭据
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增云平台凭据</DialogTitle>
              <DialogDescription>填写腾讯云或七牛云的 API Key。</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">平台类型</label>
                <Select
                  value={form.providerType}
                  onValueChange={(value) => setForm({ ...form, providerType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择平台" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tencent">腾讯云</SelectItem>
                    <SelectItem value="qiniu">七牛云</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">凭据名称</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="如：生产环境"
                />
              </div>
              {form.providerType === "tencent" ? (
                <>
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
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">AccessKey</label>
                    <Input
                      value={form.accessKey}
                      onChange={(e) => setForm({ ...form, accessKey: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SecretKey</label>
                    <Input
                      value={form.secretKey}
                      onChange={(e) => setForm({ ...form, secretKey: e.target.value })}
                    />
                  </div>
                </>
              )}
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => (
          <Card key={provider.id}>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{provider.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{provider.providerType}</p>
              </div>
              <Cloud className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                创建时间：{new Date(provider.createdAt).toLocaleDateString("zh-CN")}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(provider.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {providers.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
              <Cloud className="h-6 w-6" />
              暂无平台凭据
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
