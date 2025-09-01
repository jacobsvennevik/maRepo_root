import { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '@/app/(auth)/services/auth'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
  login: (credentials: any) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authenticated = AuthService.isAuthenticated()
        console.log('🔐 AuthContext: Checking auth, result:', authenticated)
        setIsAuthenticated(authenticated)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Check auth on mount
    checkAuth()

    // Listen for storage changes (e.g., when tokens are updated/removed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'refresh_token') {
        console.log('🔐 AuthContext: Storage changed, rechecking auth')
        checkAuth()
      }
    }

    // Listen for custom events (e.g., when login/logout happens)
    const handleAuthChange = () => {
      console.log('🔐 AuthContext: Auth change event, rechecking auth')
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('auth-change', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  const login = async (credentials: any) => {
    setIsLoading(true)
    try {
      console.log('🔐 AuthContext: Login attempt')
      await AuthService.login(credentials)
      console.log('🔐 AuthContext: Login successful, setting isAuthenticated to true')
      setIsAuthenticated(true)
    } catch (error) {
      console.error('🔐 AuthContext: Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    AuthService.logout()
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 