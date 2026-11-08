"use client";

import { useCopy } from "@/components/i18n/useCopy";
import type { Review } from "@/types/review";
import { cn } from "@/lib/utils";

export function VerdictCard({
  verdict,
  pageCount,
  durationMs,
  filename,
}: {
  verdict: Review["verdict"];
  pageCount: number;
  durationMs: number;
  filename: string;
  mode?: Review["mode"];
  cached?: boolean;
  attribution?: Review["attribution"];
}) {
  const copy = useCopy();
  const seconds = Math.max(1, Math.round(durationMs / 1000));
  const label = copy.reading[verdict];
  return (
    <section
      className={cn(
        "p-6 text-[var(--paper)]",
        verdict === "red" && "bg-[var(--verdict-red)]",
        verdict === "amber" && "bg-[var(--verdict-amber)]",
        verdict === "green" && "bg-[var(--verdict-green)]"
      )}
    >
      <h2 className="font-heading text-5xl sm:text-6xl">{label}</h2>
      <p className="mt-3 text-sm">
        {pageCount} {pageCount === 1 ? copy.reading.page : copy.reading.pages} {copy.reading.of} {filename} {copy.reading.in}{" "}
        {seconds} {seconds === 1 ? copy.reading.second : copy.reading.seconds}
      </p>
    </section>
  );
}
