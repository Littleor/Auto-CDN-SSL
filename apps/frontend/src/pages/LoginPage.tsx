import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Auto-SSL</p>
                <h1 className="text-4xl font-semibold">自动申请 · 续签 · 部署 CDN 证书</h1>
              </div>
            </div>
            <p className="max-w-xl text-lg text-muted-foreground">
              为多开发者、多网站提供一站式证书生命周期管理，支持腾讯云与七牛云 CDN 自动部署。
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm shadow-soft">
                证书到期提醒 + 自动续签
              </div>
              <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm shadow-soft">
                多平台凭据统一管理
              </div>
              <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm shadow-soft">
                统一部署记录与失败诊断
              </div>
            </div>
          </div>

          <Card className="glass">
            <CardHeader>
              <CardTitle>登录控制台</CardTitle>
              <CardDescription>使用开发者账号进入证书管理中心。</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">邮箱</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dev@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">密码</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少 8 位"
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "正在登录..." : "进入控制台"}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                还没有账号？
                <Link to="/register" className="ml-1 text-primary hover:underline">
                  创建账号
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
