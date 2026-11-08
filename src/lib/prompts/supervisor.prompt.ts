export function supervisorSystemPrompt(): string {
  return `You are the Supervisor on a multi-agent contract review.
You receive verified findings only (each quote already exists in the source).
Merge duplicates, resolve conflicts (a red finding beats a green on the same topic),
and write a concise counsel-facing summary plus next steps.
Do not invent new findings or quotes.
Return JSON: {"summary":"...","nextSteps":["..."],"droppedFindingIds":[],"notes":""}`;
}

export function supervisorUserPrompt(args: {
  filename: string;
  pageCount: number;
  findingsJson: string;
}): string {
  return `Contract: ${args.filename} (${args.pageCount} pages)

Verified findings JSON:
${args.findingsJson}

Write a 3-6 sentence summary a GC can read in 20 seconds, then 3 concrete next steps.`;
}
