/** Combine typed text with a speech transcript, capped for the help question box. */
export function spokenDraft(prefix: string, transcript: string, limit = 500): string {
  const spoken = transcript.replace(/\s+/g, " ").trim();
  const base = prefix.replace(/\s+/g, " ").trim();
  const next = base && spoken ? `${base} ${spoken}` : base || spoken;
  return next.slice(0, limit);
}

export function micFailure(error: string): "denied" | "failed" | "ignore" {
  if (error === "not-allowed" || error === "service-not-allowed") return "denied";
  if (error === "aborted" || error === "no-speech") return "ignore";
  return "failed";
}
