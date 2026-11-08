import { TOKEN_CAPS } from "@/config/agents.config";
import { routedChat } from "@/lib/llm/router";
import { specialistFindingSchema, specialistOutputSchema } from "@/lib/playbook/rule-schema";
import type { z } from "zod";

export function parseJsonPayload(raw: string): unknown {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model did not return JSON");
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

export async function completeJson<T>(args: {
  role: "specialist" | "compiler" | "supervisor" | "redline";
  system: string;
  user: string;
  schema: z.ZodType<T>;
  maxTokens?: number;
}): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const content = await routedChat({
        role: args.role,
        maxTokens: args.maxTokens ?? TOKEN_CAPS.specialistOutput,
        messages: [
          { role: "system", content: args.system },
          {
            role: "user",
            content:
              attempt === 0
                ? args.user
                : `${args.user}\n\nYour previous reply was not valid JSON. Reply with JSON only.`,
          },
        ],
      });
      const parsed = parseJsonPayload(content);
      return args.schema.parse(parsed);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("JSON completion failed");
}

export { specialistFindingSchema, specialistOutputSchema };
