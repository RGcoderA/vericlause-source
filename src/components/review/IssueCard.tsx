"use client";

import { useCopy } from "@/components/i18n/useCopy";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/review/SeverityBadge";
import { VerifiedBadge } from "@/components/review/VerifiedBadge";
import { plainLabel } from "@/lib/plain/label";
import type { Finding } from "@/types/finding";

export function IssueCard({
  finding,
  onSelect,
  onRedline,
}: {
  finding: Finding;
  onSelect: (finding: Finding) => void;
  onRedline?: (finding: Finding) => void;
}) {
  const copy = useCopy();
  return (
    <article className="bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <SeverityBadge severity={finding.severity} />
        <VerifiedBadge verified={finding.verified} />
      </div>
      <h3 className="font-heading mt-2 text-lg leading-snug">{plainLabel(finding.title)}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{finding.summary}</p>
      <p className="mt-3 text-sm">{finding.quote}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onSelect(finding)}>
          {copy.reading.show}
        </Button>
        {finding.severity !== "green" && onRedline ? (
          <Button size="sm" onClick={() => onRedline(finding)}>
            {copy.reading.suggest}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
