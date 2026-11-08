import type { AgentId } from "@/config/agents.config";
import { AGENT_IDS, SPECIALISTS } from "@/config/agents.config";
import { completeJson } from "@/lib/agents/base-agent";
import { hasLiveLlm } from "@/lib/env";
import { compiledRuleSchema } from "@/lib/playbook/rule-schema";
import { compilerSystemPrompt, compilerUserPrompt } from "@/lib/prompts/compiler.prompt";
import type { Rule } from "@/types/playbook";

const DOMAIN_HINTS: { id: AgentId; tokens: string[] }[] = SPECIALISTS.map((agent) => ({
  id: agent.id,
  tokens: agent.routing,
}));

function guessDomain(text: string): AgentId {
  const lower = text.toLowerCase();
  let best: AgentId = "liability";
  let score = -1;
  for (const hint of DOMAIN_HINTS) {
    const hits = hint.tokens.filter((token) => lower.includes(token)).length;
    if (hits > score) {
      score = hits;
      best = hint.id;
    }
  }
  return best;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function compileRuleHeuristic(text: string): Omit<Rule, "id" | "enabled"> {
  const description = text.trim();
  const lower = description.toLowerCase();
  const never = /\b(never|must not|do not accept|refuse|deal-breaker|red flag)\b/.test(lower);
  const domain = guessDomain(lower);
  const keywords = description
    .split(/[^a-zA-Z0-9]+/)
    .filter((token) => token.length > 3)
    .slice(0, 8);
  const name =
    description.length > 72 ? `${description.slice(0, 69).trim()}…` : description;
  return {
    name,
    description,
    domain: AGENT_IDS.includes(domain) ? domain : "liability",
    severity: never ? "red" : "amber",
    condition: description,
    keywords,
    patterns: keywords.slice(0, 4).map((token) => escapeRegex(token)),
  };
}

export async function compilePlaybookRule(text: string): Promise<Omit<Rule, "id" | "enabled">> {
  const fallback = compileRuleHeuristic(text);
  if (!hasLiveLlm()) return fallback;
  try {
    const compiled = await completeJson({
      role: "compiler",
      system: compilerSystemPrompt(),
      user: compilerUserPrompt(text),
      schema: compiledRuleSchema,
      maxTokens: 500,
    });
    return compiled;
  } catch {
    return fallback;
  }
}
