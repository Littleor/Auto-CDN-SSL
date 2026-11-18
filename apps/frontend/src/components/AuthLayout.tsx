import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/AppShell";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";

type AuthLayoutProps = {
  title: ReactNode;
  description?: ReactNode;
  switchLabel: string;
  switchTo: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, description, switchLabel, switchTo, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-2 px-4 md:px-6">
        <Link to="/" aria-label="返回首页">
          <BrandMark />
        </Link>
        <div className="flex-1" />
        <ThemeToggle />
        <Button variant="secondary" asChild>
          <Link to={switchTo}>{switchLabel}</Link>
        </Button>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-24 pt-8">
        <div className="w-full max-w-[420px]">
          <h1 className="text-center text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] md:text-[1.75rem]">{title}</h1>
          {description && <p className="mt-3 text-center text-sm leading-7 text-muted-foreground">{description}</p>}
          <div className="mt-10">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
