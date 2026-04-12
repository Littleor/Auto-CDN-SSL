import {
  ArrowRight,
  Certificate,
  Cloud,
  ClockCountdown,
  Database,
  GlobeHemisphereWest,
  Lock,
  ShieldCheck,
  Sparkle,
  TrendUp
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { MagneticButton } from "@/components/MagneticButton";
import { LandingShowcase } from "@/components/marketing/LandingShowcase";
import { Button } from "@/components/ui/button";
import { usePageSeo } from "@/lib/seo";

const capabilityColumns = [
  {
    title: "把续签、验证、部署放进同一条流水线",
    description:
      "系统围绕 CDN SSL 运维场景设计，不需要把证书、部署和历史记录拆散到多个平台手动拼接。",
    points: ["腾讯云 CDN / 七牛云 CDN", "HTTP-01 / DNS-01", "续签与部署记录统一回看"],
    icon: GlobeHemisphereWest
  },
  {
    title: "把风险暴露在到期前，而不是事故发生后",
    description:
      "站点状态、到期窗口、HTTPS 启用状态和部署结果放在一张控制面板里，问题能更早出现。",
    points: ["到期时间与有效期进度", "CDN 侧 HTTPS 状态", "自动与手动触发来源区分"],
    icon: ClockCountdown
  }
];

const workflow = [
  {
    title: "连接 CDN 与 DNS 凭据",
    description:
      "接入腾讯云或七牛云凭据后，系统可以同步站点、复用 DNS 验证能力并保持后续部署链路可用。"
  },
  {
    title: "为顶级域名设定验证方式",
    description:
      "按 apex domain 统一配置 HTTP-01 或 DNS-01，后续新增站点时无需重复配置同一套挑战策略。"
  },
  {
    title: "在控制台里持续运行续签调度",
    description:
      "到期阈值、调度时间和自动部署策略都可以集中维护，历史记录保留每次动作的来源与结果。"
  }
];

const faqs = [
  {
    question: "这个系统更适合哪些场景？",
    answer:
      "更适合 CDN 站点较多、证书更新频繁、又希望把续签和部署动作放到同一个控制台里的团队。"
  },
  {
    question: "支持哪些平台和验证方式？",
    answer:
      "当前支持腾讯云 CDN、七牛云 CDN，以及 HTTP-01、DNS-01 两类验证路径，DNS-01 可复用腾讯云凭据。"
  },
  {
    question: "凭据和证书如何保护？",
    answer:
      "敏感数据在后端以 AES-256-GCM 加密保存，部署、续签与失败信息会留下记录，便于审计与排障。"
  }
];

export function LandingPage() {
  usePageSeo({
    title: "Auto CDN SSL | CDN SSL 证书自动续签与部署平台",
    description:
      "Auto CDN SSL 是面向 CDN 场景的 SSL 证书自动续签与部署平台，支持腾讯云与七牛云 CDN，覆盖续签调度、部署留痕、域名验证与凭据加密管理。",
    path: "/",
    keywords:
      "CDN SSL, SSL 证书续签, CDN 证书部署, 腾讯云 CDN, 七牛云 CDN, Let's Encrypt, DNS-01, HTTP-01",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Auto CDN SSL",
        url: "https://auto-cdn-ssl.littleor.cn/",
        inLanguage: "zh-CN",
        description:
          "面向 CDN 场景的 SSL 证书自动续签与部署平台，统一管理续签、部署、验证与历史记录。"
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Auto CDN SSL",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://auto-cdn-ssl.littleor.cn/",
        description:
          "统一管理 CDN SSL 证书续签、域名验证、凭据同步与自动部署的 Web 控制台。",
        featureList: [
          "腾讯云 CDN 与七牛云 CDN",
          "HTTP-01 与 DNS-01 验证",
          "续签与部署历史留痕",
          "凭据与证书加密存储"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      }
    ]
  });

  return (
    <div className="min-h-[100dvh]">
      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 sm:py-6">
        <header className="surface px-5 py-4 md:px-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <BrandMark />
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">登录控制台</Link>
              </Button>
              <MagneticButton>
                <Button size="sm" asChild>
                  <Link to="/register">
                    创建账号
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </MagneticButton>
            </div>
          </div>
        </header>

        <main className="space-y-6 pt-6">
          <section className="grid min-h-[calc(100dvh-7rem)] gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="surface p-7 md:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary">
                  CDN SSL Operations
                </div>
                <div className="rounded-full border border-border/80 bg-white/70 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Landing & SEO Refreshed
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <h1 className="max-w-4xl text-4xl font-semibold leading-none tracking-[-0.06em] text-foreground md:text-6xl">
                  为 CDN 证书运维准备一张真正能长期使用的控制台
                </h1>
                <p className="max-w-[65ch] text-base leading-8 text-muted-foreground md:text-lg">
                  Auto CDN SSL 把续签、验证、部署和历史留痕收进一套控制面里，
                  让腾讯云与七牛云 CDN 的 HTTPS 维护不再依赖手工巡检和临时脚本。
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <MagneticButton>
                  <Button asChild size="lg">
                    <Link to="/register">
                      进入新版控制台
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </MagneticButton>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">已有账号，直接登录</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="line-panel px-4 py-4">
                  <div className="section-label">Support</div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">双平台</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">腾讯云 CDN 与七牛云 CDN</div>
                </div>
                <div className="line-panel px-4 py-4">
                  <div className="section-label">Validation</div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">双验证</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">HTTP-01 与 DNS-01</div>
                </div>
                <div className="line-panel px-4 py-4">
                  <div className="section-label">Security</div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">加密存储</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">AES-256-GCM 保护敏感数据</div>
                </div>
                <div className="line-panel px-4 py-4">
                  <div className="section-label">History</div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">可追溯</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">续签与部署动作集中留痕</div>
                </div>
              </div>
            </div>

            <LandingShowcase />
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <div className="surface p-7 md:p-9">
              <div className="section-label">Why This Interface Works</div>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.05em] text-foreground md:text-5xl">
                少一点模板感，多一点真正为运维场景服务的信息组织
              </h2>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {capabilityColumns.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="line-panel p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/90 text-foreground shadow-[0_14px_30px_-22px_rgba(56,46,35,0.3)]">
                        <Icon className="h-5 w-5" weight="duotone" />
                      </div>
                      <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
                      <ul className="mt-5 space-y-2">
                        {item.points.map((point) => (
                          <li key={point} className="flex items-start gap-2 text-sm leading-7 text-foreground/88">
                            <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-primary" weight="fill" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6">
              <article className="surface p-7">
                <div className="flex items-center justify-between">
                  <div className="section-label">Built For Teams</div>
                  <TrendUp className="h-5 w-5 text-muted-foreground" weight="duotone" />
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                  对规模增长更友好，而不是把复杂度继续交给人
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  当站点、平台和环境逐渐变多时，证书运维的问题不是某一次续签，而是每个月都要重复确认同样的事情。
                  新版 Landing 把这一点讲清楚，也让搜索引擎更容易理解产品定位。
                </p>
              </article>

              <article className="surface p-7">
                <div className="flex items-center justify-between">
                  <div className="section-label">Core Guarantees</div>
                  <Lock className="h-5 w-5 text-muted-foreground" weight="duotone" />
                </div>
                <div className="mt-6 grid gap-4">
                  <div className="line-panel px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Certificate className="mt-1 h-5 w-5 text-foreground" weight="duotone" />
                      <div>
                        <div className="text-sm font-semibold tracking-tight text-foreground">
                          证书状态与到期窗口统一展示
                        </div>
                        <div className="mt-1 text-xs leading-5 text-muted-foreground">
                          管理员可以从单页里判断站点健康度，而不是来回切换平台。
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="line-panel px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Cloud className="mt-1 h-5 w-5 text-foreground" weight="duotone" />
                      <div>
                        <div className="text-sm font-semibold tracking-tight text-foreground">
                          凭据同步、站点同步与部署动作在同一系统内闭环
                        </div>
                        <div className="mt-1 text-xs leading-5 text-muted-foreground">
                          降低手工整理信息的成本，也方便排查是验证失败还是 CDN 下发失败。
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="line-panel px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Database className="mt-1 h-5 w-5 text-foreground" weight="duotone" />
                      <div>
                        <div className="text-sm font-semibold tracking-tight text-foreground">
                          SEO 元信息、结构化数据与公开页语义化结构一起补齐
                        </div>
                        <div className="mt-1 text-xs leading-5 text-muted-foreground">
                          首页更聚焦，抓取路径更清晰，权重也更集中到真正希望被索引的页面。
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className="surface p-7 md:p-9">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <div className="section-label">Workflow</div>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-foreground md:text-5xl">
                  从接入到自动续签，整个流程被重新梳理成更顺手的界面
                </h2>
              </div>
              <div className="grid gap-4">
                {workflow.map((item, index) => (
                  <article key={item.title} className="grid gap-4 rounded-[1.8rem] border border-white/75 bg-white/72 p-5 shadow-[0_24px_50px_-40px_rgba(56,46,35,0.28)] md:grid-cols-[auto_1fr]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
                      <span className="text-sm font-semibold tracking-tight">{`0${index + 1}`}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="surface p-7 md:p-9">
              <div className="section-label">FAQ</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-foreground md:text-5xl">
                公开页文案也一起朝“可读、可索引、可转化”方向收紧
              </h2>
            </div>
            <div className="grid gap-4">
              {faqs.map((item) => (
                <article key={item.question} className="surface p-6">
                  <div className="flex items-start gap-3">
                    <Sparkle className="mt-1 h-5 w-5 text-primary" weight="fill" />
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">
                        {item.question}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="surface p-7 md:p-9">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="section-label">Ready To Operate</div>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-foreground md:text-5xl">
                  如果你想让 SSL 运维从“手工记忆”变成“长期系统”，这一版界面已经更像一个正式产品了
                </h2>
                <p className="mt-4 max-w-[64ch] text-sm leading-7 text-muted-foreground md:text-base">
                  Landing 页的品牌表达、SEO 结构和控制台视觉已经统一起来，
                  从用户第一次访问到进入系统管理，都能保持同一套信息节奏。
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <MagneticButton>
                  <Button size="lg" asChild>
                    <Link to="/register">
                      立即创建账号
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </MagneticButton>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">进入控制台</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
