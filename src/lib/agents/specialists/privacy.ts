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

const AGENT_ID: AgentId = "privacy";

const DETECTORS: Detector[] = [
  {
    id: "data-export",
    ruleId: "eu-data",
    title: "Data may be stored outside the EU",
    severity: "red",
    summary:
      "Customer Data may be stored in any jurisdiction Vendor selects, including countries without a GDPR adequacy decision.",
    recommendation:
      "Confine processing to the EEA or adequacy countries, name subprocessors, and require SCCs plus a transfer impact assessment otherwise.",
    test: (text) =>
      /any jurisdiction vendor selects/i.test(text) ||
      /not the subject of an adequacy decision/i.test(text),
  },
  {
    id: "breach-vague",
    ruleId: "breach-notice",
    title: "No fixed breach-notice deadline",
    severity: "amber",
    summary:
      "Incident notice is only 'commercially reasonable efforts' with no 72-hour clock.",
    recommendation: "Require notice without undue delay and in any event within 72 hours.",
    test: (text) => /commercially reasonable efforts to notify/i.test(text),
  },
  {
    id: "eea-ok",
    ruleId: "eu-data",
    title: "EEA data residency",
    severity: "green",
    summary:
      "Customer Data is stored and processed in the EEA or an adequacy country.",
    recommendation: "Keep the residency clause and attach a DPA.",
    compliant: true,
    test: (text) =>
      /european economic area or in a country subject to an adequacy decision/i.test(
        text
      ),
  },
  {
    id: "breach-ok",
    ruleId: "breach-notice",
    title: "72-hour breach notice",
    severity: "green",
    summary: "Personal data breaches must be notified within 72 hours.",
    recommendation: "No change required.",
    compliant: true,
    test: (text) => /seventy-two \(72\) hours of becoming aware/i.test(text),
  },
];

export function scanPrivacy(sections: Section[], rules: Rule[]): Finding[] {
  const detected = DETECTORS.flatMap((detector) =>
    sectionHits(sections, detector.test).map((section) =>
      findingFromDetector({
        agentId: AGENT_ID,
        section,
        detector,
        needles: [
          "any jurisdiction Vendor selects",
          "commercially reasonable efforts",
          "European Economic Area",
          "seventy-two (72) hours",
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
