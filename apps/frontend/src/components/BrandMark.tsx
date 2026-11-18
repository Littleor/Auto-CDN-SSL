import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  withName?: boolean;
};

/**
 * Mark: a closed padlock inside a renew arrow, set in a rounded square —
 * "SSL that renews itself". Stays legible down to favicon size.
 */
export function LogoGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-foreground" />
      <path d="M20.75 7.77A9.5 9.5 0 1 1 12.75 7.07" fill="none" strokeWidth="2.2" strokeLinecap="round" className="stroke-background" />
      <path d="M10.6 10.3 12.75 7.07 9.2 5.8" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-background" />
      <path d="M13.7 15.2v-1.5a2.3 2.3 0 0 1 4.6 0v1.5" fill="none" strokeWidth="1.8" className="stroke-background" />
      <rect x="11.6" y="14.8" width="8.8" height="6.6" rx="1.8" className="fill-background" />
      <circle cx="16" cy="18.1" r="1.05" className="fill-foreground" />
    </svg>
  );
}

export function BrandMark({ className, withName = true }: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoGlyph />
      {withName && (
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
          Auto<span className="text-muted-foreground"> CDN SSL</span>
        </span>
      )}
    </span>
  );
}
