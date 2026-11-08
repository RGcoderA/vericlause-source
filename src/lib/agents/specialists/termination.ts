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

const AGENT_ID: AgentId = "termination";

const DETECTORS: Detector[] = [
  {
    id: "no-convenience",
    ruleId: "term-for-convenience",
    title: "No termination for convenience",
    severity: "red",
    summary:
      "Customer cannot terminate for convenience and may exit only after a 90-day cure of material breach — a lock-in.",
    recommendation:
      "Add termination for convenience on 30 days' notice and exit assistance of at least 90 days.",
    test: (text) =>
      /may not terminate this agreement for convenience/i.test(text),
  },
  {
    id: "no-exit",
    ruleId: "exit-assist",
    title: "No exit assistance",
    severity: "amber",
    summary: "Vendor has no obligation to export data or help Customer transition away — a lock-in.",
    recommendation: "Require exit assistance and a timed data export on termination.",
    test: (text) => /no obligation to provide exit assistance/i.test(text),
  },
  {
    id: "exit-ok",
    ruleId: "exit-assist",
    title: "Exit assistance present",
    severity: "green",
    summary: "Vendor will provide up to 90 days of exit assistance on termination.",
    recommendation: "Keep the wind-down commitment.",
    compliant: true,
    test: (text) => /exit assistance for up to ninety/i.test(text),
  },
  {
    id: "convenience-ok",
    ruleId: "term-for-convenience",
    title: "Termination for convenience present",
    severity: "green",
    summary:
      "Customer may terminate for convenience on 30 days' notice, with exit assistance.",
    recommendation: "Keep this right and confirm wind-down fees are reasonable.",
    compliant: true,
    test: (text) =>
      /terminate this agreement for convenience upon thirty \(30\) days/i.test(text),
  },
];

export function scanTermination(sections: Section[], rules: Rule[]): Finding[] {
  const detected = DETECTORS.flatMap((detector) =>
    sectionHits(sections, detector.test).map((section) =>
      findingFromDetector({
        agentId: AGENT_ID,
        section,
        detector,
        needles: [
          "may not terminate this Agreement for convenience",
          "terminate this Agreement for convenience",
          "no obligation to provide exit assistance",
          "exit assistance for up to ninety",
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
