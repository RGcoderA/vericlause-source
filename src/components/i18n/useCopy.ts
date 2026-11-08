"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { COPY } from "@/lib/i18n/copy";

export function useCopy() {
  const { language } = useLanguage();
  return COPY[language];
}
