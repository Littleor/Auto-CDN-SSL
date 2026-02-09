import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShieldCheck, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

export function EmailVerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("验证链接无效");
        return;
      }
      try {
        const data = await apiRequest<{ message: string }>(
          `/auth/verify?token=${encodeURIComponent(token)}`
        );
        setStatus("success");
        setMessage(data.message || "邮箱验证成功");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "邮箱验证失败");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-12 top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-12 bottom-20 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
        <Card className="glass w-full max-w-lg">
          <CardHeader>
            <CardTitle>邮箱验证</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "loading" && (
              <p className="text-sm text-muted-foreground">正在验证，请稍候...</p>
            )}
            {status === "success" && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <ShieldCheck className="mt-0.5 h-5 w-5" />
                <span>{message}</span>
              </div>
            )}
            {status === "error" && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <XCircle className="mt-0.5 h-5 w-5" />
                <span>{message}</span>
              </div>
            )}
            <Button className="w-full" asChild>
              <Link to="/login">去登录</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
