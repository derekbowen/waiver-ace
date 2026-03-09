import { useState, useEffect, ReactNode } from "react";
import { I18nContext, type Locale, getTranslations } from "@/i18n";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = localStorage.getItem("locale");
    if (stored === "en" || stored === "es") return stored;
    const browserLang = navigator.language.slice(0, 2);
    return browserLang === "es" ? "es" : "en";
  });

  useEffect(() => {
    localStorage.setItem("locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  // Expose setLocale on window for the language switcher
  useEffect(() => {
    (window as any).__setLocale = setLocale;
    return () => { delete (window as any).__setLocale; };
  }, []);

  const t = getTranslations(locale);

  return (
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
