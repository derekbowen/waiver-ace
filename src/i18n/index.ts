import { createContext, useContext } from "react";
import { en, type TranslationKeys } from "./en";
import { es } from "./es";

export type Locale = "en" | "es";

const translations: Record<Locale, TranslationKeys> = { en, es };

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] || en;
}

export const I18nContext = createContext<{ locale: Locale; t: TranslationKeys }>({
  locale: "en",
  t: en,
});

export function useI18n() {
  return useContext(I18nContext);
}

export { en, es };
