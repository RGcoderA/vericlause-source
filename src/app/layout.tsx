import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "VeriClause — verified contract risk review",
  description:
    "Upload a vendor contract. Specialist agents review it against your playbook, a code Verifier checks every quote, and you get a Red / Amber / Green verdict in under two minutes. Decision support for lawyers, not a substitute for counsel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${roboto.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
              <AppShell>{children}</AppShell>
              <Toaster />
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}