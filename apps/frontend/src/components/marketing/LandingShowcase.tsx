import { memo, useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise,
  Certificate,
  ClockCountdown,
  ShieldCheck,
  Sparkle
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

const prompts = [
  "为 media.example.com 自动续签并部署到腾讯云 CDN",
  "检测 qiniu 生产环境凭据与证书到期窗口",
  "为所有 14 天内到期站点生成续签计划"
];

const workflowItems = [
  { id: "01", name: "media.example.com", status: "待部署", detail: "证书已签发，正在等待 CDN 下发" },
  { id: "02", name: "static.example.com", status: "验证中", detail: "DNS-01 记录已写入，等待校验回执" },
  { id: "03", name: "img.example.com", status: "稳定", detail: "HTTPS 与 CDN 证书到期时间保持一致" }
];

const tickerItems = [
  "腾讯云 CDN",
  "七牛云 CDN",
  "Let's Encrypt",
  "DNS-01",
  "HTTP-01",
  "自动部署",
  "到期监控",
  "凭据加密"
];

function spring(index: number) {
  return {
    delay: index * 0.08,
    type: "spring",
    stiffness: 100,
    damping: 20
  } as const;
}

export const LandingShowcase = memo(function LandingShowcase() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const [queueIndex, setQueueIndex] = useState(0);
  const [notificationVisible, setNotificationVisible] = useState(true);

  useEffect(() => {
    const current = prompts[promptIndex];
    const typingTimer = window.setInterval(() => {
      setTypedLength((value) => {
        if (value >= current.length) {
          window.clearInterval(typingTimer);
          window.setTimeout(() => {
            setTypedLength(0);
            setPromptIndex((index) => (index + 1) % prompts.length);
          }, 1800);
          return value;
        }
        return value + 1;
      });
    }, 48);

    return () => {
      window.clearInterval(typingTimer);
    };
  }, [promptIndex]);

  useEffect(() => {
    const queueTimer = window.setInterval(() => {
      setQueueIndex((value) => (value + 1) % workflowItems.length);
      setNotificationVisible(false);
      window.setTimeout(() => setNotificationVisible(true), 420);
    }, 3200);

    return () => window.clearInterval(queueTimer);
  }, []);

  const rotatingItems = useMemo(
    () =>
      workflowItems.map((_, index) => workflowItems[(index + queueIndex) % workflowItems.length]),
    [queueIndex]
  );

  const currentPrompt = prompts[promptIndex].slice(0, typedLength);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            staggerChildren: 0.08
          }
        }
      }}
      className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]"
    >
      <motion.div
        variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
        className="rounded-[2.4rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,245,240,0.72))] p-6 shadow-[0_40px_90px_-58px_rgba(56,46,35,0.32),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl md:p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Active Queue
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              证书控制循环
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/90 text-foreground shadow-[0_16px_36px_-24px_rgba(56,46,35,0.3)]">
            <Sparkle className="h-5 w-5" weight="fill" />
          </div>
        </div>

        <div className="mt-6 rounded-[1.8rem] border border-border/70 bg-[rgba(249,247,243,0.92)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <ArrowsClockwise className="h-4 w-4 animate-spin [animation-duration:6s]" />
            编排指令
          </div>
          <div className="mt-4 rounded-[1.35rem] border border-white/80 bg-white/90 px-4 py-4 font-mono text-[0.82rem] leading-7 text-foreground shadow-[0_14px_30px_-26px_rgba(56,46,35,0.35)]">
            {currentPrompt}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="ml-1 inline-block h-4 w-[2px] bg-foreground/70 align-middle"
            />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {rotatingItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              transition={spring(index)}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.6rem] border border-white/80 bg-white/84 px-4 py-4 shadow-[0_18px_34px_-28px_rgba(56,46,35,0.28)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background">
                <ShieldCheck className="h-5 w-5" weight="bold" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight text-foreground">{item.name}</div>
                <div className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</div>
              </div>
              <div className="rounded-full border border-emerald-600/12 bg-emerald-600/8 px-3 py-1 text-[0.72rem] font-semibold tracking-[0.16em] text-emerald-700">
                {item.status}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-4">
        <motion.div
          variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
          className="rounded-[2.2rem] border border-white/80 bg-white/76 p-6 shadow-[0_36px_70px_-52px_rgba(56,46,35,0.3),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Live Status
              </div>
              <div className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                续签窗口已开启
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="h-3.5 w-3.5 rounded-full bg-emerald-600"
            />
          </div>

          <AnimatePresence mode="wait">
            {notificationVisible && (
              <motion.div
                key={queueIndex}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="mt-5 rounded-[1.4rem] border border-border/80 bg-[rgba(248,246,242,0.9)] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/90">
                    <ClockCountdown className="h-5 w-5 text-foreground" weight="fill" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold tracking-tight text-foreground">
                      检测到下一批可续签站点
                    </div>
                    <div className="mt-1 text-xs leading-5 text-muted-foreground">
                      在 03:00 调度窗口前，系统会先完成证书校验，再决定是否自动部署。
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
          className="overflow-hidden rounded-[2.2rem] border border-white/80 bg-white/76 p-6 shadow-[0_36px_70px_-52px_rgba(56,46,35,0.3),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Coverage Stream
              </div>
              <div className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                支持整条 CDN 证书链路
              </div>
            </div>
            <Certificate className="h-5 w-5 text-foreground" weight="duotone" />
          </div>

          <div className="mt-5 overflow-hidden">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              className="flex w-[200%] gap-3"
            >
              {[...tickerItems, ...tickerItems].map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex min-w-fit items-center gap-2 rounded-full border border-white/80 bg-[rgba(249,247,243,0.95)] px-4 py-2 text-xs font-semibold tracking-[0.16em] text-muted-foreground"
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-600/80" />
                  {item}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});
