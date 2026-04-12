import { ShieldCheck } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
  labelClassName?: string;
};

export function BrandMark({ className, compact = false, labelClassName }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.35rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,244,238,0.9))] shadow-[0_18px_40px_-28px_rgba(63,53,44,0.35),inset_0_1px_0_rgba(255,255,255,0.9)]">
        <ShieldCheck className="h-5 w-5 text-foreground" weight="bold" />
      </div>
      {!compact && (
        <div className={cn("min-w-0", labelClassName)}>
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Certificate Control
          </div>
          <div className="text-sm font-semibold tracking-tight text-foreground">Auto CDN SSL</div>
        </div>
      )}
    </div>
  );
}

