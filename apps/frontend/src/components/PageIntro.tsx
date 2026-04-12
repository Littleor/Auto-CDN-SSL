import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type IntroStat = {
  label: string;
  value: string;
  hint?: string;
};

type PageIntroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  stats?: IntroStat[];
  className?: string;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
  stats,
  className
}: PageIntroProps) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-2.5">
          {eyebrow && (
            <p className="section-label">
              {eyebrow}
            </p>
          )}
          <div className="space-y-2.5">
            <h1 className="max-w-3xl text-[2rem] font-semibold leading-[1.05] tracking-[-0.055em] text-foreground md:text-[3.1rem]">
              {title}
            </h1>
            <p className="max-w-[62ch] text-sm leading-7 text-muted-foreground md:text-[15px]">
              {description}
            </p>
          </div>
        </div>
        {action && (
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {action}
          </div>
        )}
      </div>

      {stats && stats.length > 0 && (
        <div className="surface overflow-hidden p-0">
          <div className="grid divide-y divide-border/60 md:grid-cols-2 md:divide-y-0 xl:grid-cols-4 xl:divide-x">
            {stats.map((item) => (
              <div key={item.label} className="px-5 py-4 md:px-6">
                <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {item.label}
                </div>
                <div className="mt-2 text-[1.45rem] font-semibold tracking-[-0.05em] text-foreground">
                  {item.value}
                </div>
                {item.hint && (
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.hint}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
