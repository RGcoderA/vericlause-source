const GROK_LANGUAGE: Record<string, string> = {
    en: "en",
    fr: "fr",
    es: "es-ES",
    pt: "pt-BR",
    de: "de",
    zh: "zh",
    hi: "hi",
    ar: "ar-SA",
};

/** Map a review language onto a language code Grok's voice accepts. */
export function grokLanguage(code: string): string {
    const value = code.trim().toLowerCase();
    if (value === "pt-pt") return "pt-PT";
    if (value.startsWith("es-mx")) return "es-MX";
    if (value.startsWith("ar-eg")) return "ar-EG";
    if (value.startsWith("ar-ae")) return "ar-AE";
    const base = value.split("-")[0] || "en";
    return GROK_LANGUAGE[base] ?? "en";
}

export const GROK_VOICE = "rex";

/** Square brackets are speech tags. Contract text that contains them makes the voice call fail. */
export function spokenForVoice(text: string): string {
    return text
        .replace(/\[[^[\]]{0,80}\]/g, " ")
        .replace(/[{}]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/** Short enough that the first sentence starts before the rest of the contract is voiced. */
export const VOICE_CHUNK = 700;

async function readGrokAudio(response: Response): Promise<{ bytes: Uint8Array; type: string } | null> {
    const type = response.headers.get("content-type") || "";
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength < 32) return null;
    const looksJson = type.includes("json") || bytes[0] === 123;
    if (!looksJson) return { bytes, type: type.includes("audio/") ? type : "audio/mpeg" };
    try {
        const json = JSON.parse(new TextDecoder().decode(bytes)) as { audio?: string; content_type?: string };
        if (!json.audio) return null;
        return { bytes: Uint8Array.from(Buffer.from(json.audio, "base64")), type: json.content_type || "audio/mpeg" };
    } catch {
        return { bytes, type: "audio/mpeg" };
    }
}

export async function grokSpeak(text: string, language: string): Promise<{ bytes: Uint8Array; type: string }> {
    const key = process.env.XAI_API_KEY?.trim();
    if (!key) throw new Error("XAI_API_KEY is not set");
    const voice = process.env.XAI_VOICE?.trim() || GROK_VOICE;
    const bodies = [
        {
            text,
            voice_id: voice,
            language: grokLanguage(language),
            text_normalization: true,
            output_format: { codec: "mp3", sample_rate: 24000, bit_rate: 128000 },
        },
        { text, voice_id: voice, language: grokLanguage(language) },
    ];
    let last = "Grok voice did not answer.";
    for (const body of bodies) {
        const response = await fetch("https://api.x.ai/v1/tts", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(55_000),
        });
        if (!response.ok) {
            last = `Grok voice could not start (${response.status}). ${(await response.text()).replace(/xai-[\w-]+/g, "").slice(0, 140)}`;
            if (response.status === 401 || response.status === 403) break;
            continue;
        }
        const audio = await readGrokAudio(response);
        if (audio) return audio;
        last = "Grok voice returned no audio.";
    }
    throw new Error(last);
}