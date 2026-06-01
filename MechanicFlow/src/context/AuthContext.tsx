// AuthContext.tsx

import {
  createContext,
  useContext,
  useState
} from "react"

type UserType = {
  role: "owner" | "worker"
} | null

type AuthContextType = {
  user: UserType
  login: (
    role: "owner" | "worker"
  ) => void
  logout: () => void
}

const AuthContext =
  createContext<AuthContextType | null>(null)

export function AuthProvider({
  children
}: any) {

  const [user, setUser] =
    useState<UserType>(null)

  const login = (
    role: "owner" | "worker"
  ) => {

    setUser({
      role
    })

  }

  const logout = () => {
    setUser(null)
  }

  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>

  )

}

export function useAuth() {

  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    )
  }

  return context

}