import { ArrowsClockwise, CircleNotch } from "@phosphor-icons/react";
import { Checkbox } from "@/components/ui/checkbox";
import { SiteMenu } from "@/components/sites/SiteMenu";
import { daysHeadline, healthBar, healthSurface, healthText } from "@/components/sites/siteVisuals";
import { formatDay } from "@/lib/format";
import { healthMeta, type DecoratedSite } from "@/lib/sites";
import { getPlatformLabel } from "@/lib/statusDisplay";
import type { ActionState } from "@/lib/useSiteActions";
import { cn } from "@/lib/utils";

type SiteCardProps = {
  site: DecoratedSite;
  action?: ActionState;
  selected?: boolean;
  selecting?: boolean;
  onToggleSelect?: (selected: boolean) => void;
  onOpen: () => void;
  onRenew: () => void;
  onDelete: () => void;
};

export function SiteCard({ site, action, selected, selecting, onToggleSelect, onOpen, onRenew, onDelete }: SiteCardProps) {
  const headline = daysHeadline(site.days);
  const busy = action?.phase === "issuing" || action?.phase === "deploying";
  const meta = healthMeta[site.health];

  return (
    <article className="group">
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen();
          }
        }}
        className={cn(
          "relative flex h-[148px] cursor-pointer flex-col overflow-hidden rounded-2xl p-4 border border-black/[0.04] transition-[transform,box-shadow] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/[0.05]",
          healthSurface[site.health],
          selected ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "hover:shadow-pop"
        )}
      >
        <div className="flex items-start gap-2.5">
          {/* Initial avatar → checkbox on hover / while selecting */}
          <div className="relative mt-px h-6 w-6 shrink-0">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-[11px] font-semibold uppercase text-foreground/70 transition-opacity",
                onToggleSelect && (selecting || selected ? "opacity-0" : "group-hover:opacity-0")
              )}
            >
              {site.domain.replace(/^www\./, "").charAt(0)}
            </span>
            {onToggleSelect && (
              <Checkbox
                checked={Boolean(selected)}
                onChange={onToggleSelect}
                label={`选择 ${site.domain}`}
                className={cn(
                  "absolute inset-0 m-auto h-5 w-5 transition-opacity",
                  selecting || selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                )}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="line-clamp-2 text-[15px] font-semibold leading-[22px] tracking-[-0.01em] text-foreground [overflow-wrap:anywhere]"
              title={site.domain}
            >
              {site.domain}
            </h3>
            {site.name !== site.domain && (
              <p className="truncate text-xs text-foreground/55" title={site.name}>
                {site.name}
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-end justify-between gap-3">
            <div className="flex min-w-0 items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-foreground tabular-nums">
                {headline.value}
              </span>
              {headline.unit && <span className="text-xs font-medium text-foreground/60">{headline.unit}</span>}
              <span className={cn("ml-1 text-xs font-medium", healthText[site.health])}>{meta.label}</span>
            </div>
            <div
              className={cn(
                "flex items-center gap-1.5 transition-[opacity,transform] duration-200",
                busy ? "opacity-100" : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
              )}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRenew();
                }}
                disabled={busy}
                className="inline-flex h-7 items-center gap-1 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground transition-transform active:scale-95 disabled:opacity-80"
              >
                {busy ? <CircleNotch className="h-3.5 w-3.5 animate-spin" /> : <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />}
                {action?.phase === "issuing" ? "续签中" : action?.phase === "deploying" ? "部署中" : "续签"}
              </button>
              <SiteMenu onOpen={onOpen} onRenew={onRenew} onDelete={onDelete} busy={busy} />
            </div>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-foreground/[0.08]">
            <div
              className={cn("h-full rounded-full transition-[width] duration-700", healthBar[site.health])}
              style={{ width: `${site.progress ?? (site.health === "expired" ? 100 : 0)}%` }}
            />
          </div>
        </div>
      </div>

      <p className="truncate px-1 pt-2 text-xs text-muted-foreground">
        {site.providerType ? getPlatformLabel(site.providerType) : "未绑定平台"}
        {" · "}
        {site.expiresAt ? `${formatDay(site.expiresAt)} 到期` : "尚未签发证书"}
      </p>
      {action?.message && (
        <p
          className={cn(
            "mt-1 line-clamp-2 px-1 text-xs leading-5",
            action.phase === "error" ? "text-destructive" : action.phase === "success" ? "text-success" : "text-muted-foreground"
          )}
          title={action.message}
        >
          {action.message}
        </p>
      )}
    </article>
  );
}
