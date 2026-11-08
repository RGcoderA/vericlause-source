"use client";

import { useCopy } from "@/components/i18n/useCopy";

export function Footer() {
  const copy = useCopy();
  return (
    <footer className="mt-auto bg-card">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
        <p>{copy.footer}</p>
      </div>
    </footer>
  );
}
