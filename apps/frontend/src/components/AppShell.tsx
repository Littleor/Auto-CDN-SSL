import { NavLink, Outlet } from "react-router-dom";
import { ShieldCheck, LayoutDashboard, Globe, Cloud, ScrollText, LogOut, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/app/dashboard", label: "概览", icon: LayoutDashboard },
  { to: "/app/sites", label: "CDN 站点", icon: Globe },
  { to: "/app/domain-settings", label: "域名验证", icon: ShieldCheck },
  { to: "/app/providers", label: "CDN 凭据", icon: Cloud },
  { to: "/app/dns-providers", label: "DNS 凭据", icon: Server },
  { to: "/app/deployments", label: "部署记录", icon: ScrollText }
];

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-16 top-28 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
      </div>
      <div className="mx-auto flex min-h-screen max-w-[1440px] gap-6 px-6 py-8">
        <div className="w-full lg:hidden">
          <div className="surface flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background shadow-glow">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold tracking-tight">Auto-SSL</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              退出
            </Button>
          </div>

          <div className="surface mt-4 flex flex-wrap gap-2 p-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition",
                      isActive
                        ? "bg-foreground/5 text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-foreground/5"
                    )
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
        <aside className="hidden w-72 flex-col gap-6 lg:flex">
          <div className="surface flex items-center gap-3 px-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background shadow-glow">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold tracking-tight">Auto-SSL</p>
              <p className="text-xs text-muted-foreground">CDN SSL 证书续签</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-foreground/5 text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-foreground/5"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="surface p-4 text-sm">
              <p className="text-xs text-muted-foreground">当前账号</p>
              <p className="mt-2 font-semibold">{user?.email}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </Button>
          </div>
        </aside>

        <main className="flex-1">
          <div className="surface rounded-3xl p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
