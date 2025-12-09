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

  // Sadece login ve admin route'larını kontrol et
  if (pathname.startsWith('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login') || 
      pathname.startsWith('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/') ||
      pathname.startsWith('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/')) {
    console.log('Login or Admin route, skipping middleware');
    return NextResponse.next()
  }

  console.log('Not an admin route or login page, proceeding');
  return NextResponse.next()
}