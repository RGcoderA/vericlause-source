"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { EASE_OUT, ENTER_MS, EXIT_MS } from "@/design/principles";

export function PageEnter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence initial={false} mode="sync">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6, transition: { duration: EXIT_MS / 1000, ease: EASE_OUT } }}
        transition={{ duration: ENTER_MS / 1000, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
