"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { languageById, type LanguageId } from "@/lib/i18n/languages";

const STORAGE_KEY = "vericlause-language";

const LanguageContext = createContext<{
  language: LanguageId;
  setLanguage: (language: LanguageId) => void;
} | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageId>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && languageById(stored)) setLanguageState(stored as LanguageId);
  }, []);

  useEffect(() => {
    const item = languageById(language);
    document.documentElement.lang = item?.speech ?? "en";
    document.documentElement.dir = item?.dir ?? "ltr";
  }, [language]);

  function setLanguage(next: LanguageId) {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
