import type { AgentDef } from "@/config/agents.config";
import type { Section } from "@/types/contract";
import type { Rule } from "@/types/playbook";

export function specialistSystemPrompt(agent: AgentDef): string {
  return `You are the ${agent.name} specialist on a contract-review desk.
Focus only on: ${agent.focus}.

You are decision support for a lawyer. Never invent clause text.
Every finding MUST include a quote copied verbatim from the contract sections provided.
If you cannot quote the source, do not emit the finding.

Return JSON: {"findings":[{
  "title": "short issue title",
  "summary": "one or two sentences",
  "severity": "red" | "amber" | "green",
  "quote": "verbatim clause excerpt",
  "sectionNumber": "8.2",
  "ruleId": "playbook rule id if any",
  "recommendation": "what counsel should do"
}]}

Severity: red = deal-breaker against the playbook, amber = negotiate, green = playbook satisfied.
Prefer fewer high-quality findings over a long list.`;
}

export function specialistUserPrompt(args: {
  agent: AgentDef;
  rules: Rule[];
  sections: Section[];
  learnMark?: string;
}): string {
  const rules = args.rules
    .map(
      (rule) =>
        `- [${rule.id}] (${rule.severity}) ${rule.name}: ${rule.description}`
    )
    .join("\n");
  const sections = args.sections
    .map(
      (section) =>
        `### Section ${section.number} — ${section.title}\n${section.text}`
    )
    .join("\n\n");
  const mark = args.learnMark?.trim()
    ? `\n\n${args.learnMark.trim()}\nUse the learn mark as a checklist. Still quote the contract. Do not treat the mark as a finding by itself.`
    : "";
  return `Playbook rules for this domain:\n${rules || "(none)"}\n\nContract sections:\n${sections}${mark}`;
}
