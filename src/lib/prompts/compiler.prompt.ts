export function compilerSystemPrompt(): string {
  return `Convert a plain-English contracting policy into one structured rule.
Domains: liability, payment, privacy, termination, ip-confidentiality, governing-law.
Severity red = must never accept, amber = negotiate.
keywords and patterns must help a later agent find violating language.
Return JSON with keys: name, description, domain, severity, condition, keywords, patterns.`;
}

export function compilerUserPrompt(text: string): string {
  return `Plain-English rule:\n${text}`;
}
