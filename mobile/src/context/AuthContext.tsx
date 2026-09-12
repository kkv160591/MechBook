import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react"

import AsyncStorage from
  "@react-native-async-storage/async-storage"

import { useTranslation } from "./LanguageContext"

const AuthContext =
  createContext<any>(null)

export function AuthProvider({
  children,
}: any) {
  const [user, setUser] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  const {
    syncLanguageAfterAuth,
  } = useTranslation()

  useEffect(() => {
    restoreSession()
  }, [])

  const restoreSession =
    async () => {
      try {
        const userData =
          await AsyncStorage.getItem(
            "user"
          )

        if (userData) {
          setUser(
            JSON.parse(userData)
          )

          /*
           * User is already authenticated.
           *
           * Now it is safe to synchronize
           * language with backend.
           */
          await syncLanguageAfterAuth()
        } else {
          /*
           * IMPORTANT:
           *
           * Do NOT call any language API here.
           *
           * LanguageProvider already loaded
           * the local language.
           */
          setUser(null)
        }
      } catch (error) {
        console.log(
          "Restore session error:",
          error
        )

        setUser(null)
      } finally {
        setLoading(false)
      }
    }

  const login = async (
    userData: any,
    token: string
  ) => {
    await AsyncStorage.setItem(
      "user",
      JSON.stringify(userData)
    )

    await AsyncStorage.setItem(
      "token",
      token
    )

    setUser(userData)

    /*
     * Authentication has succeeded.
     *
     * Now synchronize language.
     */
    await syncLanguageAfterAuth()
  }

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "user",
        "token",
      ])

      setUser(null)
    } catch (error) {
      console.log(
        "Logout error:",
        error
      )

      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth =
  () => useContext(AuthContext)