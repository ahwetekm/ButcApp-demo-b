'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  username: string
  email: string
  name?: string
  role: string
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string, captchaAnswer?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Token'ı cookie'e set etme fonksiyonu
  const setTokenCookie = (tokenValue: string) => {
    document.cookie = `auth-token=${tokenValue}; path=/; max-age=${24 * 60 * 60}; samesite=lax`
  }

  // Token'ı her iki yere de set etme fonksiyonu
  const setTokenBoth = (tokenValue: string) => {
    localStorage.setItem('adminToken', tokenValue)
    setTokenCookie(tokenValue)
  }

  useEffect(() => {
    // Sayfa yüklendiğinde tüm storage'lardan token ve user bilgisini al
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1]
    const storedToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')
    const storedUser = localStorage.getItem('adminUser')

    console.log('AdminAuthContext: Checking tokens...')
    console.log('Cookie token:', cookieToken ? 'Found' : 'Not found')
    console.log('Stored token:', storedToken ? 'Found' : 'Not found')
    console.log('Stored user:', storedUser ? 'Found' : 'Not found')

    // Use cookie token first, fallback to stored token
    const token = cookieToken || storedToken
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setToken(token)
        setUser(user)
        console.log('AdminAuthContext: Authentication restored successfully')
        
        // Tüm storage'lara token'ı kaydet
        localStorage.setItem('adminToken', token)
        sessionStorage.setItem('adminToken', token)
        setTokenCookie(token)
        console.log('AdminAuthContext: Token synced to all storages')
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('adminUser')
        localStorage.removeItem('adminToken')
        sessionStorage.removeItem('adminToken')
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    } else {
      console.log('AdminAuthContext: No authentication data found')
    }
    setIsLoading(false)
  }, [])

  // Router events ile token persist sağla
  useEffect(() => {
    if (token) {
      // Her route değişiminde token'ı yeniden set et
      const handleRouteChange = () => {
        setTokenCookie(token)
        console.log('AdminAuthContext: Token reset on route change')
      }

      // Next.js 13+ için router events
      if (typeof window !== 'undefined' && 'navigation' in window) {
        window.navigation.addEventListener('navigate', handleRouteChange)
        return () => {
          window.navigation.removeEventListener('navigate', handleRouteChange)
        }
      }
      
      // Interval ile token'ı güncel tut
      const interval = setInterval(() => {
        setTokenCookie(token)
      }, 5000) // 5 saniyede bir
      
      return () => {
        clearInterval(interval)
      }
    }
  }, [token])

  const login = async (username: string, password: string, captchaAnswer?: string) => {
    try {
<<<<<<< HEAD
      // Force absolute URL for client-side requests
      const finalUrl = `${window.location.origin}/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/auth`;
      console.log('Final URL:', finalUrl);
      
      const response = await fetch(finalUrl, {
=======
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const apiPath = '/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/auth';
      const url = apiUrl ? `${apiUrl}${apiPath}` : apiPath;
      console.log('Attempting to fetch from URL:', url); // Debugging line
      const response = await fetch(url, {
>>>>>>> 9fa9ca9c52f2e9774602fc60899a1b0bf060871b
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, captchaAnswer: captchaAnswer?.trim() || null })
      });

      const data = await response.json()
<<<<<<< HEAD
      console.log('API Response data:', data);

      if (data.success) {
        const { user: userData, token } = data.data
        console.log('Login successful, setting tokens and user data');
=======

      if (data.success) {
        const { user: userData, token } = data.data
>>>>>>> 9fa9ca9c52f2e9774602fc60899a1b0bf060871b
        
        // Token ve user bilgisini state'e ve tüm storage'lara kaydet
        setToken(token)
        setUser(userData)
        localStorage.setItem('adminUser', JSON.stringify(userData))
        localStorage.setItem('adminToken', token)
        sessionStorage.setItem('adminToken', token)
        
        // Cookie'ye token'ı kaydet (middleware için)
        setTokenCookie(token)
<<<<<<< HEAD
        
        console.log('Token set in cookie:', document.cookie.includes('auth-token'));
        console.log('User data stored:', !!localStorage.getItem('adminUser'));
        console.log('Token stored:', !!localStorage.getItem('adminToken'));

        return { success: true, token: token }
      } else {
        console.log('Login failed:', data.error);
=======

        return { success: true }
      } else {
>>>>>>> 9fa9ca9c52f2e9774602fc60899a1b0bf060871b
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Sunucu ile bağlantı kurulamadı' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminToken')
    sessionStorage.removeItem('adminToken')
    
    // Cookie'den token'ı sil
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    router.push('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login')
  }

  const isAuthenticated = !!user && !!token

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated
      }}
    >
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