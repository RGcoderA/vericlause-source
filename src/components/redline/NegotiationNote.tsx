"use client";

import { useCopy } from "@/components/i18n/useCopy";

export function NegotiationNote({ note }: { note: string }) {
  const copy = useCopy();
  return (
    <div className="bg-[var(--paper-2)] p-3 text-sm">
      <p className="text-sm font-bold">{copy.reading.vendorNote}</p>
      <p className="mt-1 leading-relaxed">{note}</p>
    </div>
  );
}
