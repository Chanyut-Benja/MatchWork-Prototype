import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const LANGUAGE_STORAGE_KEY = 'matchwork_language';
const LanguageContext = createContext(null);

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'th';
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === 'en' ? 'en' : 'th';
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((nextLang) => {
    setLanguageState(nextLang === 'en' ? 'en' : 'th');
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'th' ? 'en' : 'th'));
  }, []);

  const t = useCallback(
    (thText, enText) => (language === 'en' ? enText : thText),
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
