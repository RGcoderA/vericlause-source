"use client";

import { useCopy } from "@/components/i18n/useCopy";
import type { Verified } from "@/types/finding";

export function VerifiedBadge({ verified }: { verified: Verified }) {
  const copy = useCopy();
  if (!verified.verified) return <span className="text-sm font-bold text-[var(--verdict-red)]">{copy.reading.notChecked}</span>;
  return <span className="text-sm font-bold text-[var(--verdict-green)]">{copy.reading.quoteChecked}</span>;
}
