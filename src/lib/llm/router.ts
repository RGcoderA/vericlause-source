import { MODELS } from "@/config/agents.config";
import { hasGeminiKey, hasGrokKey, hasOpenRouterKey } from "@/lib/env";
import { geminiChat } from "./gemini";
import { grokChat } from "./grok";
import { openRouterChat } from "./openrouter";

type Role = "specialist" | "compiler" | "supervisor" | "redline" | "translate";

type ChatArgs = {
  role: Role;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  maxTokens?: number;
};

type Provider = "gemini" | "grok" | "openrouter";

let routedModel = "";

export function lastRoutedModel(): string {
  return routedModel;
}

export function chatProviders(): Provider[] {
  const providers: Provider[] = [];
  if (hasGeminiKey()) providers.push("gemini");
  if (hasGrokKey()) providers.push("grok");
  if (hasOpenRouterKey()) providers.push("openrouter");
  return providers;
}

function isRateLimit(error: unknown): boolean {
  const status = (error as { status?: number }).status;
  return status === 429 || status === 502 || status === 503;
}

function grokModel(role: Role): string {
  return role === "redline" ? MODELS.redline : MODELS.supervisor;
}

function openRouterModel(role: Role): string {
  return role === "compiler" ? MODELS.compiler : MODELS.specialist;
}

export async function routedChat(args: ChatArgs): Promise<string> {
  const errors: unknown[] = [];

  if (hasGeminiKey()) {
    try {
      const text = await geminiChat({ messages: args.messages, maxTokens: args.maxTokens });
      routedModel = process.env.GEMINI_MODEL?.trim() || MODELS.gemini;
      return text;
    } catch (error) {
      errors.push(error);
    }
  }

  if (hasGrokKey()) {
    try {
      const text = await grokChat({
        messages: args.messages,
        maxTokens: args.maxTokens,
        model: grokModel(args.role),
      });
      routedModel = process.env.XAI_MODEL?.trim() || grokModel(args.role);
      return text;
    } catch (error) {
      errors.push(error);
    }
  }

  if (hasOpenRouterKey()) {
    try {
      const text = await openRouterChat({
        messages: args.messages,
        maxTokens: args.maxTokens,
        model: openRouterModel(args.role),
      });
      routedModel = openRouterModel(args.role);
      return text;
    } catch (error) {
      if (!isRateLimit(error)) {
        errors.push(error);
      } else {
        const text = await openRouterChat({
          messages: args.messages,
          maxTokens: args.maxTokens,
          model: MODELS.fallback,
        });
        routedModel = MODELS.fallback;
        return text;
      }
    }
  }

  const last = errors.at(-1);
  if (last instanceof Error) throw last;
  throw new Error("No LLM provider configured");
}
