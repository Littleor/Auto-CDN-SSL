import {
  ArrowRight,
  CheckCircle,
  Cloud,
  Database,
  ShieldCheck
} from "@phosphor-icons/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { usePageSeo } from "@/lib/seo";

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
        <div className="grid min-h-[calc(100dvh-3rem)] gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <section className="glass flex items-center p-4 md:p-6 lg:order-2">
            <Card className="w-full border-none bg-transparent shadow-none">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-2xl md:text-3xl">创建开发者账号</CardTitle>
                <CardDescription>注册后即可进入新版控制台管理 SSL 生命周期。</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
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
                    <Button className="w-full" onClick={() => navigate("/login")}>
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
                      <p className="text-xs text-muted-foreground">注册完成后可立即登录新版控制台。</p>
                    </div>
                    {error && (
                      <div className="rounded-[1.3rem] border border-destructive/15 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                        {error}
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "正在创建..." : "创建账号并发送验证邮件"}
                      {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="surface flex flex-col justify-between p-7 md:p-10 lg:order-1">
            <div>
              <BrandMark />
              <div className="mt-10 max-w-3xl space-y-5">
                <div className="section-label">Create Workspace</div>
                <h1 className="text-4xl font-semibold leading-none tracking-[-0.06em] text-foreground md:text-6xl">
                  从第一天开始，用更完整的界面维护 CDN 证书
                </h1>
                <p className="max-w-[62ch] text-base leading-8 text-muted-foreground">
                  这次改版不只换了皮肤，还把 Landing、SEO 和管理后台统一成同一个品牌系统，
                  用户注册后不会再从公开站跳进一个完全不同风格的后台。
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                <div className="line-panel px-4 py-4">
                  <ShieldCheck className="h-5 w-5 text-foreground" weight="duotone" />
                  <div className="mt-4 text-sm font-semibold tracking-tight text-foreground">证书与验证集中管理</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">域名挑战方式可以按顶级域名统一配置。</div>
                </div>
                <div className="line-panel px-4 py-4">
                  <Cloud className="h-5 w-5 text-foreground" weight="duotone" />
                  <div className="mt-4 text-sm font-semibold tracking-tight text-foreground">CDN 凭据与站点同步</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">腾讯云和七牛云平台会放在同一工作流里。</div>
                </div>
                <div className="line-panel px-4 py-4">
                  <Database className="h-5 w-5 text-foreground" weight="duotone" />
                  <div className="mt-4 text-sm font-semibold tracking-tight text-foreground">SEO 与后台视觉统一</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">首页抓取体验和进入后台后的体验保持一致。</div>
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
