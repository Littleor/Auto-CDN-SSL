import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";

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

export function RenewalSettingsPage() {
  const { accessToken } = useAuth();
  const [settings, setSettings] = useState<UserSettingsForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSettings = () => {
    if (!accessToken) return;
    apiRequest<UserSettingsForm>("/user-settings", {}, accessToken).then(setSettings);
  };

  useEffect(() => {
    fetchSettings();
  }, [accessToken]);

  const updateSettings = (patch: Partial<UserSettingsForm>) => {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSave = async () => {
    if (!accessToken || !settings) return;
    setSaving(true);
    setMessage(null);
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
      setMessage("已保存");
      fetchSettings();
    } catch (err: any) {
      setMessage(err.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background shadow-glow">
          <SlidersHorizontal className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">CDN 续签与 ACME 设置</h2>
          <p className="text-sm text-muted-foreground">
            独立管理 CDN SSL 证书续签时间与 ACME 参数。
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>续签策略</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!settings ? (
            <div className="text-sm text-muted-foreground">加载中...</div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ACME 参数</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!settings ? (
            <div className="text-sm text-muted-foreground">加载中...</div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button onClick={handleSave} disabled={saving || !settings}>
          {saving ? "保存中..." : "保存设置"}
        </Button>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
