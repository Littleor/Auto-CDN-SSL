import type { ReactNode } from "react";
import { ArrowsClockwise, CircleNotch, Trash } from "@phosphor-icons/react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Dialog, SheetContent } from "@/components/ui/dialog";
import { daysHeadline, healthBar, healthSurface } from "@/components/sites/siteVisuals";
import { formatDate } from "@/lib/format";
import { healthMeta, type DecoratedSite } from "@/lib/sites";
import {
  getCdnStatusLabel,
  getCertificateStatusLabel,
  getHttpsStatusLabel,
  getPlatformLabel,
  getToneByStatus
} from "@/lib/statusDisplay";
import type { ActionState } from "@/lib/useSiteActions";
import { cn } from "@/lib/utils";

type SiteDetailSheetProps = {
  site: DecoratedSite | null;
  action?: ActionState;
  onOpenChange: (open: boolean) => void;
  onRenew: (site: DecoratedSite) => void;
  onDelete: (site: DecoratedSite) => void;
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3.5">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}

export function SiteDetailSheet({ site, action, onOpenChange, onRenew, onDelete }: SiteDetailSheetProps) {
  const busy = action?.phase === "issuing" || action?.phase === "deploying";

  return (
    <Dialog open={Boolean(site)} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined}>
        {site && (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className={cn("relative m-2 rounded-[14px] px-6 pb-6 pt-12", healthSurface[site.health])}>
                <StatusPill tone={healthMeta[site.health].tone} className="bg-background/80 backdrop-blur">
                  {healthMeta[site.health].label}
                </StatusPill>
                <DialogPrimitive.Title className="mt-3 break-all text-xl font-semibold leading-tight tracking-[-0.025em]">
                  {site.domain}
                </DialogPrimitive.Title>
                {site.name !== site.domain && <p className="mt-1 text-sm text-foreground/60">{site.name}</p>}
                <div className="mt-8 flex items-baseline gap-1.5">
                  <span className="text-[44px] font-semibold leading-none tracking-[-0.05em] tabular-nums">
                    {daysHeadline(site.days).value}
                  </span>
                  <span className="text-sm font-medium text-foreground/60">{daysHeadline(site.days).unit}</span>
                </div>
                <div className="mt-1 text-sm font-medium text-foreground/60">
                  {daysHeadline(site.days).caption}
                  {site.totalDays ? ` · 共 ${site.totalDays} 天` : ""}
                </div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-foreground/[0.08]">
                  <div
                    className={cn("h-full rounded-full", healthBar[site.health])}
                    style={{ width: `${site.progress ?? (site.health === "expired" ? 100 : 0)}%` }}
                  />
                </div>
              </div>

              {action?.message && (
                <div
                  className={cn(
                    "mx-4 mt-4 flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm leading-6",
                    action.phase === "error"
                      ? "bg-destructive/10 text-destructive"
                      : action.phase === "success"
                        ? "bg-success/10 text-success"
                        : "bg-secondary text-muted-foreground"
                  )}
                >
                  {busy && <CircleNotch className="mt-1 h-4 w-4 shrink-0 animate-spin" />}
                  <span className="break-words">{action.message}</span>
                </div>
              )}

              <div className="px-6 pb-6 pt-4">
                <h3 className="pb-1 pt-2 text-sm font-semibold">证书</h3>
                <dl className="divide-y divide-border">
                  <Row label="证书状态">
                    {site.certificateStatus ? (
                      <StatusPill tone={getToneByStatus(site.certificateStatus)}>
                        {getCertificateStatusLabel(site.certificateStatus)}
                      </StatusPill>
                    ) : (
                      "未签发"
                    )}
                  </Row>
                  <Row label="签发 / 部署时间">{formatDate(site.issuedAt)}</Row>
                  <Row label="到期时间">{formatDate(site.expiresAt)}</Row>
                  {site.certificateSource && <Row label="证书来源">{getPlatformLabel(site.certificateSource)}</Row>}
                  {site.providerCertName && <Row label="CDN 侧证书名">{site.providerCertName}</Row>}
                </dl>

                <h3 className="pb-1 pt-6 text-sm font-semibold">CDN</h3>
                <dl className="divide-y divide-border">
                  <Row label="平台">{site.providerType ? getPlatformLabel(site.providerType) : "未绑定"}</Row>
                  {site.providerName && <Row label="凭据">{site.providerName}</Row>}
                  <Row label="CDN 状态">
                    {site.providerStatus ? (
                      <StatusPill tone={getToneByStatus(site.providerStatus)}>{getCdnStatusLabel(site.providerStatus)}</StatusPill>
                    ) : (
                      "-"
                    )}
                  </Row>
                  <Row label="HTTPS 配置">{getHttpsStatusLabel(site.providerHttps)}</Row>
                </dl>
              </div>
            </div>

            <div className="flex gap-2 border-t border-border p-4">
              <Button className="flex-1" onClick={() => onRenew(site)} disabled={busy}>
                {busy ? <CircleNotch className="h-4 w-4 animate-spin" /> : <ArrowsClockwise className="h-4 w-4" weight="bold" />}
                {action?.phase === "issuing" ? "续签中…" : action?.phase === "deploying" ? "部署中…" : "续签并部署"}
              </Button>
              <Button variant="destructive-ghost" onClick={() => onDelete(site)} disabled={busy}>
                <Trash className="h-4 w-4" />
                删除
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Dialog>
  );
}
