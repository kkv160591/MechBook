import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react"

import AsyncStorage from "@react-native-async-storage/async-storage"

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: any) {

  const [user, setUser] = useState(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    restoreSession()
  }, [])

  const restoreSession = async () => {

    try {

      const userData =
        await AsyncStorage.getItem("user")

      if (userData) {
        setUser(JSON.parse(userData))
      }

    } catch (error) {
      console.log(error)
    }

    setLoading(false)

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
}

  const logout = async () => {

    console.log("logout() called")
  try {
    await AsyncStorage.multiRemove([
      "user",
      "token"
    ])

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

export const useAuth = () =>
  useContext(AuthContext)