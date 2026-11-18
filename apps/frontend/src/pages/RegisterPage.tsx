import { errorMessage } from "@/lib/api";
import { useState } from "react";
import { ArrowRight, CircleNotch, EnvelopeSimple } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { usePageSeo } from "@/lib/seo";

export function RegisterPage() {
  const { register } = useAuth();
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
    try {
      const message = await register(name, email, password);
      setSuccess(message || "验证邮件已发送，请前往邮箱完成验证。");
    } catch (err) {
      setError(errorMessage(err, "注册失败"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="查收你的邮箱" switchLabel="登录" switchTo="/login">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <EnvelopeSimple className="h-7 w-7" />
          </div>
          <p className="mt-6 text-sm leading-7 text-muted-foreground">{success}</p>
          <p className="mt-1 text-sm font-medium">{email}</p>
          <Button asChild size="lg" className="mt-8 w-full">
            <Link to="/login">
              去登录
              <ArrowRight className="h-4 w-4" weight="bold" />
            </Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="创建账号"
      description="注册后即可接入 CDN，让证书自己续签。"
      switchLabel="登录"
      switchTo="/login"
      footer={
        <>
          已经有账号？
          <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            直接登录
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="昵称" htmlFor="reg-name">
          <Input
            id="reg-name"
            autoComplete="nickname"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="如：运维小组"
            required
            autoFocus
          />
        </Field>
        <Field label="邮箱" htmlFor="reg-email" hint="验证邮件会发送到这个地址。">
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>
        <Field label="密码" htmlFor="reg-password">
          <Input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="至少 8 位"
            minLength={8}
            required
          />
        </Field>
        {error && <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <CircleNotch className="h-4 w-4 animate-spin" /> : null}
          {loading ? "正在创建" : "创建账号"}
          {!loading && <ArrowRight className="h-4 w-4" weight="bold" />}
        </Button>
      </form>
    </AuthLayout>
  );
}
