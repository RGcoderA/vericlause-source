import { AGENT_IDS } from "@/config/agents.config";
import { z } from "zod";

export const ruleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  domain: z.enum(AGENT_IDS),
  severity: z.enum(["red", "amber"]),
  condition: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  patterns: z.array(z.string()).default([]),
  enabled: z.boolean().default(true),
});

export const compiledRuleSchema = ruleSchema.omit({ id: true, enabled: true });

export const specialistFindingSchema = z.object({
  title: z.string(),
  summary: z.string(),
  severity: z.enum(["red", "amber", "green"]),
  quote: z.string(),
  sectionNumber: z.string(),
  ruleId: z.string().optional().default(""),
  recommendation: z.string().optional().default(""),
});

export const specialistOutputSchema = z.object({
  findings: z.array(specialistFindingSchema),
});

export const supervisorOutputSchema = z.object({
  summary: z.string(),
  nextSteps: z.array(z.string()),
  droppedFindingIds: z.array(z.string()).optional().default([]),
  notes: z.string().optional().default(""),
});

export const redlineOutputSchema = z.object({
  rewrite: z.string(),
  note: z.string(),
});
