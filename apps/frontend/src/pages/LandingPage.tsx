import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Cloud,
  Clock,
  Lock,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "CDN SSL 自动续签",
    desc: "证书到期前自动触发续签，保障线上服务连续可用。",
    icon: ShieldCheck
  },
  {
    title: "多平台一键部署",
    desc: "支持腾讯云、七牛云 CDN 平台，续签后自动下发证书。",
    icon: Cloud
  },
  {
    title: "可视化到期洞察",
    desc: "证书生命周期一目了然，异常情况及时预警。",
    icon: Clock
  },
  {
    title: "密钥安全加密",
    desc: "凭据与证书采用 AES-256-GCM 加密存储，降低泄露风险。",
    icon: Lock
  }
];

const steps = [
  {
    title: "接入 CDN 凭据",
    desc: "新增腾讯云或七牛云凭据，系统自动拉取站点信息。",
    icon: ServerCog
  },
  {
    title: "配置验证方式",
    desc: "按顶级域名配置 HTTP-01 或 DNS-01 验证策略。",
    icon: BadgeCheck
  },
  {
    title: "自动续签与部署",
    desc: "到期前自动续签并同步到 CDN，状态实时可见。",
    icon: Zap
  }
];

const faqs = [
  {
    q: "是否只面向 CDN 场景？",
    a: "是的，Auto CDN SSL 聚焦 CDN 场景的 SSL 证书续签、部署与监控。"
  },
  {
    q: "支持哪些平台？",
    a: "当前支持腾讯云与七牛云 CDN，并支持腾讯云 DNS-01 验证。"
  },
  {
    q: "证书数据是否安全？",
    a: "平台使用 AES-256-GCM 对敏感数据加密，密钥由你的环境变量提供。"
  }
];

export function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-80px] h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[-120px] top-10 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <section className="mx-auto flex min-h-[90vh] max-w-6xl flex-col justify-center gap-10 px-6 py-20 lg:flex-row lg:items-center">
        <div className="space-y-6 lg:w-3/5">
          <div className="flex items-center gap-2">
            <Badge className="bg-foreground/5 text-foreground" variant="muted">
              CDN SSL 专用
            </Badge>
            <span className="text-xs text-muted-foreground">Auto CDN SSL</span>
          </div>
          <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
            CDN SSL 证书自动续签与部署
            <span className="gradient-text">一体化平台</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Auto CDN SSL 为开发团队提供可视化证书运营能力，自动续签、自动部署、自动监控，
            让 CDN HTTPS 始终安全稳定。
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/register">
                立即开始 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">已有账号登录</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>适配企业级 CDN 续签流程</span>
            <span>多站点多账号协作</span>
            <span>到期风险可视化</span>
          </div>
        </div>

        <div className="lg:w-2/5">
          <Card className="surface shadow-glow">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">证书状态看板</CardTitle>
                <p className="text-xs text-muted-foreground">实时同步 CDN SSL 状态</p>
              </div>
              <Sparkles className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-white/80 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">cdn.example.com</span>
                  <Badge variant="success">正常</Badge>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-muted/80">
                    <div className="h-1.5 w-3/4 rounded-full bg-emerald-500" />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>剩余 67 天</span>
                    <span>67/90</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-white/80 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">static.example.com</span>
                  <Badge variant="warning">临近</Badge>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-muted/80">
                    <div className="h-1.5 w-2/5 rounded-full bg-amber-500" />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>剩余 12 天</span>
                    <span>12/90</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">核心能力</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              面向 CDN SSL 场景，构建稳定、可观测、可自动化的证书运营体系。
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader className="flex-row items-start justify-between">
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <div className="rounded-2xl bg-foreground/5 p-2 text-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {feature.desc}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">工作流</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              从接入凭据到自动部署，只需三个步骤。
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.title}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-foreground/5 text-foreground" variant="muted">
                      {`0${index + 1}`}
                    </Badge>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-2 text-base">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {step.desc}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Card className="surface border border-foreground/10 bg-white/80">
          <CardContent className="grid gap-6 py-10 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <Badge className="bg-foreground/5 text-foreground" variant="muted">
                安全与合规
              </Badge>
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                用安全的方式管理证书与凭据
              </h2>
              <p className="text-sm text-muted-foreground">
                证书与密钥使用 AES-256-GCM 加密存储，敏感配置留在你的环境变量中，
                同时保留部署与续签行为的可追溯记录。
              </p>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="surface px-4 py-3">加密存储与传输隔离</div>
              <div className="surface px-4 py-3">可配置续签时间与策略</div>
              <div className="surface px-4 py-3">部署记录全链路留痕</div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl font-semibold tracking-tight">常见问题</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {faqs.map((item) => (
            <Card key={item.q}>
              <CardHeader>
                <CardTitle className="text-base">{item.q}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.a}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="surface flex flex-col items-start justify-between gap-6 rounded-3xl px-8 py-10 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              现在就开始构建稳定的 CDN SSL 体系
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              让证书续签和部署成为一种可控、可视化的流程。
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/register">免费开始</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
