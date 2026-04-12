import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em]",
  {
    variants: {
      variant: {
        default: "border-primary/12 bg-primary/8 text-primary",
        success: "border-emerald-600/12 bg-emerald-600/8 text-emerald-700",
        warning: "border-amber-600/14 bg-amber-500/10 text-amber-700",
        muted: "border-border/80 bg-white/70 text-muted-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
