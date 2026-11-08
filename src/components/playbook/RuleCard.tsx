"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/review/SeverityBadge";
import { SPECIALISTS } from "@/config/agents.config";
import type { Rule } from "@/types/playbook";

export function RuleCard({
  rule,
  onToggle,
  onRemove,
}: {
  rule: Rule;
  onToggle: (rule: Rule) => void;
  onRemove: (rule: Rule) => void;
}) {
  const domain = SPECIALISTS.find((item) => item.id === rule.domain)?.shortName ?? rule.domain;
  return (
    <article className="bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={rule.severity} />
        <Badge variant="outline">{domain}</Badge>
        {!rule.enabled ? <Badge variant="secondary">Off</Badge> : null}
      </div>
      <h3 className="font-heading mt-2 text-lg">{rule.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{rule.description}</p>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onToggle(rule)}>
          {rule.enabled ? "Disable" : "Enable"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onRemove(rule)}>
          Remove
        </Button>
      </div>
    </article>
  );
}
