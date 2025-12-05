'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AdminAuthContext'
import { AdminNavigationProvider } from '@/components/AdminNavigationProvider'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthProvider>
      <AdminNavigationProvider>
        {children}
      </AdminNavigationProvider>
    </AuthProvider>
  )
}