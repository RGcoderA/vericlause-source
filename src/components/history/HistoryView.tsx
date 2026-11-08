"use client";

import Link from "next/link";
import { useCopy } from "@/components/i18n/useCopy";
import { SeverityBadge } from "@/components/review/SeverityBadge";
import { Button } from "@/components/ui/button";
import type { Severity } from "@/types/finding";

export type HistoryRow = {
  id: string;
  verdict: Severity;
  filename: string;
  pageCount: number;
  findings: number;
  playbookVersion: number;
};

export function HistoryView({ reviews }: { reviews: HistoryRow[] }) {
  const copy = useCopy();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl">{copy.history.title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{copy.history.lead}</p>
      </div>
      {reviews.length === 0 ? (
        <p className="bg-card p-6 text-sm text-muted-foreground">
          {copy.history.empty}{" "}
          <Link href="/review" className="underline">
            {copy.history.upload}
          </Link>{" "}
          {copy.history.orDemo}
        </p>
      ) : (
        <ul className="stagger-rows space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="flex flex-col gap-3 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={review.verdict} />
                  <p className="font-medium">{review.filename}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {review.pageCount} {copy.history.pages} · {review.findings} {copy.history.findings} · {copy.history.playbook} v
                  {review.playbookVersion}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/review/${review.id}`} />}>
                  {copy.history.open}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
