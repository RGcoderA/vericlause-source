import { MODELS } from "@/config/agents.config";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function geminiChat(args: {
  messages: ChatMessage[];
  maxTokens?: number;
  model?: string;
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  const model = args.model || process.env.GEMINI_MODEL?.trim() || MODELS.gemini;
  const system = args.messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");
  const contents = args.messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: args.maxTokens ?? 900,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(40_000),
    }
  );
  if (!response.ok) {
    const error = new Error(`Gemini ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  const json = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = json.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  if (!text.trim()) throw new Error("Gemini returned an empty response");
  return text;
}
