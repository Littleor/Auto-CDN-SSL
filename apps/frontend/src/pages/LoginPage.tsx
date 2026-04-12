import { ArrowRight, Certificate, ClockCountdown, ShieldCheck } from "@phosphor-icons/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { usePageSeo } from "@/lib/seo";

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
        <div className="grid min-h-[calc(100dvh-3rem)] gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <section className="surface flex flex-col justify-between p-7 md:p-10">
            <div>
              <BrandMark />
              <div className="mt-10 max-w-3xl space-y-5">
                <div className="section-label">Console Access</div>
                <h1 className="text-4xl font-semibold leading-none tracking-[-0.06em] text-foreground md:text-6xl">
                  登录后继续处理你的 CDN 证书队列
                </h1>
                <p className="max-w-[62ch] text-base leading-8 text-muted-foreground">
                  新版后台把续签状态、部署记录和凭据管理统一到一个界面里，登录后就能直接回到当前工作上下文。
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                <div className="line-panel px-4 py-4">
                  <ShieldCheck className="h-5 w-5 text-foreground" weight="duotone" />
                  <div className="mt-4 text-sm font-semibold tracking-tight text-foreground">证书状态集中查看</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">到期窗口与 HTTPS 状态放在一个视图中。</div>
                </div>
                <div className="line-panel px-4 py-4">
                  <ClockCountdown className="h-5 w-5 text-foreground" weight="duotone" />
                  <div className="mt-4 text-sm font-semibold tracking-tight text-foreground">续签策略持续执行</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">每日调度和提前阈值统一维护。</div>
                </div>
                <div className="line-panel px-4 py-4">
                  <Certificate className="h-5 w-5 text-foreground" weight="duotone" />
                  <div className="mt-4 text-sm font-semibold tracking-tight text-foreground">部署动作留痕</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">失败原因与触发来源可以随时追溯。</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <Link to="/" className="transition-colors hover:text-foreground">
                返回官网
              </Link>
              <span className="text-border">/</span>
              <Link to="/register" className="transition-colors hover:text-foreground">
                创建新账号
              </Link>
            </div>
          </section>

          <section className="glass flex items-center p-4 md:p-6">
            <Card className="w-full border-none bg-transparent shadow-none">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-2xl md:text-3xl">登录控制台</CardTitle>
                <CardDescription>继续管理站点、凭据、域名验证和部署动作。</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <form onSubmit={handleSubmit} className="space-y-5">
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "正在登录..." : "进入系统管理界面"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
