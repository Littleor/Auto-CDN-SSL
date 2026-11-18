import { cn } from "@/lib/utils";

type SegmentedOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  title?: string;
};

type SegmentedProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
  size?: "default" | "sm";
  ariaLabel?: string;
};

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "default",
  ariaLabel
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("inline-flex shrink-0 items-center gap-0.5 rounded-full bg-secondary p-1", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              size === "sm" ? "h-6 px-2.5 text-xs" : "h-6 px-3 text-[13px]",
              active
                ? "bg-background text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
