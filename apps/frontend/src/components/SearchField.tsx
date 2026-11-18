import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

export function SearchField({ value, onChange, placeholder = "搜索", className, autoFocus }: SearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-8 w-full rounded-full bg-secondary pl-9 pr-9 text-[13px] text-foreground transition-colors placeholder:text-muted-foreground hover:bg-accent/80 focus:bg-accent/80 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
          aria-label="清空搜索"
        >
          <X className="h-3.5 w-3.5" weight="bold" />
        </button>
      )}
    </div>
  );
}
