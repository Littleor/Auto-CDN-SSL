import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type IntroStat = {
  label: string;
  value: string;
  hint?: string;
};

type PageIntroProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  stats?: IntroStat[];
  className?: string;
};

export function PageIntro({
  title,
  description,
  action,
  stats,
  className
}: PageIntroProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="space-y-2">
          <h1 className="max-w-3xl text-[1.9rem] font-semibold leading-[1.06] tracking-[-0.05em] text-foreground md:text-[2.6rem]">
            {title}
          </h1>
          {description ? (
            <p className="max-w-[60ch] text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action && (
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {action}
          </div>
        )}
      </div>

      {stats && stats.length > 0 && (
        <div className="flex flex-wrap gap-2">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-full border border-white/75 bg-white/72 px-3 py-2"
              >
                <div className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </div>
                <div className="mt-1 text-sm font-medium tracking-tight text-foreground">
                  {item.value}
                </div>
                {item.hint ? <p className="mt-1 text-[11px] text-muted-foreground">{item.hint}</p> : null}
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
