"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import id from "@/locales/id.json";
import en from "@/locales/en.json";

type Language = "id" | "en";

const translations = { id, en };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof id, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id");

  useEffect(() => {
    // Set language from localStorage or browser settings on initial load
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && ["id", "en"].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      const browserLang = navigator.language.split("-")[0];
      setLanguageState(browserLang === "id" ? "id" : "en");
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
