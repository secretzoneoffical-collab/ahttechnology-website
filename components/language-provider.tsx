"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type SiteLanguage = "en" | "ar";
type LanguageContextValue = { language: SiteLanguage; toggleLanguage: () => void };

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<SiteLanguage>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("aht-site-language");
    if (saved === "ar" || saved === "en") setLanguage(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("aht-site-language", language);
  }, [language]);

  const value = useMemo(() => ({
    language,
    toggleLanguage: () => setLanguage((current) => current === "en" ? "ar" : "en")
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      <div data-site-locale={language}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useSiteLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useSiteLanguage must be used inside LanguageProvider");
  return context;
}
