"use client";

import { useSiteLanguage } from "./language-provider";

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useSiteLanguage();
  return (
    <button
      type="button"
      className="language-switcher"
      onClick={toggleLanguage}
      aria-label={language === "en" ? "Switch language to Arabic" : "Switch language to English"}
      aria-live="polite"
    >
      {language === "en" ? "العربية" : "English"}
    </button>
  );
}
