import { MODELS, TOKEN_CAPS } from "@/config/agents.config";

type ChatArgs = {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
};

export async function grokChat(args: ChatArgs): Promise<string> {
  const key = process.env.XAI_API_KEY?.trim();
  if (!key) throw new Error("XAI_API_KEY is not set");

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: args.model || process.env.XAI_MODEL?.trim() || MODELS.supervisor,
      messages: args.messages,
      temperature: args.temperature ?? 0.2,
      max_tokens: args.maxTokens ?? TOKEN_CAPS.supervisorOutput,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(40_000),
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`xAI ${response.status}: ${body.slice(0, 240)}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return json.choices?.[0]?.message?.content || "";
}
