import { ArrowRight, ClockCountdown, ShieldCheck } from "@phosphor-icons/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { usePageSeo } from "@/lib/seo";

const introRows = [
  "证书状态、部署记录与凭据管理统一放在一个工作台中。",
  "登录后会直接回到新的系统管理界面。",
  "整体风格已经切到更克制的极简系统层。"
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  usePageSeo({
    title: "登录控制台 | Auto CDN SSL",
    description: "登录 Auto CDN SSL 控制台，管理 CDN SSL 证书续签、部署和域名验证。",
    path: "/login",
    robots: "noindex,nofollow"
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/app/dashboard");
    } catch (err: any) {
      setError(err.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh]">
      <div className="mx-auto max-w-[1360px] px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid min-h-[calc(100dvh-3rem)] gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="surface flex flex-col justify-between p-7 md:p-8">
            <div>
              <BrandMark />
              <div className="mt-10 max-w-3xl">
                <div className="section-label">Console Access</div>
                <h1 className="mt-3 max-w-2xl text-[2.2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-foreground md:text-[3.4rem]">
                  登录后继续处理你的 CDN 证书工作流
                </h1>
                <p className="mt-4 max-w-[58ch] text-sm leading-8 text-muted-foreground md:text-[15px]">
                  后台已经改成更简洁的大面留白和细边框系统，登录后会直接进入新的管理骨架。
                </p>
              </div>

              <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-border/65 bg-white/56">
                <div className="divide-y divide-border/60">
                  {introRows.map((row) => (
                    <div key={row} className="flex items-center gap-3 px-5 py-4">
                      <ShieldCheck className="h-4 w-4 text-primary" weight="fill" />
                      <span className="text-sm leading-7 text-foreground">{row}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <Link to="/" className="transition-colors hover:text-foreground">
                返回官网
              </Link>
              <span className="text-border">/</span>
              <Link to="/register" className="transition-colors hover:text-foreground">
                创建账号
              </Link>
            </div>
          </section>

          <section className="surface flex items-center p-5 md:p-6">
            <div className="mx-auto w-full max-w-xl">
              <div className="section-label">Sign In</div>
              <h2 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-foreground md:text-[2.5rem]">
                登录控制台
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                继续管理站点、凭据、域名验证和部署动作。
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">邮箱</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="dev@example.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground">使用已验证的管理邮箱登录。</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">密码</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="请输入账号密码"
                    required
                  />
                  <p className="text-xs text-muted-foreground">登录成功后会自动跳转到新版概览页。</p>
                </div>
                {error && (
                  <div className="rounded-[1.3rem] border border-destructive/15 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ClockCountdown className="h-4 w-4 text-primary" weight="duotone" />
                    登录后继续当前工作上下文
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? "正在登录..." : "进入系统"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
