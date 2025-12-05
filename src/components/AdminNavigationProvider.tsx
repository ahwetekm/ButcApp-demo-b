'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AdminNavigationProviderProps {
  children: React.ReactNode
}

export function AdminNavigationProvider({ children }: AdminNavigationProviderProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Admin panel içindeyse ve token varsa, diğer sayfalara gitmek için token'ı URL'e ekle
    if (pathname.startsWith('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK') && !pathname.includes('/login')) {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')
      
      if (token && !pathname.includes('token=')) {
        // URL'de token yoksa ekle
        const url = new URL(window.location.href)
        url.searchParams.set('token', token)
        window.history.replaceState({}, '', url.toString())
      }
    }
  }, [pathname])

  // Admin panel içinde navigation wrapper
  const navigateWithToken = (path: string) => {
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')
    
    if (token && path.startsWith('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK')) {
      const separator = path.includes('?') ? '&' : '?'
      const fullPath = `${path}${separator}token=${token}`
      setIsNavigating(true)
      window.location.href = fullPath
    } else {
      router.push(path)
    }
  }

  return (
    <div>
      {children}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Tüm admin linklerini otomatik olarak token ile güncelle
          document.addEventListener('DOMContentLoaded', function() {
            const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
            if (token) {
              const links = document.querySelectorAll('a[href^="/0gv6O9Gizwrd1FCb40H22JE8y9aIgK"]');
              links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.includes('token=')) {
                  const separator = href.includes('?') ? '&' : '?';
                  link.setAttribute('href', href + separator + 'token=' + token);
                }
              });
            }
          });
        `
      }} />
    </div>
  )
}