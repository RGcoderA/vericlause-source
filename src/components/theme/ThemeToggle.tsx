"use client";

import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useCopy } from "@/components/i18n/useCopy";
import { EASE_OUT, ENTER_MS, EXIT_MS } from "@/design/principles";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const copy = useCopy();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const dark = ready && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-pressed={dark}
      aria-label={dark ? copy.theme.toLight : copy.theme.toDark}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="relative inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--gold)] px-2.5 py-1.5 text-sm leading-none font-bold tracking-normal text-black transition-[transform,background-color,color] duration-150 ease-out hover:bg-[var(--brand)] hover:text-black active:scale-[0.97] active:transition-none sm:ml-1 sm:px-4 sm:py-2"
    >
      <span className="relative size-4">
        <AnimatePresence initial={false} mode="sync">
          <motion.span
            key={dark ? "sun" : "moon"}
            className="absolute inset-0"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: EXIT_MS / 1000, ease: EASE_OUT } }}
            transition={{ duration: ENTER_MS / 1000, ease: EASE_OUT }}
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="hidden sm:inline">{dark ? copy.theme.light : copy.theme.dark}</span>
    </button>
  );
}
