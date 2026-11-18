import { useMemo, useState, type ComponentType } from "react";
import { ArrowRight, Plus } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/AppShell";
import { BrandMark } from "@/components/BrandMark";
import { Eyebrow } from "@/components/PageHeader";
import {
  ChallengePreview,
  DeployPreview,
  HistoryPreview,
  RenewPreview,
  SyncPreview,
  VaultPreview
} from "@/components/marketing/FeaturePreviews";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { useAuth } from "@/contexts/AuthContext";
import { usePageSeo } from "@/lib/seo";

type Tag = "renew" | "deploy" | "verify" | "ops";

const tagLabels: Record<Tag, string> = {
  renew: "自动续签",
  deploy: "CDN 部署",
  verify: "域名验证",
  ops: "运维与安全"
};

const features: { title: string; description: string; tags: Tag[]; Preview: ComponentType }[] = [
  {
    title: "到期前自动续签",
    description: "每天定时扫描，剩余天数低于阈值就自动向 Let's Encrypt 申请新证书。",
    tags: ["renew"],
    Preview: RenewPreview
  },
  {
    title: "续签后直接部署到 CDN",
    description: "新证书签发后立即下发到腾讯云或七牛云，不需要再登录控制台手动上传。",
    tags: ["deploy", "renew"],
    Preview: DeployPreview
  },
  {
    title: "HTTP-01 与 DNS-01",
    description: "按顶级域名统一选择验证方式，DNS-01 可直接复用腾讯云凭据写入 TXT 记录。",
    tags: ["verify"],
    Preview: ChallengePreview
  },
  {
    title: "一键同步加速域名",
    description: "接入 CDN 凭据后同步账号下的全部域名，证书状态与 HTTPS 配置一并带回。",
    tags: ["deploy", "ops"],
    Preview: SyncPreview
  },
  {
    title: "每次执行都有记录",
    description: "续签与部署按时间留痕，区分自动与手动触发，失败原因一键复制。",
    tags: ["ops"],
    Preview: HistoryPreview
  },
  {
    title: "凭据加密存储",
    description: "API 密钥与证书私钥使用 AES-256-GCM 加密落库，只在执行时解密。",
    tags: ["ops"],
    Preview: VaultPreview
  }
];

const workflow = [
  { title: "接入 CDN 凭据", description: "填写腾讯云或七牛云 API 密钥，一键同步全部加速域名。" },
  { title: "配置域名验证", description: "按顶级域名选择 HTTP-01 或 DNS-01，子域名自动沿用。" },
  { title: "交给调度器", description: "到期前自动续签并部署，你只需要偶尔看一眼概览。" }
];

const faqItems = [
  {
    question: "适合什么样的团队？",
    answer: "更适合维护多个 CDN 域名、希望把续签和部署动作放进同一个控制台里的团队。"
  },
  {
    question: "支持哪些平台和验证方式？",
    answer: "当前支持腾讯云 CDN、七牛云 CDN，以及 HTTP-01、DNS-01 两类验证方式，DNS-01 可复用腾讯云凭据。"
  },
  {
    question: "系统能解决什么核心问题？",
    answer: "核心是把证书续签、部署、历史记录和风险识别统一起来，减少人工巡检和遗漏。"
  }
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5, ease: "easeOut" }
} as const;

export function LandingPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [domain, setDomain] = useState("");
  const [tag, setTag] = useState<Tag | "all">("all");

  usePageSeo({
    title: "Auto CDN SSL | CDN SSL 证书自动续签与部署平台",
    description:
      "Auto CDN SSL 是面向 CDN 场景的 SSL 证书自动续签与部署平台，支持腾讯云与七牛云 CDN，覆盖续签调度、部署留痕、域名验证与凭据加密管理。",
    path: "/",
    keywords: "CDN SSL, SSL 证书续签, CDN 证书部署, 腾讯云 CDN, 七牛云 CDN, Let's Encrypt, DNS-01, HTTP-01",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Auto CDN SSL",
        url: "https://auto-cdn-ssl.littleor.cn/",
        inLanguage: "zh-CN",
        description: "面向 CDN 场景的 SSL 证书自动续签与部署平台，统一管理续签、部署、验证与历史记录。"
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Auto CDN SSL",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://auto-cdn-ssl.littleor.cn/",
        description: "统一管理 CDN SSL 证书续签、域名验证、凭据同步与自动部署的 Web 控制台。",
        featureList: ["腾讯云 CDN 与七牛云 CDN", "HTTP-01 与 DNS-01 验证", "自动续签与自动部署", "续签与部署历史记录"]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer }
        }))
      }
    ]
  });

  const visible = useMemo(() => features.filter((item) => tag === "all" || item.tags.includes(tag)), [tag]);
  const consoleTarget = accessToken ? "/app/dashboard" : "/login";

  const start = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(accessToken ? "/app/sites?new=1" : "/register");
  };

  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 md:px-6">
          <Link to="/" className="shrink-0" aria-label="Auto CDN SSL 首页">
            <BrandMark />
          </Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {[
              ["#features", "功能"],
              ["#workflow", "流程"],
              ["#faq", "常见问题"]
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-foreground/75 transition-colors hover:bg-secondary hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex-1" />
          <ThemeToggle />
          {accessToken ? (
            <Button asChild>
              <Link to="/app/dashboard">进入控制台</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/login">登录</Link>
              </Button>
              <Button asChild>
                <Link to="/register">注册</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 md:px-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center pb-12 pt-12 text-center md:pb-16 md:pt-20"
        >
          <Eyebrow>支持腾讯云 CDN 与七牛云 CDN</Eyebrow>
          <h1 className="mt-5 text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] md:text-[3rem]">
            让 CDN 证书，自己续签。
          </h1>
          <p className="mt-6 max-w-[40ch] text-sm leading-6 text-muted-foreground md:leading-8">
            Let's Encrypt 证书的<span className="text-foreground">签发、验证与部署</span>，
            <br className="hidden sm:block" />
            交给一个安静运行的<span className="text-foreground">自动化控制台</span>。
          </p>
          <form onSubmit={start} className="relative mt-7 w-full max-w-[600px]">
            <input
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="输入你的 CDN 域名，例如 static.example.com"
              aria-label="CDN 域名"
              className="h-11 w-full rounded-full bg-secondary pl-5 pr-12 text-sm text-foreground transition-colors placeholder:text-muted-foreground hover:bg-accent/70 focus:bg-accent/70 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
              aria-label="开始使用"
            >
              <ArrowRight className="h-4 w-4" weight="bold" />
            </button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">Let's Encrypt · HTTP-01 / DNS-01 · 密钥加密存储</p>
        </motion.section>

        <section id="features" className="scroll-mt-24">
          <div className="sticky top-14 z-30 -mx-4 flex items-center gap-3 bg-background/85 px-4 py-3 backdrop-blur-xl md:-mx-6 md:px-6">
            <div className="no-scrollbar fade-x flex min-w-0 flex-1 gap-2 overflow-x-auto pr-8">
              <Chip active={tag === "all"} onClick={() => setTag("all")}>
                全部
              </Chip>
              {(Object.keys(tagLabels) as Tag[]).map((key) => (
                <Chip key={key} active={tag === key} onClick={() => setTag(key)}>
                  {tagLabels[key]}
                </Chip>
              ))}
            </div>
            <span className="hidden shrink-0 text-sm tabular-nums text-muted-foreground sm:block">{visible.length} 项能力</span>
          </div>

          <motion.div layout className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-4 gap-y-7 pt-4">
            {visible.map(({ title, description, Preview }) => (
              <motion.article key={title} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-black/[0.04] dark:border-white/[0.05]">
                  <Preview />
                </div>
                <h3 className="mt-3 px-1 text-[15px] font-semibold tracking-[-0.01em]">{title}</h3>
                <p className="mt-1 px-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <motion.section {...reveal} id="workflow" className="scroll-mt-24 pt-20">
          <div className="text-center">
            <h2 className="text-[1.5rem] font-semibold leading-tight tracking-[-0.03em] md:text-[2rem]">三步接入，之后就不用管了</h2>
            <p className="mx-auto mt-3 max-w-[44ch] text-sm text-muted-foreground md:text-sm">接入一次，之后续签与部署都在后台自动完成。</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {workflow.map((item, index) => (
              <div key={item.title} className="rounded-2xl bg-secondary p-5">
                <div className="text-[36px] font-semibold leading-none tracking-[-0.05em] text-foreground/15">0{index + 1}</div>
                <h3 className="mt-6 text-base font-semibold tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section {...reveal} id="faq" className="mx-auto max-w-[880px] scroll-mt-24 pt-20">
          <h2 className="text-center text-[1.5rem] font-semibold tracking-[-0.03em] md:text-[2rem]">常见问题</h2>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {faqItems.map((item) => (
              <details key={item.question} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary transition-transform duration-200 group-open:rotate-45">
                    <Plus className="h-4 w-4" weight="bold" />
                  </span>
                </summary>
                <p className="max-w-[64ch] pb-6 text-sm leading-7 text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </motion.section>

        <motion.section
          {...reveal}
          className="mt-20 flex flex-col items-center rounded-3xl bg-primary px-6 py-20 text-center text-primary-foreground md:py-24"
        >
          <h2 className="max-w-[18ch] text-[1.5rem] font-semibold leading-tight tracking-[-0.03em] md:text-[2.25rem]">
            下一次证书到期，你可能都不会注意到。
          </h2>
          <p className="mt-4 max-w-[42ch] text-sm opacity-60 md:text-sm">把续签、验证与部署交给 Auto CDN SSL。</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Link to={accessToken ? "/app/dashboard" : "/register"}>
                {accessToken ? "进入控制台" : "开始使用"}
                <ArrowRight className="h-4 w-4" weight="bold" />
              </Link>
            </Button>
            {!accessToken && (
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to={consoleTarget}>登录</Link>
              </Button>
            )}
          </div>
        </motion.section>
      </main>

      <footer className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row md:px-6">
        <BrandMark />
        <span>© {new Date().getFullYear()} Auto CDN SSL · CDN SSL 证书自动续签与部署</span>
      </footer>
    </div>
  );
}
