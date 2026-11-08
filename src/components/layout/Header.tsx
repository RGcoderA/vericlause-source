"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useCopy } from "@/components/i18n/useCopy";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { EASE_IN_OUT, ENTER_MS } from "@/design/principles";
import { LANGUAGES, type LanguageId } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const copy = useCopy();
  const { language, setLanguage } = useLanguage();
  const nav = [
    { href: "/", label: copy.nav.home },
    { href: "/review", label: copy.nav.review },
    { href: "/playbook", label: copy.nav.playbook },
    { href: "/history", label: copy.nav.history },
    { href: "/faq", label: copy.nav.faq },
  ];
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  useEffect(() => {
    void fetch("/api/auth/session")
      .then((response) => response.json())
      .then((body: { user?: { email: string; role: string } | null }) => setUser(body.user ?? null))
      .catch(() => setUser(null));
  }, []);
  return (
    <header className="bg-[var(--brand)] text-black">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:h-16 sm:flex-nowrap sm:py-0">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-[#fffdf8]">
            <img src="/logo.png" alt="" className="size-9" />
          </span>
          <span className="hidden font-heading text-xl sm:inline">VeriClause</span>
        </Link>
        <nav className="order-3 flex w-full min-w-0 items-center gap-0.5 overflow-x-auto text-xs sm:order-none sm:w-auto sm:flex-1 sm:justify-end sm:gap-1 sm:text-sm">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/review"
                  ? pathname === "/review" || /^\/review\/[^/]+$/.test(pathname)
                  : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative shrink-0 rounded-full px-1.5 py-1.5 text-xs leading-none font-bold tracking-normal text-black hover:bg-[var(--gold)] hover:text-black sm:px-4 sm:py-2 sm:text-sm",
                  item.href === "/" && "max-sm:hidden",
                  active && "text-black"
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="nav-current"
                    className="absolute inset-0 rounded-full bg-[var(--gold)]"
                    transition={{ duration: ENTER_MS / 1000, ease: EASE_IN_OUT }}
                  />
                ) : null}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
          {user ? (
            <Link
              href="/api/auth/auth0/logout"
              className="ml-1 shrink-0 rounded-full px-1.5 py-1.5 text-xs leading-none font-bold tracking-normal text-black hover:bg-[var(--gold)] hover:text-black sm:ml-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              {user.role === "counsel" ? copy.nav.counsel : copy.nav.business} · {copy.nav.signOut}
            </Link>
          ) : (
            <Link
              href="/login"
              className="ml-1 shrink-0 rounded-full px-1.5 py-1.5 text-xs leading-none font-bold tracking-normal text-black hover:bg-[var(--gold)] hover:text-black sm:ml-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              {copy.nav.signIn}
            </Link>
          )}
        </nav>
        <label className="sr-only" htmlFor="nav-language">
          {copy.nav.language}
        </label>
        <select
          id="nav-language"
          value={language}
          onChange={(event) => setLanguage(event.target.value as LanguageId)}
          className="ml-auto h-9 shrink-0 rounded-full bg-[var(--gold)] px-3 text-xs font-bold text-black sm:ml-0 sm:text-sm"
        >
          {LANGUAGES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <ThemeToggle />
      </div>
    </header>
  );
}
