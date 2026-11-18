import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CircleNotch, Minus, Plus } from "@phosphor-icons/react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiRequest, errorMessage } from "@/lib/api";

type UserSettingsForm = {
  renewalHour: number;
  renewalMinute: number;
  renewalThresholdDays: number;
  autoDeploy: boolean;
};

const pad = (value: number) => String(value).padStart(2, "0");

function SettingRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 py-7 md:flex-row md:items-center md:justify-between md:gap-10">
      <div className="max-w-[52ch]">
        <div className="text-[15px] font-semibold tracking-[-0.015em]">{title}</div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function RenewalSettingsPage() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const [saved, setSaved] = useState<UserSettingsForm | null>(null);
  const [settings, setSettings] = useState<UserSettingsForm | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(() => {
    if (!accessToken) return;
    apiRequest<UserSettingsForm>("/user-settings", {}, accessToken)
      .then((data) => {
        setSaved(data);
        setSettings(data);
      })
      .catch((err: unknown) => toast({ title: "加载设置失败", description: errorMessage(err), tone: "error" }));
  }, [accessToken, toast]);

  useEffect(fetchSettings, [fetchSettings]);

  const update = (patch: Partial<UserSettingsForm>) => setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  const dirty = Boolean(settings && saved && JSON.stringify(settings) !== JSON.stringify(saved));
  const clampDays = (value: number) => Math.min(90, Math.max(1, Math.round(value)));

  const save = async () => {
    if (!accessToken || !settings) return;
    setSaving(true);
    try {
      await apiRequest("/user-settings", { method: "PUT", body: JSON.stringify(settings) }, accessToken);
      toast({ title: "续签设置已保存", tone: "success" });
      fetchSettings();
    } catch (err) {
      toast({ title: "保存失败", description: errorMessage(err), tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[920px]">
      <PageHeader title="续签设置" description="控制自动续签什么时候运行、提前多久续签，以及续签后是否自动部署。" />

      {!settings ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-[100px]" />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          <SettingRow title="每日运行时间" description="调度器每天在这个时间扫描所有站点，为进入续签窗口的证书执行续签。">
            <input
              type="time"
              value={`${pad(settings.renewalHour)}:${pad(settings.renewalMinute)}`}
              onChange={(e) => {
                const [hour, minute] = e.target.value.split(":").map(Number);
                if (Number.isNaN(hour) || Number.isNaN(minute)) return;
                update({ renewalHour: hour, renewalMinute: minute });
              }}
              className="h-10 rounded-full bg-secondary px-4 text-lg font-semibold tabular-nums tracking-[-0.02em] text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </SettingRow>

          <SettingRow title="提前续签" description="证书剩余有效期小于该天数时开始续签。Let's Encrypt 证书有效期为 90 天，推荐 30 天。">
            <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-background"
                onClick={() => update({ renewalThresholdDays: clampDays(settings.renewalThresholdDays - 1) })}
                aria-label="减少一天"
              >
                <Minus className="h-4 w-4" weight="bold" />
              </Button>
              <label className="flex items-baseline gap-1 px-2">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={settings.renewalThresholdDays}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (!Number.isNaN(value)) update({ renewalThresholdDays: clampDays(value) });
                  }}
                  className="w-10 bg-transparent text-center text-lg font-semibold tabular-nums tracking-[-0.02em] [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  aria-label="提前续签天数"
                />
                <span className="text-sm text-muted-foreground">天</span>
              </label>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-background"
                onClick={() => update({ renewalThresholdDays: clampDays(settings.renewalThresholdDays + 1) })}
                aria-label="增加一天"
              >
                <Plus className="h-4 w-4" weight="bold" />
              </Button>
            </div>
          </SettingRow>

          <SettingRow title="续签后自动部署" description="续签成功后，立即把新证书下发到站点绑定的 CDN 平台。">
            <Segmented
              value={settings.autoDeploy ? "on" : "off"}
              onChange={(value) => update({ autoDeploy: value === "on" })}
              options={[
                { value: "on", label: "自动部署" },
                { value: "off", label: "仅续签" }
              ]}
            />
          </SettingRow>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-8">
        {dirty && <span className="text-sm text-muted-foreground">有未保存的修改</span>}
        {dirty && (
          <Button variant="secondary" onClick={() => setSettings(saved)}>
            还原
          </Button>
        )}
        <Button onClick={() => void save()} disabled={saving || !dirty}>
          {saving && <CircleNotch className="h-4 w-4 animate-spin" />}
          保存设置
        </Button>
      </div>
    </div>
  );
}
