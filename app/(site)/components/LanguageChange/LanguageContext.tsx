import { createContext, useState, useContext, ReactNode, useEffect } from 'react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '@/locale/en.json'
import zh from '@/locale/zh.json'

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    zh: {
      translation: zh,
    },
  },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false,
  }
})

type Locale = 'en' | 'zh'
type Translations = typeof en

interface LanguageContextType {
  locale: Locale;
  translations: Translations;
  changeLanguage: (locale: Locale) => void;
}

const locales = { en, zh }
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('zh')
  const changeLanguage = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('language', newLocale);
    i18n.changeLanguage(newLocale)
  }

  useEffect(() => {
    const savedLocale = localStorage.getItem('language') as Locale | null
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'zh')) {
      setLocale(savedLocale)
      i18n.changeLanguage(savedLocale)
    } else {
      localStorage.setItem('language', 'zh');
      i18n.changeLanguage('zh');
    }
  }, [])

  const value = {
    locale,
    translations: locales[locale],
    changeLanguage,
  }

  return (
    <LanguageContext.Provider value={value as LanguageContextType}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}