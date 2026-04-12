import { memo, useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise,
  ClockCountdown,
  Cloud,
  ShieldCheck
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

const siteRows = [
  { id: "media", domain: "media.example.com", expiry: "27 天", status: "稳定" },
  { id: "static", domain: "static.example.com", expiry: "11 天", status: "关注" },
  { id: "img", domain: "img.example.com", expiry: "44 天", status: "稳定" }
];

const activityNotes = [
  "自动续签任务已开始扫描",
  "检测到 3 个站点接近续签窗口",
  "DNS-01 验证准备就绪"
];

const capabilityTags = [
  "腾讯云 CDN",
  "七牛云 CDN",
  "HTTP-01",
  "DNS-01",
  "自动部署",
  "历史记录"
];

export const LandingShowcase = memo(function LandingShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((value) => (value + 1) % activityNotes.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  const orderedRows = useMemo(() => {
    return siteRows.map((_, index) => siteRows[(index + activeIndex) % siteRows.length]);
  }, [activeIndex]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="surface p-4 md:p-5"
    >
      <div className="rounded-[1.6rem] border border-white/70 bg-white/72 p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="section-label">Product Preview</div>
            <div className="mt-1 text-base font-semibold tracking-[-0.03em] text-foreground">
              证书与部署概览
            </div>
          </div>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-full border border-primary/12 bg-primary/10 px-3 py-1 text-[0.7rem] font-medium text-primary"
          >
            Auto Renew
          </motion.div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div layout className="rounded-[1.4rem] border border-border/65 bg-white/80 p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>即将到期站点</span>
              <span>按时间顺序排列</span>
            </div>
            <div className="mt-4 divide-y divide-border/60">
              {orderedRows.map((row) => (
                <motion.div
                  key={row.id}
                  layout
                  transition={{ type: "spring", stiffness: 110, damping: 20 }}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <div className="text-sm font-medium tracking-tight text-foreground">
                      {row.domain}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      证书剩余 {row.expiry}
                    </div>
                  </div>
                  <div className="rounded-full border border-white/75 bg-white/74 px-2.5 py-1 text-[0.68rem] text-muted-foreground">
                    {row.status}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-4">
            <div className="rounded-[1.4rem] border border-border/65 bg-white/80 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="section-label">Deployment</div>
                  <div className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-foreground">
                    14
                  </div>
                </div>
                <ArrowsClockwise className="h-5 w-5 text-primary" weight="duotone" />
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>自动续签扫描</span>
                    <span>运行中</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/80">
                    <motion.div
                      className="h-1.5 rounded-full bg-primary"
                      animate={{ width: ["34%", "78%", "56%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>部署队列</span>
                    <span>等待中</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/80">
                    <motion.div
                      className="h-1.5 rounded-full bg-foreground/80"
                      animate={{ width: ["20%", "42%", "28%"] }}
                      transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-border/65 bg-white/80 p-4">
              <div className="section-label">Activity</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="mt-3 flex items-start gap-3"
                >
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.55, 1, 0.55] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="mt-1 h-2.5 w-2.5 rounded-full bg-primary"
                  />
                  <div className="text-sm leading-7 text-foreground">
                    {activityNotes[activeIndex]}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-4 flex items-start gap-3 text-sm text-muted-foreground">
                <ClockCountdown className="mt-1 h-4 w-4 text-primary" weight="duotone" />
                后台会优先处理临近到期站点，再决定是否自动部署到 CDN。
              </div>
              <div className="mt-3 flex items-start gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="mt-1 h-4 w-4 text-primary" weight="duotone" />
                续签、验证和部署动作会统一落到历史记录里。
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="flex w-[200%] gap-3"
          >
            {[...capabilityTags, ...capabilityTags].map((tag, index) => (
              <div
                key={`${tag}-${index}`}
                className="flex min-w-fit items-center gap-2 rounded-full border border-white/75 bg-white/74 px-3 py-2 text-xs text-muted-foreground"
              >
                <Cloud className="h-3.5 w-3.5 text-primary" weight="duotone" />
                {tag}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});
