import { ArrowRight, CheckCircle, LockSimple } from "@phosphor-icons/react";

/** Small, static product vignettes that stand in for screenshots on the landing page cards. */

export function RenewPreview() {
  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(140deg,#e7f6ec_0%,#f3faf5_55%,#eef7f1_100%)] p-6 dark:bg-[linear-gradient(140deg,#0f2417_0%,#0b130e_100%)]">
      <span className="absolute right-4 top-4 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium backdrop-blur">腾讯云 CDN</span>
      <div className="text-xs font-medium text-foreground/60">剩余有效期</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[40px] font-semibold leading-none tracking-[-0.045em]">87</span>
        <span className="text-sm font-medium text-foreground/60">天</span>
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-foreground/[0.08]">
        <div className="h-full w-[94%] rounded-full bg-success" />
      </div>
    </div>
  );
}

export function DeployPreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(140deg,#e6f0ff_0%,#f3f7ff_60%,#eaf1fe_100%)] p-6 dark:bg-[linear-gradient(140deg,#0d1a2e_0%,#0b1322_100%)]">
      <div className="flex w-full max-w-[320px] flex-col gap-2.5">
        <div className="flex items-center justify-between rounded-2xl bg-background/90 px-4 py-3 text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          Let's Encrypt
          <span className="text-xs text-success">已签发</span>
        </div>
        <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-foreground/40" weight="bold" />
        <div className="grid grid-cols-2 gap-2.5">
          {["腾讯云 CDN", "七牛云 CDN"].map((item) => (
            <div key={item} className="flex items-center gap-1.5 rounded-2xl bg-background/90 px-3 py-3 text-xs font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <CheckCircle className="h-4 w-4 text-success" weight="fill" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChallengePreview() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[linear-gradient(140deg,#f3eefe_0%,#f8f5ff_60%,#f1ecfd_100%)] p-6 dark:bg-[linear-gradient(140deg,#1d1530_0%,#140f21_100%)]">
      <div className="inline-flex items-center gap-1 rounded-full bg-background/70 p-1 text-sm font-medium">
        <span className="rounded-full px-4 py-1.5 text-muted-foreground">HTTP-01</span>
        <span className="rounded-full bg-background px-4 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.08)]">DNS-01</span>
      </div>
      <code className="max-w-full truncate rounded-2xl bg-background/90 px-4 py-3 font-mono text-[12px] text-foreground/80">
        _acme-challenge.example.com TXT "x7Kp…"
      </code>
    </div>
  );
}

export function SyncPreview() {
  const rows = [
    ["static.example.com", "新增"],
    ["img.example.com", "新增"],
    ["www.example.com", "更新"]
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(140deg,#e6f6fd_0%,#f2fafe_60%,#e5f3fb_100%)] p-6 dark:bg-[linear-gradient(140deg,#0a1f2b_0%,#09151d_100%)]">
      <div className="w-full max-w-[320px] divide-y divide-border/70 overflow-hidden rounded-2xl bg-background/90 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        {rows.map(([domain, tag]) => (
          <div key={domain} className="flex items-center justify-between px-4 py-2.5 text-xs">
            <span className="font-medium">{domain}</span>
            <span className="text-muted-foreground">{tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistoryPreview() {
  const rows = [
    ["自动续签", "成功", "bg-success"],
    ["自动部署", "成功", "bg-success"],
    ["手动续签", "失败", "bg-destructive"]
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(140deg,#fdf1dc_0%,#fef8ec_55%,#fcf2e1_100%)] p-6 dark:bg-[linear-gradient(140deg,#2a1e0b_0%,#15110a_100%)]">
      <div className="w-full max-w-[320px] space-y-3">
        {rows.map(([label, status, dot], index) => (
          <div key={index} className="flex items-center gap-3">
            <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
            <span className="flex-1 rounded-full bg-background/90 px-4 py-2 text-xs font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              {label} · {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VaultPreview() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#111] p-6 text-white dark:bg-[#161616]">
      <LockSimple className="h-8 w-8 opacity-80" />
      <div className="font-mono text-sm font-medium tracking-tight">AES-256-GCM</div>
      <div className="font-mono text-[12px] text-white/40">SecretKey ●●●●●●●●●●●●</div>
    </div>
  );
}
