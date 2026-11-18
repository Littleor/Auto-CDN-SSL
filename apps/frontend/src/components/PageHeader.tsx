import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  center?: boolean;
};

/** Big, quiet page title in the curated-gallery style. */
export function PageHeader({ eyebrow, title, description, action, className, center }: PageHeaderProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 pb-6 pt-6 md:pt-8",
        center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className={cn("min-w-0 space-y-1.5", center && "flex flex-col items-center")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.025em] text-foreground md:text-[1.75rem]">
          {title}
        </h1>
        {description && (
          <p className={cn("max-w-[60ch] text-[13px] leading-6 text-muted-foreground", center && "mx-auto")}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </section>
  );
}

export function Eyebrow({ children, dotClassName }: { children: ReactNode; dotClassName?: string }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full bg-success", dotClassName)} />
      {children}
    </span>
  );
}
