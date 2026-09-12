import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

import api from "../services/api"

import { useAuth } from "./AuthContext"

export interface AppSettings {
  gst: any
  invoice: any
  language: any
  backup: any
}

interface SettingsContextType {
  settings: AppSettings | null

  loading: boolean

  refetchSettings:
    () => Promise<void>

  updateGSTSettings:
    (data: any) => Promise<any>

  updateInvoiceSettings:
    (data: any) => Promise<any>

  updateLanguageSettings:
    (data: any) => Promise<any>
}

const SettingsContext =
  createContext<
    SettingsContextType | undefined
  >(undefined)

export const SettingsProvider =
  ({
    children,
  }: {
    children: React.ReactNode
  }) => {
    const {
      user,
      loading: authLoading,
    } = useAuth()

    const [
      settings,
      setSettings,
    ] =
      useState<AppSettings | null>(
        null
      )

    const [
      loading,
      setLoading,
    ] = useState(true)

    const fetchAllSettings =
      async () => {
        /*
         * Don't make settings requests
         * if nobody is authenticated.
         */
        if (!user) {
          setSettings(null)
          setLoading(false)
          return
        }

        try {
          setLoading(true)

          const [
            gstRes,
            invoiceRes,
            langRes,
            backupRes,
          ] =
            await Promise.all([
              api
                .get(
                  "/api/settings/gst"
                )
                .catch(() => ({
                  data: null,
                })),

              api
                .get(
                  "/api/settings/invoice"
                )
                .catch(() => ({
                  data: null,
                })),

              api
                .get(
                  "/api/settings/language"
                )
                .catch(() => ({
                  data: null,
                })),

              api
                .get(
                  "/api/settings/backup"
                )
                .catch(() => ({
                  data: null,
                })),
            ])

          setSettings({
            gst: gstRes.data,
            invoice: invoiceRes.data,
            language: langRes.data,
            backup: backupRes.data,
          })
        } catch (error) {
          console.log(
            "Error loading app settings:",
            error
          )
        } finally {
          setLoading(false)
        }
      }

    /*
     * Wait until AuthContext has finished
     * restoring the session.
     */
    useEffect(() => {
      if (authLoading) {
        return
      }

      fetchAllSettings()
    }, [
      user,
      authLoading,
    ])

    const updateGSTSettings =
      async (data: any) => {
        const response =
          await api.put(
            "/api/settings/gst",
            data
          )

        setSettings(prev =>
          prev
            ? {
                ...prev,
                gst: response.data,
              }
            : prev
        )

        return response.data
      }

    const updateInvoiceSettings =
      async (data: any) => {
        const response =
          await api.put(
            "/api/settings/invoice",
            data
          )

        setSettings(prev =>
          prev
            ? {
                ...prev,
                invoice:
                  response.data,
              }
            : prev
        )

        return response.data
      }

    const updateLanguageSettings =
      async (data: any) => {
        const response =
          await api.put(
            "/api/settings/language",
            data
          )

        setSettings(prev =>
          prev
            ? {
                ...prev,
                language:
                  response.data,
              }
            : prev
        )

        return response.data
      }

    return (
      <SettingsContext.Provider
        value={{
          settings,
          loading,
          refetchSettings:
            fetchAllSettings,
          updateGSTSettings,
          updateInvoiceSettings,
          updateLanguageSettings,
        }}
      >
        {children}
      </SettingsContext.Provider>
    )
  }

export const useSettings =
  () => {
    const context =
      useContext(
        SettingsContext
      )

    if (!context) {
      throw new Error(
        "useSettings must be used within a SettingsProvider"
      )
    }

    return context
  }