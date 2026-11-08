"use client";

import { useState } from "react";
import { useCopy } from "@/components/i18n/useCopy";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle } from "lucide-react";

export function PlaybookEditor({
  onCompile,
  disabled,
}: {
  onCompile: (text: string) => Promise<void>;
  disabled?: boolean;
}) {
  const copy = useCopy();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="bg-card p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!text.trim()) return;
        setBusy(true);
        setError(null);
        try {
          await onCompile(text.trim());
          setText("");
        } catch (err) {
          setError(err instanceof Error ? err.message : copy.reading.ruleFailed);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label htmlFor="rule" className="font-heading text-lg">
        {copy.reading.ruleTitle}
      </label>
      <p className="mb-3 text-sm text-muted-foreground">{copy.reading.ruleLead}</p>
      <Textarea
        id="rule"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={copy.reading.rulePlaceholder}
        className="min-h-24"
      />
      <div className="mt-3 flex items-center gap-3">
        <Button type="submit" disabled={disabled || busy || text.trim().length < 8}>
          {busy ? <LoaderCircle className="animate-spin" /> : null}
          {copy.reading.ruleAdd}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
