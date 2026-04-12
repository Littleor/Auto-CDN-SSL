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
    <section className={cn("space-y-6", className)}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-3">
          {eyebrow && (
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <div className="space-y-3">
            <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
              {title}
            </h1>
            <p className="max-w-[70ch] text-sm leading-7 text-muted-foreground md:text-base">
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-[1.8rem] border border-white/80 bg-white/72 px-5 py-4 shadow-[0_24px_50px_-40px_rgba(58,48,39,0.3),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl"
            >
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {item.label}
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                {item.value}
              </div>
              {item.hint && (
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.hint}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

