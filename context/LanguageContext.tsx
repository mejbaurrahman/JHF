import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// Maintain backward compatibility for existing components
export type Language = 'EN' | 'BN';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const currentLang = i18n.resolvedLanguage || 'en';
    const newLang = currentLang.startsWith('en') ? 'bn' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Bridge the i18n language code ('en', 'bn') to the app's expected type ('EN', 'BN')
  const language: Language = (i18n.resolvedLanguage && i18n.resolvedLanguage.startsWith('bn')) ? 'BN' : 'EN';

  // Wrapper for t function to handle type safety if strictly needed, otherwise pass through
  const tWrapper = (key: string) => t(key);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t: tWrapper }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};