import { errorMessage } from "@/lib/api";
import { useState } from "react";
import { ArrowRight, CircleNotch } from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
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
    } catch (err) {
      setError(errorMessage(err, "登录失败"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="欢迎回来"
      description="登录后继续管理你的 CDN 证书。"
      switchLabel="注册"
      switchTo="/register"
      footer={
        <>
          还没有账号？
          <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            创建一个
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="邮箱" htmlFor="login-email">
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
          />
        </Field>
        <Field label="密码" htmlFor="login-password">
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="输入密码"
            required
          />
        </Field>
        {error && <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <CircleNotch className="h-4 w-4 animate-spin" /> : null}
          {loading ? "正在登录" : "登录"}
          {!loading && <ArrowRight className="h-4 w-4" weight="bold" />}
        </Button>
      </form>
    </AuthLayout>
  );
}
