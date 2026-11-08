"use client";

import { useEffect, useState } from "react";
import { DiffView } from "@/components/redline/DiffView";
import { NegotiationNote } from "@/components/redline/NegotiationNote";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/components/i18n/useCopy";
import { plainLabel } from "@/lib/plain/label";
import type { Finding } from "@/types/finding";
import { LoaderCircle, XIcon } from "lucide-react";

type Redline = { original: string; rewrite: string; note: string };

export function RedlineDialog({
  reviewId,
  finding,
  onOpenChange,
}: {
  reviewId: string;
  finding: Finding | null;
  onOpenChange: (open: boolean) => void;
}) {
  const copy = useCopy();
  const [redline, setRedline] = useState<Redline | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!finding) {
      setRedline(null);
      setError(null);
      return;
    }
    setLoading(true);
    setRedline(null);
    setError(null);
    void fetch("/api/redline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, findingId: finding.id }),
    })
      .then(async (response) => {
        const body = (await response.json()) as Redline & { error?: string };
        if (!response.ok) throw new Error(body.error || copy.reading.redlineFailed);
        setRedline(body);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : copy.reading.redlineFailed);
      })
      .finally(() => setLoading(false));
  }, [finding, reviewId]);

  if (!finding) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black p-4 pt-16"
      role="dialog"
      aria-modal="true"
      aria-labelledby="redline-title"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative mb-10 w-full max-w-3xl bg-card p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-3 right-3"
          onClick={() => onOpenChange(false)}
        >
          <XIcon />
          <span className="sr-only">{copy.help.close}</span>
        </Button>
        <h2 id="redline-title" className="font-heading pr-8 text-xl">
          {copy.reading.redlineFor} {plainLabel(finding.title)}
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">{copy.reading.redlineLead}</p>
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" /> {copy.reading.redlineDrafting}
          </p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {redline ? (
          <div className="space-y-4">
            <DiffView original={redline.original} rewrite={redline.rewrite} />
            <NegotiationNote note={redline.note} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
