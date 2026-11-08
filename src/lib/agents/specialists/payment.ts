import type { AgentId } from "@/config/agents.config";
import {
  dedupeFindings,
  findingFromDetector,
  findingsFromRules,
  sectionHits,
  type Detector,
} from "@/lib/agents/heuristic";
import type { Section } from "@/types/contract";
import type { Finding } from "@/types/finding";
import type { Rule } from "@/types/playbook";

const AGENT_ID: AgentId = "payment";

const DETECTORS: Detector[] = [
  {
    id: "short-renewal",
    ruleId: "auto-renewal-notice",
    title: "Auto-renewal with only 15-day notice",
    severity: "red",
    summary:
      "The term renews automatically for 24 months unless Customer gives at least 15 days' notice — far shorter than a 30-day policy.",
    recommendation:
      "Require at least 30 days' (preferably 60 days') written notice to prevent renewal, and limit renewal to successive 12-month terms.",
    test: (text) =>
      /automatically renews/i.test(text) &&
      /(fifteen \(15\) days|15 days)/i.test(text),
  },
  {
    id: "hidden-fee",
    ruleId: "unilateral-price",
    title: "Hidden platform fee and 10-day price increases",
    severity: "amber",
    summary:
      "Vendor may raise fees on 10 days' notice and adds an 8% platform infrastructure fee on every invoice.",
    recommendation:
      "Delete the platform fee. Freeze price for the initial term; cap renewal increases and require 90 days' notice.",
    test: (text) =>
      /platform infrastructure fee/i.test(text) ||
      /increase fees at any time upon ten/i.test(text),
  },
  {
    id: "renewal-ok",
    ruleId: "auto-renewal-notice",
    title: "Renewal opt-out with 60 days' notice",
    severity: "green",
    summary: "Either party can prevent renewal with 60 days' written notice.",
    recommendation: "Keep the 60-day non-renewal window.",
    compliant: true,
    test: (text) =>
      /sixty \(60\) days before the end of the then-current term/i.test(text),
  },
];

export function scanPayment(sections: Section[], rules: Rule[]): Finding[] {
  const detected = DETECTORS.flatMap((detector) =>
    sectionHits(sections, detector.test).map((section) =>
      findingFromDetector({
        agentId: AGENT_ID,
        section,
        detector,
        needles: [
          "automatically renews",
          "fifteen (15) days",
          "platform infrastructure fee",
          "sixty (60) days",
        ],
      })
    )
  );
  return dedupeFindings([
    ...detected,
    ...findingsFromRules({
      agentId: AGENT_ID,
      sections,
      rules,
      alreadyCovered: new Set(detected.map((item) => item.ruleId)),
    }),
  ]);
}
