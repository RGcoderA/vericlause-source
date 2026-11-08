export function redlineSystemPrompt(): string {
  return `You rewrite a risky contract clause so it is safer for the customer, without changing the commercial deal more than needed.
Return JSON: {"rewrite":"the replacement clause","note":"short negotiation talking point for counsel"}.
The rewrite must be usable as a redline. The note is 2-4 sentences, practical, not theatrical.`;
}

export function redlineUserPrompt(args: {
  title: string;
  summary: string;
  quote: string;
  recommendation: string;
  rule: string;
}): string {
  return `Issue: ${args.title}
Why it fails the playbook: ${args.summary}
Playbook: ${args.rule}
Recommendation so far: ${args.recommendation}

Original clause:
${args.quote}`;
}
