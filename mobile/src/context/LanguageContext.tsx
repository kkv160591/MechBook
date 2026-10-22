// LanguageContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { translations } from "../i18n/translations"
import { updateLanguageSettings } from "../services/settingsService"

export type LanguageKey = keyof typeof translations

interface LanguageContextType {
  language: LanguageKey
  changeLanguage: (lang: LanguageKey) => Promise<void>
  syncLanguageAfterAuth: () => Promise<void>
  t: (keyPath: string) => string
}

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType)

const LANGUAGE_STORAGE_KEY = "user_language"
const PENDING_LANGUAGE_KEY = "pending_language_sync"

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [language, setLanguage] = useState<LanguageKey>("en")

  useEffect(() => {
    const loadInitialLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
        if (savedLang && translations[savedLang as LanguageKey]) {
          setLanguage(savedLang as LanguageKey)
        } else {
          setLanguage("en")
        }
      } catch (error) {
        setLanguage("en")
      }
    }
    loadInitialLanguage()
  }, [])

  const changeLanguage = async (lang: LanguageKey) => {
    if (!translations[lang]) return

    setLanguage(lang)
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    await AsyncStorage.setItem(PENDING_LANGUAGE_KEY, "true")
  }

  const syncLanguageAfterAuth = async () => {
    try {
      const pending = await AsyncStorage.getItem(PENDING_LANGUAGE_KEY)
      if (pending === "true") {
        const selectedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
        const validLanguage = selectedLanguage && translations[selectedLanguage as LanguageKey] 
          ? (selectedLanguage as LanguageKey) 
          : "en"

        const response = await updateLanguageSettings({ language: validLanguage })
        const savedLanguage = (response?.language || validLanguage) as LanguageKey

        if (translations[savedLanguage]) {
          setLanguage(savedLanguage)
          await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, savedLanguage)
        }
        await AsyncStorage.removeItem(PENDING_LANGUAGE_KEY)
      }
    } catch (error) {
      console.log("Language synchronization failed:", error)
    }
  }

  const t = (keyPath: string): string => {
    const keys = keyPath.split(".")
    let current: any = translations[language] || translations["en"]

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key]
      } else {
        let fallback: any = translations["en"]
        for (const k of keys) {
          fallback = fallback?.[k]
        }
        return fallback || keyPath
      }
    }
    return current
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        syncLanguageAfterAuth,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export const useTranslation = () => useContext(LanguageContext)