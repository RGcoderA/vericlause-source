"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { AgentActivityPanel } from "@/components/review/AgentActivityPanel";
import { ContractViewer } from "@/components/review/ContractViewer";
import { IssueList } from "@/components/review/IssueList";
import { LearnMarkPanel } from "@/components/review/LearnMarkPanel";
import { ReadingToolbar } from "@/components/review/ReadingToolbar";
import { useSpeech } from "@/components/review/useSpeech";
import { VerdictCard } from "@/components/review/VerdictCard";
import { RedlineDialog } from "@/components/redline/RedlineDialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useCopy } from "@/components/i18n/useCopy";
import { useClauseHighlight } from "@/hooks/useClauseHighlight";
import { EASE_OUT, ENTER_MS, EXIT_MS } from "@/design/principles";
import { languageById, SIMPLE_NOTE, type LanguageId } from "@/lib/i18n/languages";
import type { TranslationSection } from "@/lib/i18n/translate";
import { explainSections } from "@/lib/plain/explain";
import { plainLabel } from "@/lib/plain/label";
import { spokenScript } from "@/lib/speech/chunks";
import type { ContractPayload } from "@/hooks/useReviewStream";
import type { Finding } from "@/types/finding";
import type { AgentStatus, Review } from "@/types/review";


export function ReviewWorkspace({
  reviewId,
  initialReview,
  initialContract,
}: {
  reviewId: string;
  initialReview: Review;
  initialContract: ContractPayload | null;
}) {
  const router = useRouter();
  const { activeSectionId, highlight } = useClauseHighlight();
  const [review] = useState<Review>(initialReview);
  const [contract] = useState(initialContract);
  const [agents] = useState<AgentStatus[]>(initialReview.agentStatuses);
  const [activeQuote, setActiveQuote] = useState<string | null>(null);
  const [redlineFinding, setRedlineFinding] = useState<Finding | null>(null);
  const [reading, setReading] = useState<"plain" | "contract">("plain");
  const { language, setLanguage } = useLanguage();
  const copy = useCopy();
  const [translated, setTranslated] = useState<TranslationSection[] | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const speech = useSpeech();

  const findings = review.findings;
  const plainSections = useMemo(() => explainSections(contract?.sections ?? []), [contract]);
  const sourceSections = useMemo<TranslationSection[]>(
    () =>
      (contract?.sections ?? []).map((section) => ({
        id: section.id,
        title: section.title,
        plain: plainSections.find((item) => item.id === section.id)?.text ?? section.text,
        document: section.text,
      })),
    [contract, plainSections]
  );
  const activeFinding = useMemo(
    () => findings.find((item) => item.sectionId === activeSectionId),
    [findings, activeSectionId]
  );

  useEffect(() => {
    speech.stop();
    if (language === "en") {
      setTranslated(null);
      setTranslateError(null);
      setTranslating(false);
      return;
    }
    if (sourceSections.length === 0) {
      setTranslated(null);
      setTranslateError(null);
      setTranslating(false);
      return;
    }
    const controller = new AbortController();
    setTranslating(true);
    setTranslateError(null);
    async function load() {
      let lastError = copy.reading.failed;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        if (controller.signal.aborted) return;
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language, sections: sourceSections }),
          signal: controller.signal,
        });
        const body = (await response.json()) as { sections?: TranslationSection[]; error?: string };
        if (response.ok && body.sections) {
          setTranslated(body.sections);
          setTranslateError(null);
          return;
        }
        lastError = body.error || copy.reading.failed;
        if (response.status !== 429 || attempt === 2) break;
        await new Promise((resolve) => window.setTimeout(resolve, 700));
      }
      if (!controller.signal.aborted) {
        setTranslated(null);
        setTranslateError(lastError);
      }
    }
    void load()
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setTranslated(null);
          setTranslateError(copy.reading.failed);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setTranslating(false);
      });
    return () => controller.abort();
  }, [language, sourceSections, speech.stop, copy]);

  const activeLanguage: LanguageId = language !== "en" && translated ? language : "en";

  function showTitle(title: string) {
    const stripped = title.replace(/^\d+(?:\.\d+)*\s*[.:)\-]?\s*/, "").replace(/\.+$/g, "").trim() || title;
    if (activeLanguage === "zh" || activeLanguage === "ar" || activeLanguage === "hi") return stripped;
    if (stripped === stripped.toUpperCase()) {
      const lower = stripped.toLocaleLowerCase();
      return lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
    }
    return activeLanguage === "en" ? plainLabel(title) : stripped;
  }

  function speak(source: "document" | "simple") {
    setReading(source === "document" ? "contract" : "plain");
    const chosen = languageById(activeLanguage);
    const rows = activeLanguage === "en" ? sourceSections : translated || sourceSections;
    const parts = rows.map((section) => ({
      title: showTitle(section.title),
      text: source === "document" ? section.document : section.plain,
    }));
    const preface = source === "simple" ? SIMPLE_NOTE[activeLanguage] : "";
    speech.play(source, [preface, spokenScript(parts)].filter(Boolean).join(" "), chosen?.speech ?? "en-CA");
  }

  const shownPlain = (activeLanguage === "en" ? sourceSections : translated || sourceSections).map((section) => ({
    id: section.id,
    title: section.title,
    text: section.plain,
  }));

  async function rerun() {
    const response = await fetch("/api/rerun", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId }),
    });
    const body = (await response.json()) as { review?: Review; error?: string };
    if (!response.ok || !body.review) return;
    router.push(`/review/${body.review.id}`);
  }

  return (
    <div className="space-y-6">
      <VerdictCard
        verdict={review.verdict}
        pageCount={review.pageCount}
        durationMs={review.durationMs}
        filename={review.filename}
        mode={review.mode}
        attribution={review.attribution}
      />
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{review.summary}</p>
      {contract?.text ? <LearnMarkPanel text={contract.text} /> : null}
      {review.nextSteps.length ? (
        <ul className="space-y-1 text-sm">
          {review.nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => void rerun()}>
          {copy.reading.rerun}
        </Button>
        <Button variant="ghost" onClick={() => router.push("/playbook")}>
          {copy.reading.editPlaybook}
        </Button>
      </div>
      <AgentActivityPanel agents={agents} />
      <div className="grid gap-6 lg:grid-cols-2">
        <IssueList
          findings={findings}
          onSelect={(finding) => {
            setReading("contract");
            setActiveQuote(activeLanguage === "en" ? finding.quote : null);
            highlight(finding.sectionId);
          }}
          onRedline={setRedlineFinding}
        />
        <div>
          <ReadingToolbar
            language={language}
            onLanguage={setLanguage}
            status={speech.status}
            active={speech.active}
            supported={speech.supported}
            failed={speech.failed}
            onPlay={speak}
            onPause={speech.pause}
            onResume={speech.resume}
            onStop={speech.stop}
          />
          <div className="mb-3 flex gap-3">
            <button
              type="button"
              className={reading === "plain" ? "text-sm font-bold" : "text-sm text-muted-foreground"}
              onClick={() => setReading("plain")}
            >
              {copy.reading.simple}
            </button>
            <button
              type="button"
              className={reading === "contract" ? "text-sm font-bold" : "text-sm text-muted-foreground"}
              onClick={() => setReading("contract")}
            >
              {copy.reading.document}
            </button>
          </div>
          {translating ? <p className="mb-3 text-sm leading-6 text-muted-foreground">{copy.reading.preparing}</p> : null}
          {translateError ? <p className="mb-3 text-sm leading-6 text-destructive">{translateError}</p> : null}
          <div className="relative h-[min(72vh,44rem)]">
            <AnimatePresence initial={false}>
              <motion.div
                key={`${reading}-${language}`}
                className="absolute inset-0 min-h-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: EXIT_MS / 1000, ease: EASE_OUT } }}
                transition={{ duration: ENTER_MS / 1000, ease: EASE_OUT }}
              >
                {reading === "plain" ? (
                  <ScrollArea className="h-full bg-card">
                    <div className="stagger-rows space-y-4 p-5 pb-16" dir={languageById(activeLanguage)?.dir ?? "ltr"}>
                      <p className="text-sm leading-6 text-muted-foreground">{SIMPLE_NOTE[activeLanguage]}</p>
                      {shownPlain.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{copy.reading.empty}</p>
                      ) : (
                        shownPlain.map((section) => (
                          <section
                            key={section.id}
                            className={section.id === activeSectionId ? "bg-[var(--highlight)] px-3 py-2" : "px-3 py-2"}
                          >
                            <h3 className="font-heading text-base">{showTitle(section.title)}</h3>
                            <p className="mt-1 text-sm leading-6">{section.text}</p>
                          </section>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <ContractViewer
                    sections={(contract?.sections ?? []).map((section) => {
                      const row = activeLanguage === "en" ? null : translated?.find((item) => item.id === section.id);
                      return row ? { ...section, title: showTitle(row.title), text: row.document || section.text } : section;
                    })}
                    activeSectionId={activeSectionId}
                    activeQuote={activeLanguage === "en" ? (activeFinding?.quote ?? activeQuote) : null}
                    dir={languageById(activeLanguage)?.dir ?? "ltr"}
                    preserveTitle={activeLanguage !== "en"}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <RedlineDialog
        reviewId={review.id}
        finding={redlineFinding}
        onOpenChange={(open) => {
          if (!open) setRedlineFinding(null);
        }}
      />
    </div>
  );
}
