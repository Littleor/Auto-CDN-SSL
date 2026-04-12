import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold tracking-tight transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background active:translate-y-[1px] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-primary-foreground shadow-[0_18px_36px_-22px_rgba(57,46,36,0.42)] hover:-translate-y-[1px] hover:bg-foreground/92",
        secondary:
          "bg-primary text-primary-foreground shadow-[0_18px_36px_-22px_rgba(24,98,67,0.28)] hover:-translate-y-[1px] hover:bg-primary/92",
        outline:
          "border border-border/80 bg-white/78 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] hover:-translate-y-[1px] hover:border-foreground/20 hover:bg-white/92",
        ghost: "text-foreground/80 hover:bg-white/70",
        destructive: "bg-destructive text-destructive-foreground hover:-translate-y-[1px] hover:bg-destructive/92"
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
