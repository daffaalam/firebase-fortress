import "server-only";

import { headers } from "next/headers";
import en from "./en.json";
import id from "./id.json";

type Dictionary = typeof en;
type Language = "en" | "id";

const dictionaries = {
  en,
  id,
};

function getLanguage(): Language {
  const acceptLanguage = headers().get("accept-language") || "en";
  if (acceptLanguage.startsWith("id")) {
    return "id";
  }
  return "en";
}

/**
 * Provides a translator function on the server side.
 * This should be used in server components and server actions.
 */
class ServerTranslator {
  private dictionary: Dictionary;
  private lang: Language;

  constructor() {
    this.lang = getLanguage();
    this.dictionary = dictionaries[this.lang];
  }

  public getLanguage(): Language {
    return this.lang;
  }

  public get = (key: keyof Dictionary, replacements: Record<string, string> = {}): string => {
    let translation = this.dictionary[key] || en[key] || String(key);
    for (const placeholder in replacements) {
      translation = translation.replace(`{{${placeholder}}}`, replacements[placeholder]);
    }
    return translation;
  };
}

export const Locales = {
  /**
   * Retrieves the translator function for the current server-side request language.
   * Use this in Server Components or Server Actions.
   */
  get: () => {
    const t = new ServerTranslator();
    return t.get;
  },
  getLanguage: () => {
    const t = new ServerTranslator();
    return t.getLanguage();
  },
  /**
   * Retrieves a static string. Useful for metadata where hooks are not available.
   * This might not be the most accurate, as it doesn't have request context.
   */
  getStatic: (key: keyof Dictionary): string => {
    // This is a simplified version for static generation, may not be accurate
    // depending on the user's browser language.
    return en[key] || String(key);
  },
};
