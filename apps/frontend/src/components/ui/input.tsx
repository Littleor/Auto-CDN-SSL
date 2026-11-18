import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-9 w-full rounded-xl border border-transparent bg-input px-3 text-[13px] text-foreground transition-[background-color,border-color,box-shadow] duration-200 placeholder:text-muted-foreground/80 hover:bg-accent/70 focus-visible:border-foreground/15 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/[0.06] disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
