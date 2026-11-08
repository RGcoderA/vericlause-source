"use client";

import { RuleCard } from "@/components/playbook/RuleCard";
import type { Rule } from "@/types/playbook";

export function RuleList({
  rules,
  onToggle,
  onRemove,
}: {
  rules: Rule[];
  onToggle: (rule: Rule) => void;
  onRemove: (rule: Rule) => void;
}) {
  if (rules.length === 0) {
    return (
      <p className="bg-card p-6 text-sm text-muted-foreground">
        No rules yet. Add one in plain English above.
      </p>
    );
  }
  return (
    <div className="stagger-rows grid gap-3">
      {rules.map((rule) => (
        <RuleCard key={rule.id} rule={rule} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </div>
  );
}
