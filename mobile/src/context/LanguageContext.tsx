import React, { createContext, useContext, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { translations } from "../i18n/translations"
import { getLanguageSettings } from "../services/settingsService"

export type LanguageKey = keyof typeof translations

interface LanguageContextType {
  language: LanguageKey
  changeLanguage: (lang: LanguageKey) => void
  fetchUserLanguage: () => Promise<void>
  t: (keyPath: string) => string
}

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType)

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // Always default to "en" for pre-login screens
  const [language, setLanguage] = useState<LanguageKey>("en")

  // Call this ONLY post-login / post-auth initialization
  const fetchUserLanguage = async () => {
    try {
      const response = await getLanguageSettings()
      
      // 1. Check if DB returns a valid language setting
      if (response?.language && translations[response.language as LanguageKey]) {
        const remoteLang = response.language as LanguageKey
        setLanguage(remoteLang)
        await AsyncStorage.setItem("user_language", remoteLang)
        return
      }
    } catch (error) {
      console.log("DB language fetch failed, falling back to local storage:", error)
    }

    // 2. Fallback: Read local storage if DB has no setting or request failed
    try {
      const savedLang = await AsyncStorage.getItem("user_language")
      if (savedLang && translations[savedLang as LanguageKey]) {
        setLanguage(savedLang as LanguageKey)
        return
      }
    } catch (error) {
      console.log("Error reading local storage language:", error)
    }

    // 3. Fallback: Default to "en"
    setLanguage("en")
  }

  // Purely updates UI state & local storage (used by dropdowns or manual switches)
  const changeLanguage = (lang: LanguageKey) => {
    setLanguage(lang)
    AsyncStorage.setItem("user_language", lang)
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
    <LanguageContext.Provider value={{ language, changeLanguage, fetchUserLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useTranslation = () => useContext(LanguageContext)