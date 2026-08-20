import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTranslation } from "./LanguageContext" // Import translation context

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { fetchUserLanguage } = useTranslation() // Consume language trigger

  useEffect(() => {
    restoreSession()
  }, [])

  const restoreSession = async () => {
    try {
      const userData = await AsyncStorage.getItem("user")

      if (userData) {
        setUser(JSON.parse(userData))
        // Trigger DB/storage language sync on app boot if session exists
        await fetchUserLanguage()
      } else {
        // Run fallback language check even for unauthenticated users
        await fetchUserLanguage()
      }
    } catch (error) {
      console.log("Restore session error:", error)
      setUser(null)
      await fetchUserLanguage()
    } finally {
      setLoading(false)
    }
  }

  const login = async (userData: any, token: string) => {
    await AsyncStorage.setItem("user", JSON.stringify(userData))
    await AsyncStorage.setItem("token", token)
    setUser(userData)

    // Trigger language sync immediately after login
    await fetchUserLanguage()
  }

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["user", "token"])
      setUser(null)
    } catch (error) {
      console.log("Logout error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)