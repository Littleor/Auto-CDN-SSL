import {
  Cloud,
  Database,
  Files,
  GlobeHemisphereWest,
  ShieldChevron,
  SlidersHorizontal,
  SquaresFour,
  type Icon
} from "@phosphor-icons/react";

export type NavItem = { to: string; label: string; icon: Icon; keywords?: string };

export const navItems: NavItem[] = [
  { to: "/app/dashboard", label: "概览", icon: SquaresFour, keywords: "dashboard overview home" },
  { to: "/app/sites", label: "站点", icon: GlobeHemisphereWest, keywords: "sites cdn domain 站点 域名" },
  { to: "/app/deployments", label: "历史", icon: Files, keywords: "history deploy renew 历史记录 部署" },
  { to: "/app/domain-settings", label: "域名验证", icon: ShieldChevron, keywords: "acme http-01 dns-01 challenge" },
  { to: "/app/providers", label: "CDN 凭据", icon: Cloud, keywords: "provider tencent qiniu credential" },
  { to: "/app/dns-providers", label: "DNS 凭据", icon: Database, keywords: "dns credential tencent" },
  { to: "/app/renewal-settings", label: "续签设置", icon: SlidersHorizontal, keywords: "renewal schedule settings 自动部署" }
];
