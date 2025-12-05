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
    console.log('AuthGuard: Checking authentication...')
    console.log('Is loading:', isLoading)
    console.log('Is authenticated:', isAuthenticated)
    console.log('User:', user)
    
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('AuthGuard: Not authenticated, checking for token in storages...')
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')
        const storedUser = localStorage.getItem('adminUser')
        
        if (token && storedUser) {
          console.log('AuthGuard: Found token in storage, redirecting with token param...')
          window.location.href = `/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/dashboard?token=${token}`
          return
        } else {
          console.log('AuthGuard: No token found, redirecting to login')
          router.push('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login')
          return
        }
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