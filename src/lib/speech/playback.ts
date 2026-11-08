/** How a speech-synthesis error should affect the current reading. */
export function speechFailure(error: string): "ignore" | "retry" | "stop" {
  if (error === "interrupted" || error === "canceled") return "ignore";
  if (error === "synthesis-failed" || error === "audio-busy" || error === "network") return "retry";
  return "stop";
}

/** How long to wait before treating a silent utterance as finished. */
export function speechBudget(text: string): number {
  return Math.min(25000, Math.max(5000, 1500 + text.length * 80));
}
