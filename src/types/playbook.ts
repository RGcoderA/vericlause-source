import type { AgentId } from "@/config/agents.config";
import type { Severity } from "./finding";

export type Rule = {
  id: string;
  name: string;
  description: string;
  domain: AgentId;
  severity: Exclude<Severity, "green">;
  condition: string;
  keywords: string[];
  patterns: string[];
  enabled: boolean;
};

export type Playbook = {
  version: number;
  updatedAt: string;
  rules: Rule[];
};
