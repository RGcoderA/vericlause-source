"use client";

import { useCopy } from "@/components/i18n/useCopy";
import { Button } from "@/components/ui/button";
import { LANGUAGES, type LanguageId } from "@/lib/i18n/languages";
import type { SpeechSource } from "@/components/review/useSpeech";

export function ReadingToolbar({
  language,
  onLanguage,
  status,
  active,
  supported,
  failed,
  failure,
  onPlay,
  onPause,
  onResume,
  onStop,
}: {
  language: LanguageId;
  onLanguage: (language: LanguageId) => void;
  status: "idle" | "preparing" | "playing" | "paused";
  active: SpeechSource | null;
  supported: boolean;
  failed: boolean;
  failure?: string | null;
  onPlay: (source: SpeechSource) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}) {
  const copy = useCopy();
  function label(source: SpeechSource, idle: string) {
    if (active !== source || status === "idle") return idle;
    if (status === "preparing") return copy.reading.preparing;
    if (status === "paused") return source === "document" ? copy.reading.resumeDocument : copy.reading.resumeSimple;
    return copy.reading.pause;
  }

  function press(source: SpeechSource) {
    if (active === source && status === "playing") onPause();
    else if (active === source && status === "paused") onResume();
    else if (active === source && status === "preparing") onStop();
    else onPlay(source);
  }

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="reading-language">
          {copy.reading.language}
        </label>
        <select
          id="reading-language"
          value={language}
          onChange={(event) => onLanguage(event.target.value as LanguageId)}
          className="h-10 rounded-full bg-secondary px-4 text-sm font-bold text-secondary-foreground"
        >
          {LANGUAGES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <Button type="button" variant="outline" disabled={!supported} onClick={() => press("document")}>
          {label("document", copy.reading.readDocument)}
        </Button>
        <Button type="button" disabled={!supported} onClick={() => press("simple")}>
          {label("simple", copy.reading.readSimple)}
        </Button>
        {status !== "idle" ? (
          <Button type="button" variant="ghost" onClick={onStop}>
            {copy.reading.stop}
          </Button>
        ) : null}
      </div>
      <p className={failed || !supported ? "text-sm leading-6 text-destructive" : "text-sm leading-6 text-muted-foreground"}>
        {!supported ? copy.reading.unsupported : failed ? failure || copy.reading.couldNotRead : copy.reading.note}
      </p>
    </div>
  );
}