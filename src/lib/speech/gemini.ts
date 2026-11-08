import { pcmRate, pcmToWav } from "@/lib/speech/wav";

const GEMINI_LANGUAGE: Record<string, string> = {
    en: "en-US",
    fr: "fr-FR",
    es: "es-ES",
    pt: "pt-BR",
    de: "de-DE",
    zh: "cmn-CN",
    hi: "hi-IN",
    ar: "ar-EG",
};

const DEFAULT_MODEL = "gemini-2.5-flash-preview-tts";
const FALLBACK_MODEL = "gemini-3.1-flash-tts-preview";

export function geminiLanguage(code: string): string {
    const value = code.trim().toLowerCase();
    if (value.startsWith("pt-pt")) return "pt-PT";
    if (value.startsWith("es-mx")) return "es-MX";
    if (value.startsWith("zh")) return "cmn-CN";
    const base = value.split("-")[0] || "en";
    return GEMINI_LANGUAGE[base] ?? "en-US";
}

function models(): string[] {
    const chosen = process.env.GEMINI_TTS_MODEL?.trim() || DEFAULT_MODEL;
    return chosen === FALLBACK_MODEL ? [chosen] : [chosen, FALLBACK_MODEL];
}

function audioFromPart(part: { inlineData?: { data?: string; mimeType?: string } }): { bytes: Uint8Array; type: string } | null {
    const encoded = part.inlineData?.data;
    if (!encoded) return null;
    const raw = Uint8Array.from(Buffer.from(encoded, "base64"));
    if (raw.byteLength < 32) return null;
    const mime = part.inlineData?.mimeType || "";
    if (/mpeg|mp3/i.test(mime)) return { bytes: raw, type: "audio/mpeg" };
    if (/wav/i.test(mime)) return { bytes: raw, type: "audio/wav" };
    return { bytes: pcmToWav(raw, pcmRate(mime)), type: "audio/wav" };
}

async function requestModel(text: string, language: string, model: string, key: string): Promise<Response> {
    const voice = process.env.GEMINI_VOICE?.trim() || "Kore";
    return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key,
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text }] }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    languageCode: geminiLanguage(language),
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
                },
            },
        }),
        signal: AbortSignal.timeout(55_000),
    });
}

export async function geminiSpeak(text: string, language: string): Promise<{ bytes: Uint8Array; type: string }> {
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) throw new Error("GEMINI_API_KEY is not set");
    let last = "Gemini voice did not answer.";
    for (const model of models()) {
        const response = await requestModel(text, language, model, key);
        if (response.status === 404) {
            last = `Gemini voice model ${model} is not available.`;
            continue;
        }
        if (!response.ok) {
            const detail = (await response.text()).replace(/AIza[\w-]+|AQ\.[\w.-]+/g, "").slice(0, 140);
            throw new Error(`Gemini voice could not start (${response.status}). ${detail}`);
        }
        const json = (await response.json()) as {
            candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[];
        };
        const parts = json.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            const audio = audioFromPart(part);
            if (audio) return audio;
        }
        last = "Gemini voice returned no audio.";
    }
    throw new Error(last);
}