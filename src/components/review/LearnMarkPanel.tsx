"use client";

import { useCopy } from "@/components/i18n/useCopy";
import { classifyDocument, marksFor, type DocumentKind } from "@/lib/learn/mark";

export function LearnMarkPanel({ text }: { text: string }) {
  const copy = useCopy();
  const kind = classifyDocument(text);
  const marks = marksFor(kind).slice(0, 5);
  if (marks.length === 0) return null;
  const kindLabel = copy.kinds[kind as DocumentKind] ?? copy.kinds.other;

  return (
    <section className="bg-card p-5">
      <h2 className="font-heading text-xl">{copy.learn.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.learn.readAs.replace("{kind}", kindLabel)}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {marks.map((mark) => (
          <li key={mark.id}>
            <span className="font-bold">{mark.title}. </span>
            {mark.clean}
          </li>
        ))}
      </ul>
    </section>
  );
}
