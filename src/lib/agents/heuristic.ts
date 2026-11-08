import type { AgentId } from "@/config/agents.config";
import { sentenceContaining } from "@/lib/parsing/clean-text";
import type { Section } from "@/types/contract";
import type { Finding, Severity } from "@/types/finding";
import type { Rule } from "@/types/playbook";

export type Detector = {
  id: string;
  ruleId: string;
  title: string;
  severity: Severity;
  summary: string;
  recommendation: string;
  test: (text: string) => boolean;
  compliant?: boolean;
};

function firstMatchIndex(text: string, needles: string[]): number {
  const lower = text.toLowerCase();
  for (const needle of needles) {
    const index = lower.indexOf(needle.toLowerCase());
    if (index >= 0) return index;
  }
  return -1;
}

export function quoteFrom(section: Section, needles: string[]): string {
  const index = firstMatchIndex(section.text, needles);
  if (index < 0) {
    return section.text.replace(/\s+/g, " ").trim().slice(0, 280);
  }
  const lineStart = section.text.lastIndexOf("\n", index);
  const lineEnd = section.text.indexOf("\n", index);
  const line = section.text
    .slice(lineStart + 1, lineEnd === -1 ? undefined : lineEnd)
    .replace(/\s+/g, " ")
    .trim();
  if (line.length >= 40) return line;
  return sentenceContaining(section.text, index);
}

export function sectionHits(sections: Section[], test: (text: string) => boolean): Section[] {
  return sections.filter((section) => test(`${section.title}\n${section.text}`));
}

export function findingFromDetector(args: {
  agentId: AgentId;
  section: Section;
  detector: Detector;
  needles: string[];
}): Finding {
  return {
    id: crypto.randomUUID(),
    agentId: args.agentId,
    title: args.detector.title,
    summary: args.detector.summary,
    severity: args.detector.severity,
    quote: quoteFrom(args.section, args.needles),
    sectionNumber: args.section.number,
    sectionId: args.section.id,
    ruleId: args.detector.ruleId,
    recommendation: args.detector.recommendation,
    verified: { verified: false, confidence: 0, matchType: "none" },
  };
}

export function findingsFromRules(args: {
  agentId: AgentId;
  sections: Section[];
  rules: Rule[];
  alreadyCovered?: Set<string>;
}): Finding[] {
  const findings: Finding[] = [];
  for (const rule of args.rules) {
    if (rule.domain !== args.agentId || !rule.enabled) continue;
    if (args.alreadyCovered?.has(rule.id)) continue;
    const patterns = rule.patterns
      .map((pattern) => {
        try {
          return new RegExp(pattern, "i");
        } catch {
          return null;
        }
      })
      .filter((pattern): pattern is RegExp => Boolean(pattern));
    if (patterns.length === 0) continue;

    for (const section of args.sections) {
      const hay = `${section.title}\n${section.text}`;
      if (!patterns.some((pattern) => pattern.test(hay))) continue;

      const needles = [
        ...rule.keywords,
        ...rule.patterns.map((pattern) => pattern.replace(/\\s\+/g, " ").replace(/\\/g, "")),
      ];
      findings.push({
        id: crypto.randomUUID(),
        agentId: args.agentId,
        title: rule.name,
        summary: rule.description,
        severity: rule.severity,
        quote: quoteFrom(section, needles),
        sectionNumber: section.number,
        sectionId: section.id,
        ruleId: rule.id,
        recommendation: `Negotiate this clause so it satisfies: ${rule.description}`,
        verified: { verified: false, confidence: 0, matchType: "none" },
      });
      break;
    }
  }
  return findings;
}

/** The playbook scan decides red, amber, or green. A model cannot paint a clean file red. */
export function groundFindings(model: Finding[], scan: Finding[], rules: Rule[]): Finding[] {
  const rulesById = new Map(rules.map((rule) => [rule.id, rule]));
  const scanByRule = new Map<string, Finding[]>();
  for (const finding of scan) {
    const list = scanByRule.get(finding.ruleId) ?? [];
    list.push(finding);
    scanByRule.set(finding.ruleId, list);
  }
  const covered = new Set<string>();
  const kept: Finding[] = [];

  for (const finding of model) {
    const scanned = finding.ruleId ? scanByRule.get(finding.ruleId) : undefined;
    const match = scanned?.find((item) => item.sectionNumber === finding.sectionNumber) ?? scanned?.[0];
    if (match) {
      kept.push({
        ...match,
        title: finding.title.trim() || match.title,
        summary: finding.summary.trim() || match.summary,
        recommendation: finding.recommendation.trim() || match.recommendation,
        severity: match.severity,
        quote: match.quote,
      });
      covered.add(match.ruleId);
      continue;
    }
    const rule = finding.ruleId ? rulesById.get(finding.ruleId) : undefined;
    if (!rule?.enabled) continue;
    const quoteHits = rule.patterns.some((pattern) => {
      try {
        return new RegExp(pattern, "i").test(finding.quote);
      } catch {
        return false;
      }
    });
    if (!quoteHits) continue;
    if ((scanByRule.get(rule.id) ?? []).some((item) => item.severity === "green")) continue;
    kept.push({ ...finding, severity: rule.severity });
    covered.add(rule.id);
  }

  for (const finding of scan) {
    if (!covered.has(finding.ruleId)) kept.push(finding);
  }
  return dedupeFindings(kept);
}

export function dedupeFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  const result: Finding[] = [];
  for (const finding of findings) {
    const key = `${finding.severity}:${finding.ruleId}:${finding.sectionNumber}:${finding.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(finding);
  }
  return result;
}