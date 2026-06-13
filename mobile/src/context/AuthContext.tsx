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

    setUser(userData)

    await AsyncStorage.setItem(
      "user",
      JSON.stringify(userData)
    )

    await AsyncStorage.setItem(
      "token",
      token
    )

  }

  const logout = async () => {

    setUser(null)

    await AsyncStorage.removeItem("user")

    await AsyncStorage.removeItem("token")

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