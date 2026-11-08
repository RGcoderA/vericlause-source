"use client";

import { useCopy } from "@/components/i18n/useCopy";
import type { Section } from "@/types/contract";
import { ClauseHighlight } from "@/components/review/ClauseHighlight";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ContractViewer({
  sections,
  activeSectionId,
  activeQuote,
  dir = "ltr",
  preserveTitle = false,
}: {
  sections: Section[];
  activeSectionId?: string | null;
  activeQuote?: string | null;
  dir?: "ltr" | "rtl";
  preserveTitle?: boolean;
}) {
  const copy = useCopy();
  if (sections.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">{copy.reading.noSections}</p>;
  }

  return (
    <ScrollArea className="h-full min-h-0 bg-card">
      <div className="space-y-4 p-5" dir={dir}>
        {sections.map((section) => (
          <ClauseHighlight
            key={section.id}
            section={section}
            active={section.id === activeSectionId}
            quote={section.id === activeSectionId ? activeQuote : null}
            preserveTitle={preserveTitle}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
