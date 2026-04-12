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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.15rem] border border-white/75 bg-white/72 shadow-[0_16px_34px_-24px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.84)] backdrop-blur-xl">
        <ShieldCheck className="h-4.5 w-4.5 text-primary" weight="bold" />
      </div>
      {!compact && (
        <div className={cn("min-w-0", labelClassName)}>
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            CDN SSL Control
          </div>
          <div className="text-sm font-semibold tracking-tight text-foreground">Auto CDN SSL</div>
        </div>
      )}
    </div>
  );
}
