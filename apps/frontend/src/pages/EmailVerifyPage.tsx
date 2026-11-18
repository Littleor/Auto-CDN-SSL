import { useEffect, useState } from "react";
import { CheckCircle, CircleNotch, XCircle } from "@phosphor-icons/react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { apiRequest, errorMessage } from "@/lib/api";
import { usePageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function EmailVerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  usePageSeo({
    title: "邮箱验证 | Auto CDN SSL",
    description: "验证 Auto CDN SSL 账号邮箱。",
    path: "/verify",
    robots: "noindex,nofollow"
  });

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("验证链接无效");
        return;
      }
      try {
        const data = await apiRequest<{ message: string }>(`/auth/verify?token=${encodeURIComponent(token)}`);
        setStatus("success");
        setMessage(data.message || "邮箱验证成功");
      } catch (err) {
        setStatus("error");
        setMessage(errorMessage(err, "邮箱验证失败"));
      }
    };
    void verify();
  }, [token]);

  const Icon = status === "loading" ? CircleNotch : status === "success" ? CheckCircle : XCircle;
  const title = status === "loading" ? "正在验证邮箱" : status === "success" ? "邮箱已验证" : "验证没有成功";

  return (
    <AuthLayout title={title} switchLabel="登录" switchTo="/login">
      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full",
            status === "success" ? "bg-success/10 text-success" : status === "error" ? "bg-destructive/10 text-destructive" : "bg-secondary"
          )}
        >
          <Icon className={cn("h-8 w-8", status === "loading" && "animate-spin")} weight={status === "loading" ? "regular" : "fill"} />
        </div>
        <p className="mt-6 text-sm leading-7 text-muted-foreground">
          {status === "loading" ? "正在校验链接，请稍候。" : message}
        </p>
        {status !== "loading" && (
          <Button asChild size="lg" className="mt-8 w-full">
            <Link to="/login">{status === "success" ? "前往登录" : "返回登录"}</Link>
          </Button>
        )}
      </div>
    </AuthLayout>
  );
}
