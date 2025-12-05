'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthUser, AuthResponse } from '@/lib/auth-types'
import { ClientAuthService } from '@/lib/client-auth-service'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string, captchaAnswer?: string) => Promise<{ error: any | null }>
  signIn: (email: string, password: string, captchaAnswer?: string) => Promise<{ error: any | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any | null }>
  updateUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token in localStorage on mount
    const initializeAuth = async () => {
      try {
        const token = ClientAuthService.getToken()
        if (token) {
          console.log('AuthContext: Found token, verifying...')
          const verifiedUser = await ClientAuthService.verifyToken(token)
          if (verifiedUser) {
            console.log('AuthContext: Token valid, setting user:', verifiedUser.email)
            setUser(verifiedUser)
          } else {
            console.log('AuthContext: Token invalid, removing...')
            ClientAuthService.signOut()
          }
        }
      } catch (error) {
        console.error('AuthContext: Error during initialization:', error)
        ClientAuthService.signOut()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const signUp = async (email: string, password: string, fullName?: string, captchaAnswer?: string) => {
    try {
      console.log('AuthContext: Starting signup process')
      setLoading(true)
      
      const result = await ClientAuthService.signUp(email, password, fullName, captchaAnswer)

      if (result.error) {
        console.error('AuthContext: Signup failed:', result.error)
        return { error: result.error }
      }

      if (result.user) {
        console.log('AuthContext: Signup successful, setting user:', result.user.email)
        setUser(result.user)
      }

      return { error: null }
    } catch (error) {
      console.error('AuthContext: Unexpected signup error:', error)
      return { error: 'Kayıt sırasında beklenmedik bir hata oluştu' }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string, captchaAnswer?: string) => {
    try {
      console.log('AuthContext: Starting signin process')
      setLoading(true)
      
      const result = await ClientAuthService.signIn(email, password, captchaAnswer)

      if (result.error) {
        console.error('AuthContext: Signin failed:', result.error)
        return { error: result.error }
      }

      if (result.user) {
        console.log('AuthContext: Signin successful, setting user:', result.user.email)
        setUser(result.user)
      }

      return { error: null }
    } catch (error) {
      console.error('AuthContext: Unexpected signin error:', error)
      return { error: 'Giriş sırasında beklenmedik bir hata oluştu' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log('AuthContext: Signing out user')
      ClientAuthService.signOut()
      setUser(null)
    } catch (error) {
      console.error('AuthContext: Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      console.log('AuthContext: Password reset requested for:', email)
      const result = await ClientAuthService.resetPassword(email)
      return { error: result.error }
    } catch (error) {
      console.error('AuthContext: Password reset error:', error)
      return { error: 'Şifre sıfırlama işlemi başarısız oldu' }
    }
  }

  const updateUser = async () => {
    try {
      console.log('AuthContext: Updating user data')
      const token = ClientAuthService.getToken()
      if (token) {
        const verifiedUser = await ClientAuthService.verifyToken(token)
        if (verifiedUser) {
          setUser(verifiedUser)
        }
      }
    } catch (error) {
      console.error('AuthContext: Error updating user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUser
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