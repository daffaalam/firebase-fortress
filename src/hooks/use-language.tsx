"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

type Language = "en" | "id";

const translations = { en, id };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof en, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Set language from localStorage or browser settings on initial load
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && ["en", "id"].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      const browserLang = navigator.language.split("-")[0];
      setLanguageState(browserLang === "en" ? "en" : "id");
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = useCallback(
    (key: keyof typeof id, replacements: Record<string, string> = {}) => {
      let translation = translations[language][key] || translations["en"][key] || key;
      for (const placeholder in replacements) {
        translation = translation.replace(`{{${placeholder}}}`, replacements[placeholder]);
      }
      return translation;
    },
    [language],
  );

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
