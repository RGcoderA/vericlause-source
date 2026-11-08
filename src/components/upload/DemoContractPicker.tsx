"use client";

import { useState } from "react";
import { DEMO_FILES } from "@/config/constants";
import { useCopy } from "@/components/i18n/useCopy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DemoContractPicker({ disabled }: { disabled?: boolean }) {
  const copy = useCopy();
  const startCopy = copy.reviewStart as typeof copy.reviewStart & {
    reviewing?: string;
    reviewFailed?: string;
  };
  const reviewing = startCopy.reviewing || "Reviewing…";
  const reviewFailed = startCopy.reviewFailed || "This demo could not start. Wait a moment and try again.";
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(id: string) {
    if (busy) return;
    setBusy(id);
    setError(null);
    try {
      const body = new FormData();
      body.set("demo", id);
      const response = await fetch("/api/demo", { method: "POST", body });
      if (response.redirected) {
        window.location.assign(response.url);
        return;
      }
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error || reviewFailed);
      setBusy(null);
    } catch {
      setError(reviewFailed);
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm leading-6 text-destructive">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(DEMO_FILES) as Array<keyof typeof DEMO_FILES>).map((id) => {
          return (
            <Card key={id} size="sm">
              <CardHeader>
                <CardTitle>{copy.reviewStart.demos[id].title}</CardTitle>
                <CardDescription>{copy.reviewStart.demos[id].blurb}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant={id === "trap" || id === "risky" ? "default" : "outline"}
                  disabled={disabled || busy !== null}
                  onClick={() => start(id)}
                >
                  {busy === id ? reviewing : copy.reviewStart.reviewThis}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}