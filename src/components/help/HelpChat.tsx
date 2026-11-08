"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useCopy } from "@/components/i18n/useCopy";
import { Button } from "@/components/ui/button";
import { EASE_IN_OUT, EASE_OUT, ENTER_MS, EXIT_MS, POPOVER_SCALE } from "@/design/principles";
import { micFailure, spokenDraft } from "@/lib/help/speech";
import { languageById } from "@/lib/i18n/languages";

type SpeechResultEvent = { results: ArrayLike<{ 0?: { transcript: string } }> };
type SpeechErrorEvent = { error: string };
type BrowserRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function speechRecognizer(): (new () => BrowserRecognition) | null {
  if (typeof window === "undefined") return null;
  const host = window as Window & {
    SpeechRecognition?: new () => BrowserRecognition;
    webkitSpeechRecognition?: new () => BrowserRecognition;
  };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

type Turn = { role: "user" | "assistant"; text: string };

export function HelpChat() {
  const copy = useCopy();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([{ role: "assistant", text: copy.help.intro }]);
  const recognitionRef = useRef<BrowserRecognition | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  function releaseMic(recognition: BrowserRecognition | null) {
    if (!recognition) return;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.abort();
  }

  function stopMic() {
    releaseMic(recognitionRef.current);
    recognitionRef.current = null;
    setListening(false);
  }

  useEffect(() => {
    if (open) return;
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    }
    setListening(false);
  }, [open]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  function startMic() {
    const Recognizer = speechRecognizer();
    if (!Recognizer) {
      setMicError(copy.help.micUnsupported);
      return;
    }
    releaseMic(recognitionRef.current);
    const recognition = new Recognizer();
    const prefix = draftRef.current;
    recognition.lang = languageById(language)?.speech ?? "en-CA";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index]?.[0]?.transcript ?? "";
      }
      setDraft(spokenDraft(prefix, transcript));
    };
    recognition.onerror = (event) => {
      const kind = micFailure(event.error);
      if (kind === "denied") setMicError(copy.help.micDenied);
      else if (kind === "failed") setMicError(copy.help.micUnsupported);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setMicError(null);
    setError(null);
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
      setMicError(copy.help.micUnsupported);
    }
  }

  useEffect(() => {
    setTurns((current) => (current.length === 1 && current[0]?.role === "assistant" ? [{ role: "assistant", text: copy.help.intro }] : current));
  }, [copy.help.intro]);

  async function ask(question: string, faqId?: string) {
    const text = question.trim();
    if (text.length < 2 || busy) return;
    stopMic();
    setBusy(true);
    setError(null);
    setDraft("");
    setTurns((current) => [...current, { role: "user", text }]);
    try {
      const response = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, language, faqId }),
      });
      const body = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !body.reply) throw new Error(body.error || copy.help.unavailable);
      setTurns((current) => [...current, { role: "assistant", text: body.reply || "" }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.help.unavailable);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3">
      <AnimatePresence mode="popLayout" initial={false}>
      {open ? (
        <motion.section
          key="help-panel"
          style={{ originX: 1, originY: 1 }}
          initial={{ opacity: 0, scale: POPOVER_SCALE, x: 28, y: 18 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{
            opacity: 0,
            scale: POPOVER_SCALE,
            x: 20,
            y: 14,
            transition: { duration: EXIT_MS / 1000, ease: EASE_OUT },
          }}
          transition={{
            opacity: { duration: ENTER_MS / 1000, ease: EASE_OUT },
            scale: { duration: ENTER_MS / 1000, ease: EASE_OUT },
            x: { duration: ENTER_MS / 1000, ease: EASE_OUT },
            y: { duration: ENTER_MS / 1000, ease: EASE_IN_OUT },
          }}
          className="pointer-events-auto flex h-[min(32rem,calc(100vh-6rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden bg-card text-card-foreground shadow-xl"
        >
          <header className="flex items-center justify-between gap-3 bg-[var(--brand)] px-4 py-3 text-[var(--on-brand)]">
            <div>
              <p className="font-heading text-lg leading-none">{copy.help.title}</p>
              <p className="mt-1 text-xs font-bold">{copy.help.subtitle}</p>
            </div>
            <button type="button" className="text-sm font-bold" onClick={() => setOpen(false)}>
              {copy.help.close}
            </button>
          </header>
          <div className="stagger-rows flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {turns.map((turn, index) => (
              <p
                key={`${turn.role}-${index}`}
                className={
                  turn.role === "user"
                    ? "ml-8 bg-[var(--brand)] px-3 py-2 text-sm leading-6 font-bold text-[var(--on-brand)]"
                    : "mr-6 bg-muted px-3 py-2 text-sm leading-6"
                }
              >
                {turn.text}
              </p>
            ))}
            {busy ? <p className="text-sm text-muted-foreground">{copy.help.looking}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {turns.length < 3 ? (
              <div className="stagger-rows flex flex-col items-start gap-2">
                {copy.help.starters.map((starter) => (
                  <button
                    key={starter.id}
                    type="button"
                    className="rounded-full bg-secondary px-4 py-2 text-left text-xs leading-5 font-bold tracking-normal text-secondary-foreground"
                    onClick={() => void ask(starter.label, starter.id)}
                  >
                    {starter.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <form
            className="bg-muted p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void ask(draft);
            }}
          >
            <label className="sr-only" htmlFor="help-question">
              {copy.help.question}
            </label>
            <textarea
              id="help-question"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={2}
              maxLength={500}
              placeholder={copy.help.placeholder}
              className="w-full resize-none bg-background px-3 py-2 text-sm outline-none"
            />
            {listening ? (
              <p className="mt-2 text-xs font-bold" aria-live="polite">
                {copy.help.listening}
              </p>
            ) : null}
            {micError ? <p className="mt-2 text-xs text-destructive">{micError}</p> : null}
            <div className="mt-2 flex items-center justify-between gap-2">
              <Link href="/faq" className="text-xs text-muted-foreground underline">
                {copy.help.openFaq}
              </Link>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={listening ? "default" : "outline"}
                  className={listening ? "bg-[var(--gold)] text-[#1a1406]" : undefined}
                  aria-pressed={listening}
                  disabled={busy}
                  onClick={() => (listening ? stopMic() : startMic())}
                >
                  {listening ? copy.help.micStop : copy.help.mic}
                </Button>
                <Button type="submit" disabled={busy || draft.trim().length < 2}>
                  {copy.help.send}
                </Button>
              </div>
            </div>
          </form>
        </motion.section>
      ) : (
        <motion.button
          key="help-launcher"
          type="button"
          style={{ originX: 1, originY: 1 }}
          className="pointer-events-auto rounded-full bg-[var(--brand)] px-5 py-3 text-sm leading-none font-bold tracking-normal text-[var(--on-brand)] shadow-lg transition-[transform,background-color,color] duration-150 ease-out hover:bg-[var(--gold)] hover:text-[#1a1406] active:scale-[0.97] active:transition-none"
          onClick={() => setOpen(true)}
          aria-expanded={false}
        >
          {copy.help.title}
        </motion.button>
      )}
      </AnimatePresence>
    </div>
  );
}
