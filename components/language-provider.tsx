"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

type SiteLanguage = "en" | "ar";
type LanguageContextValue = { language: SiteLanguage; toggleLanguage: () => void };

const LanguageContext = createContext<LanguageContextValue | null>(null);
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): SiteLanguage {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem("aht-site-language") === "ar" ? "ar" : "en";
}

function getServerSnapshot(): SiteLanguage {
  return "en";
}

function setSiteLanguage(language: SiteLanguage) {
  window.localStorage.setItem("aht-site-language", language);
  listeners.forEach((listener) => listener());
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const value = useMemo(() => ({
    language,
    toggleLanguage: () => setSiteLanguage(language === "en" ? "ar" : "en")
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
