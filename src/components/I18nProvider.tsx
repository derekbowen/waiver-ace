import { useState, useEffect, ReactNode } from "react";
import { I18nContext, type Locale, getTranslations, SUPPORTED_LOCALES } from "@/i18n";

const LOCALE_CODES = SUPPORTED_LOCALES.map((l) => l.code);

function isValidLocale(v: string | null): v is Locale {
  return !!v && LOCALE_CODES.includes(v as Locale);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    // 1. Check URL param
    const urlLang = new URLSearchParams(window.location.search).get("lang");
    if (isValidLocale(urlLang)) return urlLang;

    // 2. Check localStorage
    const stored = localStorage.getItem("locale");
    if (isValidLocale(stored)) return stored;

    // 3. Browser language
    const browserLang = navigator.language.slice(0, 2);
    if (isValidLocale(browserLang)) return browserLang;

    return "en";
  });

  useEffect(() => {
    localStorage.setItem("locale", locale);
    document.documentElement.lang = locale;
    // Set RTL for Arabic
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const t = getTranslations(locale);

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}
