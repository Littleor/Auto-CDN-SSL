import {
  ArrowSquareOut,
  Cloud,
  Database,
  Files,
  GlobeHemisphereWest,
  ShieldChevron,
  SignOut,
  SlidersHorizontal,
  SquaresFour
} from "@phosphor-icons/react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

const navItems = [
  {
    to: "/app/dashboard",
    label: "概览",
    description: "查看证书健康度、到期窗口与最近动作。",
    icon: SquaresFour
  },
  {
    to: "/app/sites",
    label: "CDN 站点",
    description: "统一维护域名、证书状态和部署动作。",
    icon: GlobeHemisphereWest
  },
  {
    to: "/app/renewal-settings",
    label: "续签设置",
    description: "管理调度时间、提前续签阈值和自动部署。",
    icon: SlidersHorizontal
  },
  {
    to: "/app/domain-settings",
    label: "域名验证",
    description: "按顶级域名整理 HTTP-01 与 DNS-01 策略。",
    icon: ShieldChevron
  },
  {
    to: "/app/providers",
    label: "CDN 凭据",
    description: "管理腾讯云与七牛云的同步凭据。",
    icon: Cloud
  },
  {
    to: "/app/dns-providers",
    label: "DNS 凭据",
    description: "为 DNS-01 验证准备或复用腾讯云凭据。",
    icon: Database
  },
  {
    to: "/app/deployments",
    label: "历史记录",
    description: "统一回看续签、部署与失败原因。",
    icon: Files
  }
];

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const activeItem =
    navItems.find((item) => location.pathname.startsWith(item.to)) ?? navItems[0];

  usePageSeo({
    title: `${activeItem.label} | Auto CDN SSL`,
    description: activeItem.description,
    path: location.pathname,
    robots: "noindex,nofollow"
  });

  return (
    <div className="min-h-[100dvh]">
      <div className="mx-auto max-w-[1480px] px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid gap-5 lg:grid-cols-[272px_minmax(0,1fr)]">
          <aside className="surface overflow-hidden lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)]">
            <div className="flex h-full flex-col p-4">
              <div className="px-2 pt-2">
                <BrandMark />
              </div>

              <div className="mt-7 px-2">
                <div className="section-label">Navigation</div>
              </div>

              <nav className="mt-3 flex-1 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center gap-3 rounded-[1.35rem] px-3 py-3 transition-all duration-300 ease-out",
                          isActive
                            ? "border border-primary/12 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.74)]"
                            : "border border-transparent text-muted-foreground hover:bg-white/58 hover:text-foreground"
                        )
                      }
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-current/10 bg-current/5">
                        <Icon className="h-4 w-4" weight="duotone" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium tracking-tight">{item.label}</div>
                        <div className="truncate text-[0.72rem] text-current/70">
                          {item.description}
                        </div>
                      </div>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="mt-6 border-t border-border/60 px-2 pt-4">
                <div className="line-panel px-4 py-4">
                  <div className="section-label">Account</div>
                  <div className="mt-2 text-sm font-medium tracking-tight text-foreground">
                    {user?.email}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    后台已经切成统一的极简系统风格，后续页面也会跟随同一套设计令牌。
                  </p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <NavLink to="/">
                      官网
                      <ArrowSquareOut className="ml-2 h-3.5 w-3.5" />
                    </NavLink>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => logout()}>
                    <SignOut className="mr-2 h-3.5 w-3.5" />
                    退出
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0 space-y-5">
            <header className="surface px-5 py-4 md:px-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="section-label">System</div>
                  <div className="mt-1 text-sm font-medium tracking-tight text-foreground">
                    {activeItem.label}
                  </div>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {activeItem.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-full border border-white/75 bg-white/68 px-3 py-2 text-xs font-medium text-muted-foreground">
                    Auto CDN SSL
                  </div>
                  <div className="rounded-full border border-white/75 bg-white/68 px-3 py-2 text-xs font-medium text-muted-foreground">
                    {user?.email}
                  </div>
                </div>
              </div>
            </header>

            <div className="surface p-3 lg:hidden">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-white/65 text-muted-foreground hover:text-foreground"
                        )
                      }
                    >
                      <Icon className="h-4 w-4" weight="duotone" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
