import { MODELS, TOKEN_CAPS } from "@/config/agents.config";

type ChatArgs = {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
};

export async function openRouterChat(args: ChatArgs): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://vericlause.local",
      "X-Title": "VeriClause",
    },
    body: JSON.stringify({
      model: args.model || MODELS.specialist,
      messages: args.messages,
      temperature: args.temperature ?? 0.1,
      max_tokens: args.maxTokens ?? TOKEN_CAPS.specialistOutput,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(40_000),
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`OpenRouter ${response.status}: ${body.slice(0, 240)}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return json.choices?.[0]?.message?.content || "";
}
