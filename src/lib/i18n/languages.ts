export const LANGUAGES = [
  { id: "en", label: "English", name: "English", speech: "en-CA", dir: "ltr" },
  { id: "fr", label: "Français", name: "French", speech: "fr-CA", dir: "ltr" },
  { id: "es", label: "Español", name: "Spanish", speech: "es-ES", dir: "ltr" },
  { id: "pt", label: "Português", name: "Portuguese", speech: "pt-BR", dir: "ltr" },
  { id: "de", label: "Deutsch", name: "German", speech: "de-DE", dir: "ltr" },
  { id: "zh", label: "中文", name: "Chinese", speech: "zh-CN", dir: "ltr" },
  { id: "hi", label: "हिन्दी", name: "Hindi", speech: "hi-IN", dir: "ltr" },
  { id: "ar", label: "العربية", name: "Arabic", speech: "ar", dir: "rtl" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export function languageById(id: string) {
  return LANGUAGES.find((language) => language.id === id);
}

export const SIMPLE_NOTE: Record<LanguageId, string> = {
  en: "Everyday wording. Not legal advice.",
  fr: "Mots de tous les jours. Ce n'est pas un avis juridique.",
  es: "Palabras cotidianas. No es asesoramiento legal.",
  pt: "Palavras do dia a dia. Não é aconselhamento jurídico.",
  de: "Alltägliche Worte. Keine Rechtsberatung.",
  zh: "日常用语。不是法律意见。",
  hi: "आम शब्दों में। यह कानूनी सलाह नहीं है।",
  ar: "كلام يومي. هذه ليست استشارة قانونية.",
};
