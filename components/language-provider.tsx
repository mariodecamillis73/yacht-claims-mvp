"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { LANGUAGES, translations, Language, TranslationKey } from "@/lib/i18n";
import { translateText } from "@/lib/ui-text";
const Context = createContext({
  language: "en" as Language,
  tr: (text: string, values?: Record<string, string | number>) =>
    translateText(text, "en", values),
  t: (key: TranslationKey) => translations.en[key],
});
export const useLanguage = () => useContext(Context);
export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<Language>("en");
  useEffect(() => {
    const saved = localStorage.getItem("yy-language");
    if (saved && Object.hasOwn(LANGUAGES, saved))
      setLanguage(saved as Language);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return (
    <Context.Provider
      value={{
        language,
        t: (key) => translations[language][key],
        tr: (text, values) => translateText(text, language, values),
      }}
    >
      <div className="language-bar">
        <label>
          {translations[language].language}{" "}
          <select
            aria-label="Language / Lingua"
            value={language}
            onChange={(e) => {
              const value = e.target.value as Language;
              setLanguage(value);
              localStorage.setItem("yy-language", value);
            }}
          >
            {Object.entries(LANGUAGES).map(([key, label]) => (
              <option value={key} key={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {children}
    </Context.Provider>
  );
}
