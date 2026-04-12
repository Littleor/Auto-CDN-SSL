import {
  ArrowRight,
  Certificate,
  Cloud,
  ClockCountdown,
  Database,
  GlobeHemisphereWest,
  Lock,
  ShieldCheck
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { usePageSeo } from "@/lib/seo";

const metrics = [
  { label: "支持平台", value: "腾讯云 CDN / 七牛云 CDN" },
  { label: "验证方式", value: "HTTP-01 / DNS-01" },
  { label: "安全能力", value: "AES-256-GCM 加密存储" },
  { label: "可视化", value: "续签、部署、历史统一回看" }
];

const capabilityRows = [
  {
    title: "把证书、验证、部署放进一条连续工作流",
    description:
      "接入平台凭据、设置域名验证、自动续签和自动部署都放在同一个系统里，不再依赖零散脚本和临时手工流程。",
    icon: GlobeHemisphereWest
  },
  {
    title: "把到期风险提前暴露出来，而不是靠记忆管理",
    description:
      "你能在一个视图里看到证书到期窗口、CDN HTTPS 状态、最近动作和失败原因，问题会更早被发现。",
    icon: ClockCountdown
  },
  {
    title: "把凭据和证书放进更可控的后台",
    description:
      "敏感数据加密存储，后台保留续签和部署记录，方便团队在日常维护和排障时保持统一上下文。",
    icon: Lock
  }
];

const faqItems = [
  {
    question: "适合什么样的团队？",
    answer:
      "更适合同时维护多个 CDN 域名、需要稳定续签流程，又不想把证书管理分散到多个平台和脚本里的团队。"
  },
  {
    question: "支持哪些平台和验证方式？",
    answer:
      "当前支持腾讯云 CDN、七牛云 CDN，以及 HTTP-01、DNS-01 两类验证路径，DNS-01 可以复用腾讯云凭据。"
  },
  {
    question: "这次改版除了视觉还有什么变化？",
    answer:
      "Landing、登录注册、后台骨架和 SEO 元信息都统一到了同一套系统里，后续继续调整风格也能从全局设计令牌入手。"
  }
];

const previewRows = [
  {
    domain: "media.example.com",
    expiry: "27 天",
    status: "稳定"
  },
  {
    domain: "static.example.com",
    expiry: "11 天",
    status: "关注"
  },
  {
    domain: "img.example.com",
    expiry: "44 天",
    status: "稳定"
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
          "统一管理 CDN SSL 证书续签、域名验证、凭据同步与自动部署的 Web 控制台。"
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
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
        <header className="surface px-5 py-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <BrandMark />
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">登录控制台</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">
                  创建账号
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="space-y-8 pt-8 md:space-y-10">
          <section className="grid min-h-[calc(100dvh-8rem)] gap-6 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-white/75 bg-white/72 px-3 py-1 text-[0.7rem] font-medium tracking-[0.16em] text-muted-foreground">
                CDN SSL Control
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.06em] text-foreground md:text-[4.6rem]">
                  自动管理 CDN SSL，而不是反复人工确认
                </h1>
                <p className="max-w-[58ch] text-base leading-8 text-muted-foreground md:text-[17px]">
                  Auto CDN SSL 把续签、验证、部署和历史记录集中到一套简洁的后台里，
                  让腾讯云与七牛云 CDN 的 HTTPS 运维变得更连续，也更容易长期维护。
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link to="/register">
                    开始使用
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">已有账号，直接登录</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="rounded-full border border-white/75 bg-white/60 px-3 py-1.5">支持腾讯云 CDN</span>
                <span className="rounded-full border border-white/75 bg-white/60 px-3 py-1.5">支持七牛云 CDN</span>
                <span className="rounded-full border border-white/75 bg-white/60 px-3 py-1.5">支持 HTTP-01 / DNS-01</span>
              </div>
            </div>

            <div className="surface p-4 md:p-5">
              <div className="rounded-[1.6rem] border border-white/70 bg-white/72 p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="section-label">System Preview</div>
                    <div className="mt-1 text-base font-semibold tracking-[-0.03em] text-foreground">
                      证书与部署概览
                    </div>
                  </div>
                  <div className="rounded-full border border-primary/12 bg-primary/10 px-3 py-1 text-[0.7rem] font-medium text-primary">
                    Auto Renew
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[1.4rem] border border-border/65 bg-white/78 p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>即将到期站点</span>
                      <span>3 个需要关注</span>
                    </div>
                    <div className="mt-4 divide-y divide-border/60">
                      {previewRows.map((row) => (
                        <div key={row.domain} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                          <div>
                            <div className="text-sm font-medium tracking-tight text-foreground">
                              {row.domain}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              证书剩余 {row.expiry}
                            </div>
                          </div>
                          <div className="rounded-full border border-white/75 bg-white/72 px-2.5 py-1 text-[0.68rem] text-muted-foreground">
                            {row.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.4rem] border border-border/65 bg-white/78 p-4">
                      <div className="section-label">Deployment</div>
                      <div className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-foreground">
                        14
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        最近 7 天的续签与部署动作
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-border/65 bg-white/78 p-4">
                      <div className="section-label">Validation</div>
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="h-4 w-4 text-primary" weight="fill" />
                          <span className="text-sm text-foreground">按顶级域名统一配置挑战方式</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Database className="h-4 w-4 text-primary" weight="duotone" />
                          <span className="text-sm text-foreground">DNS-01 可复用腾讯云凭据</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Cloud className="h-4 w-4 text-primary" weight="duotone" />
                          <span className="text-sm text-foreground">续签完成后继续自动部署</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="surface overflow-hidden p-0">
            <div className="grid divide-y divide-border/60 md:grid-cols-2 md:divide-y-0 xl:grid-cols-4 xl:divide-x">
              {metrics.map((item) => (
                <div key={item.label} className="px-5 py-4 md:px-6">
                  <div className="section-label">{item.label}</div>
                  <div className="mt-2 text-sm font-medium tracking-tight text-foreground">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="space-y-4">
              <div className="section-label">Why It Feels Better</div>
              <h2 className="max-w-2xl text-[2rem] font-semibold leading-[1.08] tracking-[-0.055em] text-foreground md:text-[3rem]">
                用更少的视觉动作，承载更清晰的产品信息
              </h2>
              <p className="max-w-[56ch] text-sm leading-8 text-muted-foreground md:text-[15px]">
                这次不是继续叠营销块，而是把首页收成更克制的产品页结构。信息顺序更直接，视觉噪音更少，也更符合 Apple 风格那种轻、透、整洁的系统感。
              </p>
            </div>

            <div className="surface overflow-hidden p-0">
              <div className="divide-y divide-border/60">
                {capabilityRows.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="flex gap-4 px-5 py-5 md:px-6">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/75 bg-white/76">
                        <Icon className="h-5 w-5 text-primary" weight="duotone" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold tracking-[-0.03em] text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr] lg:items-start">
            <div className="surface p-5 md:p-6">
              <div className="section-label">System Management</div>
              <div className="mt-4 rounded-[1.6rem] border border-border/65 bg-white/76 p-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <div className="text-sm font-medium tracking-tight text-foreground">
                      系统管理界面
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      更像长期使用的工具，而不是临时拼装的后台
                    </div>
                  </div>
                  <Certificate className="h-5 w-5 text-primary" weight="duotone" />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="rounded-[1.3rem] border border-border/65 bg-white/74 p-3">
                    <div className="space-y-2">
                      <div className="rounded-[1rem] bg-primary/10 px-3 py-2 text-sm text-primary">
                        概览
                      </div>
                      <div className="rounded-[1rem] px-3 py-2 text-sm text-muted-foreground">
                        CDN 站点
                      </div>
                      <div className="rounded-[1rem] px-3 py-2 text-sm text-muted-foreground">
                        续签设置
                      </div>
                      <div className="rounded-[1rem] px-3 py-2 text-sm text-muted-foreground">
                        历史记录
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.3rem] border border-border/65 bg-white/74 p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="line-panel px-4 py-4">
                        <div className="section-label">Sites</div>
                        <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">32</div>
                      </div>
                      <div className="line-panel px-4 py-4">
                        <div className="section-label">Expiring</div>
                        <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">5</div>
                      </div>
                      <div className="line-panel px-4 py-4">
                        <div className="section-label">Providers</div>
                        <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">4</div>
                      </div>
                    </div>
                    <div className="mt-4 divide-y divide-border/60 rounded-[1.3rem] border border-border/65 bg-white/72 px-4">
                      <div className="flex items-center justify-between py-3">
                        <span className="text-sm text-foreground">cdn.example.com</span>
                        <span className="text-xs text-muted-foreground">剩余 27 天</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-sm text-foreground">img.example.com</span>
                        <span className="text-xs text-muted-foreground">剩余 44 天</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-sm text-foreground">static.example.com</span>
                        <span className="text-xs text-muted-foreground">剩余 11 天</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="section-label">Three Core Panels</div>
              <div className="space-y-4">
                <div className="line-panel px-5 py-5">
                  <div className="flex items-start gap-3">
                    <ClockCountdown className="mt-1 h-5 w-5 text-primary" weight="duotone" />
                    <div>
                      <div className="text-base font-semibold tracking-[-0.03em] text-foreground">
                        概览页优先告诉你哪里有风险
                      </div>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        到期窗口、最近动作和风险数量被提到最前面，不再被装饰性的统计块稀释。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="line-panel px-5 py-5">
                  <div className="flex items-start gap-3">
                    <Cloud className="mt-1 h-5 w-5 text-primary" weight="duotone" />
                    <div>
                      <div className="text-base font-semibold tracking-[-0.03em] text-foreground">
                        凭据、站点、部署保持统一语义
                      </div>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        不是每一页都换一种风格，而是尽量依赖同一套设计令牌和同一类容器。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="line-panel px-5 py-5">
                  <div className="flex items-start gap-3">
                    <Database className="mt-1 h-5 w-5 text-primary" weight="duotone" />
                    <div>
                      <div className="text-base font-semibold tracking-[-0.03em] text-foreground">
                        SEO 和视觉风格都可从全局继续调整
                      </div>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        配色、字体、表面材质和按钮语义都回到了全局样式层，不需要再一页页单独修。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="surface overflow-hidden p-0">
            <div className="divide-y divide-border/60">
              {faqItems.map((item) => (
                <article key={item.question} className="px-5 py-5 md:px-6">
                  <h3 className="text-base font-semibold tracking-[-0.03em] text-foreground">
                    {item.question}
                  </h3>
                  <p className="mt-2 max-w-[72ch] text-sm leading-7 text-muted-foreground">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="surface px-5 py-6 md:px-6 md:py-7">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="section-label">Ready To Continue</div>
                <h2 className="mt-2 max-w-3xl text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.05em] text-foreground md:text-[2.8rem]">
                  这一版先把方向拉回到简洁、克制、可长期维护
                </h2>
                <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted-foreground">
                  公开页、登录注册和系统管理骨架都已经回到同一套极简系统里，后续继续微调会容易得多。
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Button size="lg" asChild>
                  <Link to="/register">
                    创建账号
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
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
