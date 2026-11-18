import { Check, Minus } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type CheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  label?: string;
};

export function Checkbox({ checked, indeterminate, onChange, className, label }: CheckboxProps) {
  const on = checked || indeterminate;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-[background-color,border-color,transform] duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        on ? "border-primary bg-primary text-primary-foreground" : "border-foreground/25 bg-background/90 backdrop-blur hover:border-foreground/50",
        className
      )}
    >
      {indeterminate ? (
        <Minus className="h-2.5 w-2.5" weight="bold" />
      ) : checked ? (
        <Check className="h-2.5 w-2.5" weight="bold" />
      ) : null}
    </button>
  );
}
