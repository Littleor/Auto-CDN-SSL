import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-border/80 bg-white/55 px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-white/90 text-foreground shadow-[0_16px_36px_-24px_rgba(58,48,39,0.35)]">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

