import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

import AsyncStorage from "@react-native-async-storage/async-storage"

import { translations } from "../i18n/translations"

import {
  getLanguageSettings,
  updateLanguageSettings,
} from "../services/settingsService"

export type LanguageKey = keyof typeof translations

interface LanguageContextType {
  language: LanguageKey

  changeLanguage: (lang: LanguageKey) => Promise<void>

  fetchUserLanguage: () => Promise<void>

  syncLanguageAfterAuth: () => Promise<void>

  t: (keyPath: string) => string
}

const LanguageContext =
  createContext<LanguageContextType>({} as LanguageContextType)

const LANGUAGE_STORAGE_KEY = "user_language"

const PENDING_LANGUAGE_KEY = "pending_language_sync"

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [language, setLanguage] =
    useState<LanguageKey>("en")

  /*
   * Load local language only.
   *
   * IMPORTANT:
   * This does NOT make an API call.
   */
  useEffect(() => {
    const loadInitialLanguage = async () => {
      try {
        const savedLang =
          await AsyncStorage.getItem(
            LANGUAGE_STORAGE_KEY
          )

        if (
          savedLang &&
          translations[
            savedLang as LanguageKey
          ]
        ) {
          setLanguage(
            savedLang as LanguageKey
          )
        } else {
          setLanguage("en")
        }
      } catch (error) {
        console.log(
          "Error loading local language:",
          error
        )

        setLanguage("en")
      }
    }

    loadInitialLanguage()
  }, [])

  /*
   * Called ONLY after authentication.
   *
   * This reads the language saved on the backend.
   */
  const fetchUserLanguage = async () => {
    try {
      const response =
        await getLanguageSettings()

      const remoteLanguage =
        response?.language as LanguageKey

      if (
        remoteLanguage &&
        translations[remoteLanguage]
      ) {
        setLanguage(remoteLanguage)

        await AsyncStorage.setItem(
          LANGUAGE_STORAGE_KEY,
          remoteLanguage
        )

        return
      }
    } catch (error) {
      console.log(
        "Failed to fetch user language:",
        error
      )
    }

    /*
     * If backend request fails,
     * keep using local language.
     */
    try {
      const savedLang =
        await AsyncStorage.getItem(
          LANGUAGE_STORAGE_KEY
        )

      if (
        savedLang &&
        translations[
          savedLang as LanguageKey
        ]
      ) {
        setLanguage(
          savedLang as LanguageKey
        )

        return
      }
    } catch (error) {
      console.log(
        "Error reading local language:",
        error
      )
    }

    setLanguage("en")
  }

  /*
   * Called when user changes language.
   *
   * This DOES NOT call the backend.
   *
   * We only save locally and mark that
   * the user explicitly selected a language.
   */
  const changeLanguage = async (
    lang: LanguageKey
  ) => {
    if (!translations[lang]) {
      return
    }

    setLanguage(lang)

    await AsyncStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      lang
    )

    /*
     * Remember that this language was
     * explicitly selected and needs to be
     * synchronized after authentication.
     */
    await AsyncStorage.setItem(
      PENDING_LANGUAGE_KEY,
      "true"
    )
  }

  /*
   * This is the important function.
   *
   * Call this AFTER successful login/register.
   */
  const syncLanguageAfterAuth =
    async () => {
      try {
        const pending =
          await AsyncStorage.getItem(
            PENDING_LANGUAGE_KEY
          )

        /*
         * User explicitly selected a language
         * before login.
         *
         * Save that selection to backend.
         */
        if (pending === "true") {
          const selectedLanguage =
            await AsyncStorage.getItem(
              LANGUAGE_STORAGE_KEY
            )

          const validLanguage =
            selectedLanguage &&
            translations[
              selectedLanguage as LanguageKey
            ]
              ? (selectedLanguage as LanguageKey)
              : "en"

          const response =
            await updateLanguageSettings({
              language: validLanguage,
            })

          const savedLanguage =
            (response?.language ||
              validLanguage) as LanguageKey

          if (
            translations[savedLanguage]
          ) {
            setLanguage(savedLanguage)

            await AsyncStorage.setItem(
              LANGUAGE_STORAGE_KEY,
              savedLanguage
            )
          }

          /*
           * Important:
           * Do not repeat this PUT on the next login.
           */
          await AsyncStorage.removeItem(
            PENDING_LANGUAGE_KEY
          )

          return
        }

        /*
         * User did NOT explicitly choose a language
         * before login.
         *
         * Therefore use the language already
         * saved for this account/garage.
         */
        await fetchUserLanguage()
      } catch (error) {
        console.log(
          "Language synchronization failed:",
          error
        )

        /*
         * Don't break login because language
         * synchronization failed.
         */
      }
    }

  const t = (
    keyPath: string
  ): string => {
    const keys =
      keyPath.split(".")

    let current: any =
      translations[language] ||
      translations["en"]

    for (const key of keys) {
      if (
        current &&
        current[key] !== undefined
      ) {
        current = current[key]
      } else {
        let fallback: any =
          translations["en"]

        for (const k of keys) {
          fallback =
            fallback?.[k]
        }

        return (
          fallback || keyPath
        )
      }
    }

    return current
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        fetchUserLanguage,
        syncLanguageAfterAuth,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export const useTranslation =
  () => useContext(LanguageContext)