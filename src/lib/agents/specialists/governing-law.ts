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

const AGENT_ID: AgentId = "governing-law";

const DETECTORS: Detector[] = [
  {
    id: "cayman",
    ruleId: "governing-law",
    title: "Cayman Islands venue and class-action waiver",
    severity: "amber",
    summary:
      "Disputes go to confidential arbitration in George Town under Cayman Islands law, and Customer waives class actions.",
    recommendation:
      "Move governing law to Delaware or Customer's home courts. Strike the class-action waiver and offshore exclusive venue.",
    test: (text) =>
      /cayman islands/i.test(text) || /class action/i.test(text),
  },
  {
    id: "delaware-ok",
    ruleId: "governing-law",
    title: "Delaware law with court access preserved",
    severity: "green",
    summary:
      "Delaware law applies and neither party waives class-action rights or court access.",
    recommendation: "Acceptable.",
    compliant: true,
    test: (text) =>
      /state of delaware/i.test(text) && /neither party waives class-action rights/i.test(text),
  },
];

export function scanGoverningLaw(sections: Section[], rules: Rule[]): Finding[] {
  const detected = DETECTORS.flatMap((detector) =>
    sectionHits(sections, detector.test).map((section) =>
      findingFromDetector({
        agentId: AGENT_ID,
        section,
        detector,
        needles: [
          "Cayman Islands",
          "class action",
          "State of Delaware",
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
