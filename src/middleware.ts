import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/jwt'

// Admin route'larını koruyan middleware
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Pathname:', pathname);
  console.log('Method:', request.method);

  // API rotalarını middleware'den her zaman hariç tut
  if (pathname.includes('/api/')) {
    console.log('API route, skipping middleware');
    return NextResponse.next()
  }

  // Sadece admin route'larını kontrol et
  if (pathname.startsWith('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK')) {
    // Cookie'den token'ı al
    let token = request.cookies.get('auth-token')?.value
    
    console.log('Cookie token:', !!token);
    
    // Cookie'de yoksa authorization header'dan kontrol et
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }
    
    console.log('Final token:', !!token);

    // GÜVENLİK: URL parametresi ile token alma KALDIRILDI
    // Token sadece Cookie (HttpOnly) veya Authorization Header içinde taşınmalıdır
    // Session Hijacking ve Token Leakage önlemek için
    
    console.log('Middleware: Checking path:', pathname)
    console.log('Middleware: Token found:', !!token)

    // Token yoksa login'e yönlendir (login sayfası hariç)
    if (!token && !pathname.includes('/login')) {
      console.log('Middleware: No token, redirecting to login')
      const loginUrl = new URL('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login', request.url)
      const response = NextResponse.redirect(loginUrl)
      return response
    }

    // Token'ı doğrula ve ADMIN rolünü kontrol et
    if (token && !pathname.includes('/login')) {
      try {
        console.log('Verifying token...');
        const isAdmin = await verifyAdminToken(token)
        console.log('Middleware: Is admin:', isAdmin)
        
        if (!isAdmin) {
          // Admin değilse login'e yönlendir
          console.log('Middleware: Not admin, redirecting to login')
          const loginUrl = new URL('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login', request.url)
          const response = NextResponse.redirect(loginUrl)
          return response
        }

        // Admin ise devam et
        console.log('Middleware: Admin verified, proceeding')
        
        // Token'ı cookie'e set et (sonraki istekler için)
        const response = NextResponse.next()
        if (token) {
          response.cookies.set('auth-token', token, {
            path: '/',
            maxAge: 24 * 60 * 60,
            sameSite: 'lax',
            httpOnly: false // Client-side erişim için
          })
        }
        return response
      } catch (error) {
        console.log('Middleware: Token verification failed:', error)
        // Token geçersizse login'e yönlendir
        const loginUrl = new URL('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login', request.url)
        const response = NextResponse.redirect(loginUrl)
        return response
      }
    }
  }

  // Admin route'u değilse veya login sayfası ise devam et
  console.log('Not an admin route or login page, proceeding');
  return NextResponse.next()
}

// Middleware'in çalışacağı route'ları belirle
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}