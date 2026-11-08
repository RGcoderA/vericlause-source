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

const AGENT_ID: AgentId = "liability";

const DETECTORS: Detector[] = [
  {
    id: "unlimited",
    ruleId: "liability-cap",
    title: "Unlimited liability",
    severity: "red",
    summary:
      "The vendor's aggregate liability is stated as unlimited, which breaches a 12-month fee cap policy.",
    recommendation:
      "Cap Vendor's aggregate liability at fees paid in the twelve months before the claim, and keep customary carve-outs narrow.",
    test: (text) =>
      /unlimited\s+liability|shall be unlimited|no limitation of liability/i.test(text),
  },
  {
    id: "broad-indemnity",
    ruleId: "broad-indemnity",
    title: "Customer indemnifies vendor's own negligence",
    severity: "red",
    summary:
      "Customer must indemnify Vendor for any and all claims, including Vendor's own negligence.",
    recommendation:
      "Limit indemnity to third-party IP claims caused by the indemnifying party's materials. Delete negligence pass-through.",
    test: (text) =>
      /own negligence/i.test(text) ||
      /indemnify[\s\S]{0,80}any and all claims/i.test(text),
  },
  {
    id: "cap-ok",
    ruleId: "liability-cap",
    title: "Liability cap at twelve months of fees",
    severity: "green",
    summary: "Vendor liability is capped at fees paid during the prior twelve months.",
    recommendation: "No change required on the cap.",
    compliant: true,
    test: (text) =>
      /shall not exceed the fees paid[\s\S]{0,80}twelve \(12\) months/i.test(text),
  },
];

export function scanLiability(sections: Section[], rules: Rule[]): Finding[] {
  const detected = DETECTORS.flatMap((detector) =>
    sectionHits(sections, detector.test).map((section) =>
      findingFromDetector({
        agentId: AGENT_ID,
        section,
        detector,
        needles: ["unlimited", "negligence", "twelve (12) months", "aggregate liability"],
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
