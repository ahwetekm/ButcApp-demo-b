'use client'

import { ReactNode } from 'react'

interface AdminNavigationProviderProps {
  children: ReactNode
}

export function AdminNavigationProvider({ children }: AdminNavigationProviderProps) {
  return (
    <div>
      {children}
    </div>
  )
}