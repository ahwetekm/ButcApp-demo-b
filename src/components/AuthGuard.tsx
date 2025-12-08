'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AdminAuthContext'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('AuthGuard: Not authenticated, redirecting to login')
        router.push('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login')
        return
      }

      if (requiredRole && user?.role !== requiredRole) {
        console.log('AuthGuard: Role mismatch, redirecting to dashboard')
        router.push('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/dashboard')
        return
      }
      
      console.log('AuthGuard: Authentication successful')
    }
  }, [isAuthenticated, user, isLoading, router, requiredRole])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}