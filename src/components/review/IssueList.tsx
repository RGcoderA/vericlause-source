"use client";

import { useState } from "react";
import { IssueCard } from "@/components/review/IssueCard";
import { useCopy } from "@/components/i18n/useCopy";
import type { Finding } from "@/types/finding";

const FILTERS = ["all", "red", "amber", "green"] as const;

export function IssueList({
  findings,
  onSelect,
  onRedline,
}: {
  findings: Finding[];
  onSelect: (finding: Finding) => void;
  onRedline?: (finding: Finding) => void;
}) {
  const copy = useCopy();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const visible = filter === "all" ? findings : findings.filter((item) => item.severity === filter);
  const filterLabel = {
    all: copy.reading.all,
    red: copy.reading.red,
    amber: copy.reading.amber,
    green: copy.reading.green,
  };

  if (findings.length === 0) {
    return <p className="bg-card p-6 text-sm text-muted-foreground">{copy.reading.noFindings}</p>;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            className={filter === item ? "text-sm font-bold" : "text-sm text-muted-foreground"}
            onClick={() => setFilter(item)}
          >
            {filterLabel[item]}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.reading.noneHere}</p>
      ) : (
        <div className="stagger-rows flex flex-col gap-3">
          {visible.map((finding) => (
            <IssueCard key={finding.id} finding={finding} onSelect={onSelect} onRedline={onRedline} />
          ))}
        </div>
      )}
    </div>
  );
}
