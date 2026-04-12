import { CheckCircle, CircleNotch, ShieldCheck, XCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { usePageSeo } from "@/lib/seo";

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
    void verify();
  }, [token]);

  return (
    <div className="min-h-[100dvh]">
      <div className="mx-auto flex min-h-[100dvh] max-w-5xl items-center px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid w-full gap-6 md:grid-cols-[0.92fr_1.08fr]">
          <section className="surface flex flex-col justify-between p-7 md:p-8">
            <div>
              <BrandMark />
              <div className="mt-10 max-w-2xl">
                <h1 className="text-[2rem] font-semibold leading-[1.06] tracking-[-0.055em] text-foreground md:text-[3rem]">
                  完成邮箱验证后，就可以进入新的系统管理界面
                </h1>
                <p className="mt-4 text-sm leading-8 text-muted-foreground md:text-[15px]">
                  验证通过后即可登录控制台，继续管理站点、凭据、验证策略与部署动作。
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" weight="fill" />
              验证成功后可直接返回登录页继续操作
            </div>
          </section>

          <section className="surface p-5 md:p-6">
            <h2 className="text-[1.9rem] font-semibold tracking-[-0.05em] text-foreground md:text-[2.5rem]">
              邮箱验证状态
            </h2>

            <div className="mt-8 space-y-5">
              {status === "loading" && (
                <div className="rounded-[1.5rem] border border-border/75 bg-white/75 px-5 py-5">
                  <div className="flex items-start gap-3">
                    <CircleNotch className="mt-1 h-5 w-5 animate-spin text-primary" />
                    <div>
                      <div className="text-sm font-medium tracking-tight text-foreground">
                        正在验证
                      </div>
                      <div className="mt-1 text-sm leading-7 text-muted-foreground">
                        系统正在校验邮箱令牌，请稍候。
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {status === "success" && (
                <div className="rounded-[1.5rem] border border-emerald-600/12 bg-emerald-600/8 px-5 py-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 text-emerald-700" weight="fill" />
                    <div>
                      <div className="text-sm font-medium tracking-tight text-emerald-800">
                        验证成功
                      </div>
                      <div className="mt-1 text-sm leading-7 text-emerald-800/88">{message}</div>
                    </div>
                  </div>
                </div>
              )}
              {status === "error" && (
                <div className="rounded-[1.5rem] border border-destructive/12 bg-destructive/8 px-5 py-5">
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-1 h-5 w-5 text-destructive" weight="fill" />
                    <div>
                      <div className="text-sm font-medium tracking-tight text-destructive">
                        验证失败
                      </div>
                      <div className="mt-1 text-sm leading-7 text-destructive/88">{message}</div>
                    </div>
                  </div>
                </div>
              )}

              <Button asChild>
                <Link to="/login">返回登录页</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
