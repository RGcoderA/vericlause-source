"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { HelpChat } from "@/components/help/HelpChat";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export function AppShell({ children }: { children: ReactNode }) {
    const path = usePathname();
    const bare = path === "/login" || path === "/signup";
    if (bare) {
        return <div className="min-h-screen bg-[#f3f0f4] px-4 py-10">{children}</div>;
    }
    return (
        <>
            <Header />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-24">{children}</main>
            <Footer />
            <HelpChat />
        </>
    );
}