import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { tokenStorage, userStorage } from '@/lib/api'
import type { User } from '@dataroom/types'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing authentication on app load
    const savedToken = tokenStorage.getToken()
    const savedUser = userStorage.get()

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(savedUser)
    }
  }, [])

  const login = (userData: User, userToken: string) => {
    setUser(userData)
    setToken(userToken)
    tokenStorage.setToken(userToken)
    userStorage.set(userData)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    tokenStorage.removeToken()
    userStorage.remove()
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}