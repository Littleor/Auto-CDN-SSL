import type { ReactNode } from "react";
import { DotsThree, Plus, Trash } from "@phosphor-icons/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDay } from "@/lib/format";
import { cn } from "@/lib/utils";

const brand: Record<string, { word: string; surface: string; mark: string }> = {
  tencent: {
    word: "腾讯云",
    surface: "bg-[linear-gradient(140deg,#e6f0ff_0%,#f3f7ff_60%,#eaf1fe_100%)] dark:bg-[linear-gradient(140deg,#0d1a2e_0%,#0b1322_100%)]",
    mark: "bg-[#0052d9] text-white"
  },
  tencent_dns: {
    word: "DNSPod",
    surface: "bg-[linear-gradient(140deg,#e7f5f7_0%,#f2fafb_60%,#e6f3f5_100%)] dark:bg-[linear-gradient(140deg,#0b2226_0%,#0a171a_100%)]",
    mark: "bg-[#0a8a9a] text-white"
  },
  qiniu: {
    word: "七牛云",
    surface: "bg-[linear-gradient(140deg,#e6f6fd_0%,#f2fafe_60%,#e5f3fb_100%)] dark:bg-[linear-gradient(140deg,#0a1f2b_0%,#09151d_100%)]",
    mark: "bg-[#06aeef] text-white"
  }
};

type CredentialCardProps = {
  name: string;
  providerType: string;
  typeLabel: string;
  createdAt: string;
  badge?: ReactNode;
  actions?: ReactNode;
  onDelete?: () => void;
};

export function CredentialCard({ name, providerType, typeLabel, createdAt, badge, actions, onDelete }: CredentialCardProps) {
  const meta = brand[providerType] ?? { word: typeLabel, surface: "bg-secondary", mark: "bg-primary text-primary-foreground" };
  return (
    <article className="group">
      <div className={cn("relative aspect-[16/9] overflow-hidden rounded-2xl border border-black/[0.04] dark:border-white/[0.05]", meta.surface)}>
        <div className="absolute left-3.5 top-3.5 flex items-center gap-2">
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold", meta.mark)}>
            {meta.word.charAt(0)}
          </span>
          {badge}
        </div>
        {onDelete && (
          <div className="absolute right-3 top-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-background/90 shadow-[0_1px_2px_rgba(0,0,0,0.08)] backdrop-blur"
                  aria-label="更多操作"
                >
                  <DotsThree className="h-4 w-4" weight="bold" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem destructive onSelect={onDelete}>
                  <Trash />
                  删除凭据
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <div className="text-[22px] font-semibold leading-none tracking-[-0.03em] text-foreground/90">{meta.word}</div>
          {actions}
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 px-1 pt-2.5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {typeLabel} · 创建于 {formatDay(createdAt)}
          </p>
        </div>
      </div>
    </article>
  );
}

/** Dashed "open slot" card for adding a new item. */
export function AddCard({ label, hint, onClick }: { label: string; hint: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex aspect-[16/9] w-full flex-col items-center justify-center rounded-2xl border-[1.5px] border-dashed border-border text-center transition-colors hover:border-foreground/25 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-10 w-12 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-background">
        <Plus className="h-4 w-4" weight="bold" />
      </span>
      <span className="mt-3 text-[15px] font-semibold tracking-[-0.02em]">{label}</span>
      <span className="mt-0.5 text-xs text-muted-foreground">{hint}</span>
    </button>
  );
}
