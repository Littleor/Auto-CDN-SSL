import { useState } from "react";
import { ArrowsClockwise, Check, CloudArrowUp, Copy } from "@phosphor-icons/react";
import { StatusPill } from "@/components/ui/chip";
import { formatDate, formatRelative } from "@/lib/format";
import {
  getCertificateStatusLabel,
  getHistoryTriggerLabel,
  getPlatformLabel,
  getToneByStatus,
  isScheduledTrigger
} from "@/lib/statusDisplay";
import { cn } from "@/lib/utils";

export type HistoryRecord = {
  id: string;
  category: "renew" | "deploy";
  siteId: string;
  domain: string | null;
  providerCredentialId: string | null;
  providerType: string | null;
  providerName: string | null;
  triggerSource: string;
  status: string;
  message: string | null;
  occurredAt: string;
  createdAt: string;
};

export function HistoryRow({ item, compact }: { item: HistoryRecord; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const Icon = item.category === "renew" ? ArrowsClockwise : CloudArrowUp;
  const failed = item.status?.toLowerCase() === "failed";

  const copy = async () => {
    if (!item.message) return;
    try {
      await navigator.clipboard.writeText(item.message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; nothing else to do.
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-secondary/70">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          failed ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-[13px] font-medium text-foreground">{item.domain || "已删除的站点"}</span>
          <span className="text-xs text-muted-foreground">
            {item.category === "renew" ? "续签" : "部署"}
            {item.providerType ? ` · ${getPlatformLabel(item.providerType)}` : ""}
            {item.providerName && !compact ? ` · ${item.providerName}` : ""}
          </span>
        </div>
        {item.message && (
          <button
            type="button"
            onClick={() => void copy()}
            title={`${item.message}\n\n点击复制`}
            className="group/msg mt-0.5 flex max-w-full items-start gap-1.5 text-left text-xs leading-5 text-muted-foreground hover:text-foreground"
          >
            <span className={cn("min-w-0", compact ? "line-clamp-1" : "line-clamp-2")}>
              {copied ? "已复制完整信息" : item.message}
            </span>
            {copied ? (
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            ) : (
              <Copy className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover/msg:opacity-100" />
            )}
          </button>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <StatusPill tone={getToneByStatus(item.status)}>{getCertificateStatusLabel(item.status)}</StatusPill>
        <span className="whitespace-nowrap text-xs text-muted-foreground" title={formatDate(item.occurredAt)}>
          {!compact && (isScheduledTrigger(item.triggerSource) ? "自动 · " : `${getHistoryTriggerLabel(item.triggerSource)} · `)}
          {formatRelative(item.occurredAt)}
        </span>
      </div>
    </div>
  );
}
