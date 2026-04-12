import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[1.75rem] border border-border/65 bg-white/52 px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/82 text-primary shadow-[0_14px_30px_-24px_rgba(15,23,42,0.18)]">
        {icon}
      </div>
      <h3 className="mt-5 text-base font-semibold tracking-[-0.03em] text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
