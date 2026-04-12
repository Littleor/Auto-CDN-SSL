import {
  ArrowSquareOut,
  Cloud,
  Database,
  Files,
  GlobeHemisphereWest,
  GridFour,
  ShieldChevron,
  SignOut,
  SlidersHorizontal,
  SquaresFour
} from "@phosphor-icons/react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandMark";
import { useAuth } from "@/contexts/AuthContext";
import { usePageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

const navItems = [
  {
    to: "/app/dashboard",
    label: "概览",
    description: "从一个视图掌握证书健康度、到期风险和部署节奏。",
    icon: SquaresFour
  },
  {
    to: "/app/sites",
    label: "CDN 站点",
    description: "统一维护域名、证书来源、部署动作与 CDN HTTPS 状态。",
    icon: GlobeHemisphereWest
  },
  {
    to: "/app/renewal-settings",
    label: "续签设置",
    description: "定义每日调度时间、提前续签阈值以及自动部署策略。",
    icon: SlidersHorizontal
  },
  {
    to: "/app/domain-settings",
    label: "域名验证",
    description: "按顶级域名管理 HTTP-01 与 DNS-01 的验证路径。",
    icon: ShieldChevron
  },
  {
    to: "/app/providers",
    label: "CDN 凭据",
    description: "管理腾讯云与七牛云的同步凭据，用于站点发现和证书下发。",
    icon: Cloud
  },
  {
    to: "/app/dns-providers",
    label: "DNS 凭据",
    description: "为 DNS-01 验证准备独立或复用的腾讯云 DNS 凭据。",
    icon: Database
  },
  {
    to: "/app/deployments",
    label: "历史记录",
    description: "追踪续签、部署、失败原因和触发来源，方便回溯。",
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
        <div className="grid gap-4 lg:grid-cols-[284px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="surface p-5">
              <BrandMark />
              <div className="mt-6 grid gap-3">
                <div className="line-panel px-4 py-4">
                  <div className="section-label">Control Loop</div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold tracking-tight text-foreground">
                        每日续签调度
                      </div>
                      <div className="mt-1 text-xs leading-5 text-muted-foreground">
                        保持证书更新、验证与部署链路持续运转。
                      </div>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-primary animate-pulse-soft" />
                  </div>
                </div>
                <div className="line-panel px-4 py-4">
                  <div className="section-label">Active Account</div>
                  <div className="mt-3 text-sm font-semibold tracking-tight text-foreground">
                    {user?.email}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">
                    凭据、证书与部署记录均通过控制台统一管理。
                  </div>
                </div>
              </div>
            </div>

            <nav className="surface hidden p-3 lg:block">
              <div className="section-label px-3 pb-3 pt-1">Workspace</div>
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center gap-3 rounded-[1.25rem] px-3 py-3 transition-all duration-300 ease-out",
                          isActive
                            ? "bg-foreground text-background shadow-[0_20px_38px_-28px_rgba(57,46,36,0.45)]"
                            : "text-muted-foreground hover:bg-white/72 hover:text-foreground"
                        )
                      }
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-current/10 bg-current/5">
                        <Icon className="h-4 w-4" weight="duotone" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold tracking-tight">{item.label}</div>
                        <div className="truncate text-[0.7rem] uppercase tracking-[0.16em] opacity-70">
                          Console
                        </div>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </nav>

            <div className="surface hidden p-4 lg:block">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="section-label">Quick Exit</div>
                  <div className="mt-2 text-sm font-semibold tracking-tight text-foreground">
                    返回公开站点或退出登录
                  </div>
                </div>
                <GridFour className="h-5 w-5 text-muted-foreground" weight="duotone" />
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <NavLink to="/">
                    官网
                    <ArrowSquareOut className="ml-2 h-3.5 w-3.5" />
                  </NavLink>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => logout()}>
                  <SignOut className="mr-2 h-3.5 w-3.5" />
                  退出
                </Button>
              </div>
            </div>
          </aside>

          <main className="min-w-0 space-y-4">
            <header className="surface p-5 md:p-7">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <div className="space-y-3">
                  <div className="section-label">System Management</div>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-[-0.04em] text-foreground md:text-[2.6rem]">
                      {activeItem.label}
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                      {activeItem.description}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="line-panel min-w-[180px] px-4 py-4">
                    <div className="section-label">Current Module</div>
                    <div className="mt-3 text-sm font-semibold tracking-tight text-foreground">
                      {activeItem.label}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">保持视图、策略和凭据的一致性。</div>
                  </div>
                  <div className="line-panel min-w-[180px] px-4 py-4">
                    <div className="section-label">Workspace</div>
                    <div className="mt-3 text-sm font-semibold tracking-tight text-foreground">
                      Auto CDN SSL
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">以更少的人力维护整条 SSL 运维路径。</div>
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
                          "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200",
                          isActive
                            ? "bg-foreground text-background"
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
