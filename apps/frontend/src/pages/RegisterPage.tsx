import { ArrowRight, CheckCircle, Cloud, Database, ShieldCheck } from "@phosphor-icons/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { usePageSeo } from "@/lib/seo";

const introRows = [
  {
    title: "证书与验证集中管理",
    description: "域名挑战方式可以按顶级域名统一配置。",
    icon: ShieldCheck
  },
  {
    title: "CDN 凭据与站点同步",
    description: "腾讯云和七牛云平台会放在同一工作流里。",
    icon: Cloud
  },
  {
    title: "SEO 与后台视觉统一",
    description: "首页抓取体验和进入后台后的体验保持一致。",
    icon: Database
  }
];

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  usePageSeo({
    title: "创建账号 | Auto CDN SSL",
    description: "注册 Auto CDN SSL 账号，开始管理 CDN SSL 证书续签、域名验证与自动部署。",
    path: "/register",
    robots: "noindex,nofollow"
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const message = await register(name, email, password);
      setSuccess(message || "验证邮件已发送，请前往邮箱完成验证。");
    } catch (err: any) {
      setError(err.message || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh]">
      <div className="mx-auto max-w-[1360px] px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid min-h-[calc(100dvh-3rem)] gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="surface flex items-center p-5 md:p-6 lg:order-2">
            <div className="mx-auto w-full max-w-xl">
              <h2 className="text-[1.9rem] font-semibold tracking-[-0.05em] text-foreground md:text-[2.5rem]">
                创建开发者账号
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                注册后即可进入新的系统管理界面。
              </p>

              <div className="mt-8">
                {success ? (
                  <div className="space-y-5">
                    <div className="rounded-[1.5rem] border border-emerald-600/12 bg-emerald-600/8 px-5 py-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="mt-1 h-5 w-5 text-emerald-700" weight="fill" />
                        <div>
                          <div className="text-sm font-semibold tracking-tight text-emerald-800">
                            注册成功
                          </div>
                          <div className="mt-1 text-sm leading-7 text-emerald-800/88">{success}</div>
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => navigate("/login")}>
                      去登录
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">昵称</label>
                      <Input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="例如：运维工作台"
                        required
                      />
                      <p className="text-xs text-muted-foreground">昵称仅用于控制台内展示。</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">邮箱</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="dev@example.com"
                        required
                      />
                      <p className="text-xs text-muted-foreground">验证邮件会发送到这个地址。</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">密码</label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="至少 8 位"
                        required
                      />
                      <p className="text-xs text-muted-foreground">注册完成后即可登录控制台。</p>
                    </div>
                    {error && (
                      <div className="rounded-[1.3rem] border border-destructive/15 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                        {error}
                      </div>
                    )}
                    <Button type="submit" disabled={loading}>
                      {loading ? "正在创建..." : "创建账号并发送验证邮件"}
                      {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </section>

          <section className="surface flex flex-col justify-between p-7 md:p-8 lg:order-1">
            <div>
              <BrandMark />
              <div className="mt-10 max-w-3xl">
                <h1 className="max-w-2xl text-[2.2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-foreground md:text-[3.4rem]">
                  从一开始就用更简洁的后台维护 CDN 证书
                </h1>
                <p className="mt-4 max-w-[58ch] text-sm leading-8 text-muted-foreground md:text-[15px]">
                  注册后即可在同一套后台里接入站点、配置验证、管理凭据并查看续签与部署记录。
                </p>
              </div>

              <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-border/65 bg-white/56">
                <div className="divide-y divide-border/60">
                  {introRows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <div key={row.title} className="flex gap-3 px-5 py-4">
                        <Icon className="mt-1 h-4 w-4 text-primary" weight="duotone" />
                        <div>
                          <div className="text-sm font-medium tracking-tight text-foreground">
                            {row.title}
                          </div>
                          <div className="mt-1 text-xs leading-5 text-muted-foreground">
                            {row.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <Link to="/" className="transition-colors hover:text-foreground">
                返回官网
              </Link>
              <span className="text-border">/</span>
              <Link to="/login" className="transition-colors hover:text-foreground">
                已有账号，去登录
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
