import { createHash } from "node:crypto";
import type { Playbook } from "@/types/playbook";

export function fingerprintDocument(text: string, playbook: Playbook): string {
  const rules = playbook.rules
    .filter((rule) => rule.enabled)
    .map((rule) =>
      [rule.id, rule.domain, rule.severity, rule.description, rule.patterns.join(",")].join("|")
    )
    .join("\n");
  return createHash("sha256")
    .update(text)
    .update("::")
    .update(String(playbook.version))
    .update("::")
    .update(rules)
    .digest("hex");
}
