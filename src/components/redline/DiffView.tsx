"use client";

import { diffWords } from "diff";
import { useCopy } from "@/components/i18n/useCopy";
import { cn } from "@/lib/utils";

export function DiffView({ original, rewrite }: { original: string; rewrite: string }) {
  const copy = useCopy();
  const parts = diffWords(original, rewrite);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <p className="mb-1 text-sm font-bold">{copy.reading.original}</p>
        <p className="bg-muted p-3 text-sm leading-relaxed whitespace-pre-wrap">
          {original}
        </p>
      </div>
      <div>
        <p className="mb-1 text-sm font-bold">{copy.reading.rewrite}</p>
        <p className="bg-card p-3 text-sm leading-relaxed whitespace-pre-wrap">
          {parts.map((part, index) => (
            <span
              key={index}
              className={cn(
                part.added && "bg-[var(--verdict-green-bg)] text-[var(--verdict-green)]",
                part.removed && "bg-[var(--verdict-red-bg)] text-[var(--verdict-red)] line-through"
              )}
            >
              {part.value}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
