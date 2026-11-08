"use client";

import { useCopy } from "@/components/i18n/useCopy";
import type { Severity } from "@/types/finding";

const COLOR: Record<Severity, string> = {
  red: "text-[var(--verdict-red)]",
  amber: "text-[var(--verdict-amber)]",
  green: "text-[var(--verdict-green)]",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const copy = useCopy();
  return <span className={`text-sm font-bold ${COLOR[severity]}`}>{copy.reading[severity]}</span>;
}
