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

const AGENT_ID: AgentId = "ip-confidentiality";

const DETECTORS: Detector[] = [
  {
    id: "vendor-owns",
    ruleId: "work-product",
    title: "Vendor owns all work product",
    severity: "red",
    summary:
      "Deliverables created for Customer are owned exclusively by Vendor, and Vendor takes a perpetual licence to Customer Data.",
    recommendation:
      "Customer should own work product on payment. Limit Vendor to a licence in its pre-existing tools only.",
    test: (text) => /owned exclusively by vendor/i.test(text),
  },
  {
    id: "data-license",
    ruleId: "customer-data-license",
    title: "Perpetual licence to Customer Data",
    severity: "amber",
    summary:
      "Vendor receives a perpetual, irrevocable licence to use Customer Data to improve its products.",
    recommendation: "Delete the training/improvement licence or confine it to aggregated, de-identified data with an opt-out.",
    test: (text) => /perpetual, irrevocable license to use customer data/i.test(text),
  },
  {
    id: "customer-owns",
    ruleId: "work-product",
    title: "IP ownership clearly defined",
    severity: "green",
    summary: "Work product created for Customer is owned by Customer upon payment.",
    recommendation: "No change required.",
    compliant: true,
    test: (text) => /shall be owned by customer upon payment/i.test(text),
  },
];

export function scanIp(sections: Section[], rules: Rule[]): Finding[] {
  const detected = DETECTORS.flatMap((detector) =>
    sectionHits(sections, detector.test).map((section) =>
      findingFromDetector({
        agentId: AGENT_ID,
        section,
        detector,
        needles: [
          "owned exclusively by Vendor",
          "perpetual, irrevocable license",
          "owned by Customer upon payment",
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
