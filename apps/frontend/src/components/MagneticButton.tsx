import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const springConfig = {
  type: "spring",
  stiffness: 100,
  damping: 20
} as const;

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  intensity?: number;
};

export function MagneticButton({
  children,
  className,
  intensity = 14
}: MagneticButtonProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const rotateX = useTransform(springY, [-intensity, intensity], [2.5, -2.5]);
  const rotateY = useTransform(springX, [-intensity, intensity], [-2.5, 2.5]);

  return (
    <motion.div
      className={cn("inline-flex", className)}
      style={{
        x: springX,
        y: springY,
        rotateX,
        rotateY,
        transformPerspective: 900
      }}
      whileTap={{ scale: 0.98 }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onPointerMove={(event) => {
        if (event.pointerType === "touch") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const offsetX = event.clientX - bounds.left - bounds.width / 2;
        const offsetY = event.clientY - bounds.top - bounds.height / 2;
        x.set((offsetX / bounds.width) * intensity * 2);
        y.set((offsetY / bounds.height) * intensity * 2);
      }}
    >
      {children}
    </motion.div>
  );
}

