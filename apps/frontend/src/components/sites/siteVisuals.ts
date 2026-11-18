import type { SiteHealth } from "@/lib/sites";

export const healthSurface: Record<SiteHealth, string> = {
  healthy:
    "bg-[linear-gradient(140deg,#e7f6ec_0%,#f3faf5_55%,#eef7f1_100%)] dark:bg-[linear-gradient(140deg,#0f2417_0%,#0d1a12_60%,#0b130e_100%)]",
  expiring:
    "bg-[linear-gradient(140deg,#fdf1dc_0%,#fef8ec_55%,#fcf2e1_100%)] dark:bg-[linear-gradient(140deg,#2a1e0b_0%,#1d160b_60%,#15110a_100%)]",
  expired:
    "bg-[linear-gradient(140deg,#fde6e6_0%,#fef3f2_55%,#fbe9e8_100%)] dark:bg-[linear-gradient(140deg,#2b1212_0%,#1e0f0f_60%,#160c0c_100%)]",
  missing: "bg-secondary"
};

export const healthBar: Record<SiteHealth, string> = {
  healthy: "bg-success",
  expiring: "bg-warning",
  expired: "bg-destructive",
  missing: "bg-muted-foreground/40"
};

export const healthText: Record<SiteHealth, string> = {
  healthy: "text-success",
  expiring: "text-warning",
  expired: "text-destructive",
  missing: "text-muted-foreground"
};

export function daysHeadline(days: number | null) {
  if (days === null) return { value: "—", unit: "", caption: "暂无证书信息" };
  if (days < 0) return { value: String(Math.abs(days)), unit: "天", caption: "已过期" };
  return { value: String(days), unit: "天", caption: "剩余有效期" };
}
