import { useEffect, useState } from "react";
import { ArrowSquareOut, List, MagnifyingGlass, Moon, Plus, SignOut, Sun } from "@phosphor-icons/react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogoGlyph } from "@/components/BrandMark";
import { CommandPalette } from "@/components/CommandPalette";
import { navItems } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { usePageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label={theme === "dark" ? "切换到亮色模式" : "切换到暗色模式"}
      title={theme === "dark" ? "亮色模式" : "暗色模式"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const activeItem = navItems.find((item) => location.pathname.startsWith(item.to)) ?? navItems[0];

  usePageSeo({
    title: `${activeItem.label} | Auto CDN SSL`,
    description: `${activeItem.label} - Auto CDN SSL 控制台`,
    path: location.pathname,
    robots: "noindex,nofollow"
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const initial = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-4 md:px-8">
          <Link to="/app/dashboard" className="shrink-0 rounded-full" aria-label="Auto CDN SSL 概览">
            <LogoGlyph className="h-7 w-7" />
          </Link>

          <nav className="no-scrollbar ml-3 hidden min-w-0 items-center gap-0.5 overflow-x-auto lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "inline-flex h-8 shrink-0 items-center rounded-full px-3 text-[13px] font-medium transition-colors duration-200",
                    isActive ? "bg-secondary text-foreground" : "text-foreground/75 hover:bg-secondary/70 hover:text-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden h-8 w-[220px] shrink-0 items-center gap-2 rounded-full bg-secondary px-3 text-[13px] text-muted-foreground transition-colors hover:bg-accent md:flex 2xl:w-[280px]"
          >
            <MagnifyingGlass className="h-4 w-4" />
            <span className="flex-1 text-left">搜索</span>
            <span className="text-[11px] tracking-wide opacity-70">{isMac ? "⌘K" : "Ctrl K"}</span>
          </button>

          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setPaletteOpen(true)} aria-label="搜索">
              <MagnifyingGlass className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={() => navigate("/app/sites?new=1")}
              aria-label="新建站点"
              title="新建站点"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-transform active:scale-95"
                  aria-label="账户菜单"
                >
                  {initial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="text-sm font-medium text-foreground">{user?.name || "已登录"}</div>
                  <div className="truncate">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/")}>
                  <ArrowSquareOut />
                  返回官网
                </DropdownMenuItem>
                <DropdownMenuItem destructive onSelect={() => void logout()}>
                  <SignOut />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="ml-1 lg:hidden" aria-label="打开导航">
                  <List className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navItems.map((item) => (
                  <DropdownMenuItem
                    key={item.to}
                    onSelect={() => navigate(item.to)}
                    className={cn(location.pathname.startsWith(item.to) && "bg-secondary")}
                  >
                    <item.icon />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 pb-24 md:px-8">
        <Outlet />
      </main>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
