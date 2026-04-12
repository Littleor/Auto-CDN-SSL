import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[100px] w-full rounded-[1.2rem] border border-input/75 bg-white/82 px-4 py-3 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_12px_30px_-24px_rgba(58,48,39,0.18)] placeholder:text-muted-foreground transition-[box-shadow,border-color,background-color] duration-300 ease-out focus-visible:border-primary/40 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
