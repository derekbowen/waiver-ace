import { createContext, useContext } from "react";
import { en, type TranslationKeys } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { pt } from "./pt";
import { zh } from "./zh";
import { ja } from "./ja";
import { ko } from "./ko";
import { it } from "./it";
import { ar } from "./ar";
import { hi } from "./hi";

export type Locale = "en" | "es" | "fr" | "de" | "pt" | "zh" | "ja" | "ko" | "it" | "ar" | "hi";

export const SUPPORTED_LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
];

const translations: Record<Locale, TranslationKeys> = { en, es, fr, de, pt, zh, ja, ko, it, ar, hi };

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] || en;
}

export const I18nContext = createContext<{ locale: Locale; t: TranslationKeys; setLocale: (l: Locale) => void }>({
  locale: "en",
  t: en,
  setLocale: () => {},
});

export function useI18n() {
  return useContext(I18nContext);
}

export { en, es, fr, de, pt, zh, ja, ko, it, ar, hi };
