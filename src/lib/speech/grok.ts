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

/** Short enough that the first sentence starts before the rest of the contract is voiced. */
export const VOICE_CHUNK = 700;
/** Square brackets are speech tags. Contract text that contains them makes the voice call fail. */
export function spokenForVoice(text: string): string {
    return text
        .replace(/\[[^[\]]{0,80}\]/g, " ")
        .replace(/[{}]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}