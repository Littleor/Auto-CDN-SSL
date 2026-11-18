import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Info, WarningCircle } from "@phosphor-icons/react";

type ToastTone = "default" | "success" | "error";
type ToastItem = { id: number; title: string; description?: string; tone: ToastTone };
type ToastInput = { title: string; description?: string; tone?: ToastTone };

const ToastContext = React.createContext<((input: ToastInput) => void) | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const counter = React.useRef(0);

  const push = React.useCallback((input: ToastInput) => {
    counter.current += 1;
    const id = counter.current;
    setItems((prev) => [...prev.slice(-2), { id, tone: input.tone ?? "default", ...input }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, input.tone === "error" ? 6000 : 3800);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-5 z-[80] flex flex-col items-center gap-2 px-4">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const Icon = item.tone === "success" ? CheckCircle : item.tone === "error" ? WarningCircle : Info;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                role="status"
                className="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl bg-primary px-3.5 py-2.5 text-primary-foreground shadow-float"
              >
                <Icon
                  className={
                    item.tone === "success"
                      ? "mt-0.5 h-4 w-4 shrink-0 text-success"
                      : item.tone === "error"
                        ? "mt-0.5 h-4 w-4 shrink-0 text-destructive"
                        : "mt-0.5 h-4 w-4 shrink-0 opacity-70"
                  }
                  weight="fill"
                />
                <div className="min-w-0 text-[13px]">
                  <div className="font-medium">{item.title}</div>
                  {item.description && <div className="mt-0.5 break-words opacity-70">{item.description}</div>}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
