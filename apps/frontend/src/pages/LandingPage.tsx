import {
  ArrowRight,
  Certificate,
  ClockCountdown,
  GlobeHemisphereWest,
  Lock,
  ShieldCheck
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { LandingShowcase } from "@/components/marketing/LandingShowcase";
import { Button } from "@/components/ui/button";
import { usePageSeo } from "@/lib/seo";

const metrics = [
  { label: "支持平台", value: "腾讯云 CDN / 七牛云 CDN" },
  { label: "验证方式", value: "HTTP-01 / DNS-01" },
  { label: "自动化", value: "续签、部署、历史统一回看" },
  { label: "安全能力", value: "AES-256-GCM 加密存储" }
];

const features = [
  {
    title: "统一管理 CDN SSL 生命周期",
    description:
      "把站点、证书状态、验证方式、部署动作和历史记录放进同一个系统，不再依赖多处平台和临时脚本拼接流程。",
    icon: GlobeHemisphereWest
  },
  {
    title: "自动续签后继续自动部署",
    description:
      "证书到期前触发续签，续签成功后继续下发到 CDN 平台，减少人工介入和漏操作的风险。",
    icon: Certificate
  },
  {
    title: "优先暴露真正需要关注的风险",
    description:
      "后台会把临近到期站点、最近动作和失败原因提到前面，方便团队先处理对线上影响最大的事项。",
    icon: ClockCountdown
  },
  {
    title: "让凭据和证书处于更可控的环境",
    description:
      "敏感数据加密保存，验证和部署动作保留记录，团队在维护和排障时能共享同一上下文。",
    icon: Lock
  }
];

const scenarios = [
  {
    title: "多个 CDN 域名需要持续续签",
    description:
      "适合同时维护多条 CDN 域名、又不想手工检查每一张证书的团队。"
  },
  {
    title: "证书续签和部署分散在不同系统",
    description:
      "把站点、凭据、验证、部署和历史收进一个控制台，减少信息切换。"
  },
  {
    title: "需要保留可回溯的执行记录",
    description:
      "续签和部署动作统一记录，方便排查失败原因和确认触发来源。"
  }
];

const workflow = [
  {
    title: "接入 CDN 与 DNS 凭据",
    description:
      "接入腾讯云或七牛云凭据后，系统可以同步站点，并为 DNS-01 准备复用能力。"
  },
  {
    title: "按顶级域名配置验证策略",
    description:
      "对 apex domain 统一设置 HTTP-01 或 DNS-01，新增站点时不需要重复配置同一套挑战逻辑。"
  },
  {
    title: "在后台持续运行续签与部署",
    description:
      "当站点接近到期窗口时，系统自动触发续签，并根据策略继续部署到 CDN 平台。"
  }
];

const faqItems = [
  {
    question: "适合什么样的团队？",
    answer:
      "更适合维护多个 CDN 域名、希望把续签和部署动作放进同一个控制台里的团队。"
  },
  {
    question: "支持哪些平台和验证方式？",
    answer:
      "当前支持腾讯云 CDN、七牛云 CDN，以及 HTTP-01、DNS-01 两类验证方式，DNS-01 可复用腾讯云凭据。"
  },
  {
    question: "系统能解决什么核心问题？",
    answer:
      "核心是把证书续签、部署、历史记录和风险识别统一起来，减少人工巡检和遗漏。"
  }
];

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.55, ease: "easeOut" }
} as const;

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
          "自动续签与自动部署",
          "续签与部署历史记录"
        ]
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
          <section className="grid gap-8 py-6 lg:min-h-[72dvh] lg:grid-cols-[minmax(520px,1.08fr)_minmax(0,0.92fr)] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-[720px] space-y-6"
            >
              <div className="inline-flex items-center rounded-full border border-white/75 bg-white/72 px-3 py-1 text-[0.7rem] font-medium tracking-[0.16em] text-muted-foreground">
                CDN SSL Platform
              </div>
              <div className="space-y-4">
                <h1 className="max-w-[14ch] text-[2.7rem] font-semibold leading-[0.98] tracking-[-0.065em] text-foreground md:text-[4.4rem]">
                  统一续签、验证和部署你的 CDN SSL
                </h1>
                <p className="max-w-[64ch] text-base leading-8 text-muted-foreground md:text-[17px]">
                  Auto CDN SSL 面向 CDN 场景设计，把证书续签、域名验证、部署动作和历史记录集中到一套后台里，
                  让 HTTPS 运维从人工巡检转成可持续运行的系统流程。
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
                  <Link to="/login">进入控制台</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="rounded-full border border-white/75 bg-white/60 px-3 py-1.5">支持腾讯云 CDN</span>
                <span className="rounded-full border border-white/75 bg-white/60 px-3 py-1.5">支持七牛云 CDN</span>
                <span className="rounded-full border border-white/75 bg-white/60 px-3 py-1.5">支持 HTTP-01 / DNS-01</span>
              </div>
            </motion.div>

            <LandingShowcase />
          </section>

          <motion.section {...reveal} className="surface overflow-hidden p-0">
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
          </motion.section>

          <motion.section {...reveal} className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="space-y-4">
              <div className="section-label">核心能力</div>
              <h2 className="max-w-2xl text-[2rem] font-semibold leading-[1.08] tracking-[-0.055em] text-foreground md:text-[3rem]">
                为 CDN SSL 运维准备一套真正能长期使用的后台
              </h2>
              <p className="max-w-[58ch] text-sm leading-8 text-muted-foreground md:text-[15px]">
                这套系统把日常证书维护里最耗时、最容易遗漏的部分收进稳定流程，减少人工确认和平台切换。
              </p>
            </div>

            <div className="surface overflow-hidden p-0">
              <div className="divide-y divide-border/60">
                {features.map((item) => {
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
          </motion.section>

          <motion.section {...reveal} className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="surface p-5 md:p-6">
              <div className="section-label">适用场景</div>
              <div className="mt-4 space-y-4">
                {scenarios.map((item) => (
                  <div key={item.title} className="line-panel px-5 py-5">
                    <h3 className="text-base font-semibold tracking-[-0.03em] text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface p-5 md:p-6">
              <div className="section-label">工作流程</div>
              <div className="mt-4 divide-y divide-border/60 rounded-[1.6rem] border border-border/65 bg-white/70">
                {workflow.map((item, index) => (
                  <div key={item.title} className="grid gap-3 px-5 py-5 md:grid-cols-[auto_1fr]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/75 bg-white/80 text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold tracking-[-0.03em] text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section {...reveal} className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr] lg:items-start">
            <div className="surface p-5 md:p-6">
              <div className="section-label">为什么团队会继续使用</div>
              <h2 className="mt-3 max-w-2xl text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.05em] text-foreground md:text-[2.8rem]">
                当域名和环境越来越多时，证书维护需要的是系统，不是记忆
              </h2>
              <p className="mt-4 max-w-[60ch] text-sm leading-8 text-muted-foreground md:text-[15px]">
                平台凭据、验证策略、续签动作和部署结果都汇总在一套工作台里，团队不需要反复切换平台确认每一个环节。
              </p>
            </div>

            <div className="space-y-4">
              <div className="line-panel px-5 py-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 text-primary" weight="duotone" />
                  <div>
                    <div className="text-base font-semibold tracking-[-0.03em] text-foreground">
                      统一的验证与部署上下文
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      不同平台、不同验证方式和不同站点状态可以在一个系统里连续查看和处理。
                    </p>
                  </div>
                </div>
              </div>
              <div className="line-panel px-5 py-5">
                <div className="flex items-start gap-3">
                  <ClockCountdown className="mt-1 h-5 w-5 text-primary" weight="duotone" />
                  <div>
                    <div className="text-base font-semibold tracking-[-0.03em] text-foreground">
                      风险优先级更清楚
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      临近到期站点、最近动作和失败原因会优先出现在后台前排，降低遗漏风险。
                    </p>
                  </div>
                </div>
              </div>
              <div className="line-panel px-5 py-5">
                <div className="flex items-start gap-3">
                  <Lock className="mt-1 h-5 w-5 text-primary" weight="duotone" />
                  <div>
                    <div className="text-base font-semibold tracking-[-0.03em] text-foreground">
                      凭据和证书更容易控管
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      敏感数据加密保存，历史动作统一留痕，方便团队协作和问题回溯。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section {...reveal} className="surface overflow-hidden p-0">
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
          </motion.section>

          <motion.section {...reveal} className="surface px-5 py-6 md:px-6 md:py-7">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="section-label">开始使用</div>
                <h2 className="mt-2 max-w-3xl text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.05em] text-foreground md:text-[2.8rem]">
                  把 CDN SSL 续签、验证和部署收进一套更稳定的工作流
                </h2>
                <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted-foreground">
                  如果你正在维护多个 CDN 域名，这套系统会比反复人工确认更稳，也更适合长期使用。
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
          </motion.section>
        </main>
      </div>
    </div>
  );
}
