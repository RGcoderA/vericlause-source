"use client";

import type { Section } from "@/types/contract";
import { plainLabel } from "@/lib/plain/label";
import { cn } from "@/lib/utils";

export function ClauseHighlight({
  section,
  active,
  quote,
  preserveTitle = false,
}: {
  section: Section;
  active?: boolean;
  quote?: string | null;
  preserveTitle?: boolean;
}) {
  const body = renderWithQuote(section.text, quote);
  return (
    <section
      id={section.id}
      className={cn(
        "rounded-lg px-3 py-2 transition-colors",
        active && "bg-[var(--highlight)] [animation:mask-reveal_200ms_cubic-bezier(0.2,0,0,1)]"
      )}
    >
      <h3 className="font-heading text-base">{preserveTitle ? section.title : plainLabel(section.title)}</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{body}</p>
    </section>
  );
}

function renderWithQuote(text: string, quote?: string | null) {
  if (!quote) return text;
  const index = text.indexOf(quote);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-[var(--gold)] px-0.5 font-bold text-[#1a1406]">{quote}</mark>
      {text.slice(index + quote.length)}
    </>
  );
}
