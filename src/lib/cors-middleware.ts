import { NextRequest, NextResponse } from 'next/server'

// CORS middleware
export function corsMiddleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  
  // İzin verilen origin'ler
  const allowedOrigins = [
    'https://butcapp.com',
    'https://www.butcapp.com',
    'https://preview-chat-b37cb39d-89a5-457c-a62f-b15e805bf261.space.z.ai',
    'https://space.z.ai',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://localhost:3000'
  ]
  
  const isAllowedOrigin = allowedOrigins.includes(origin) || !origin
  
  const headers = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? (origin || '*') : 'false',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
  
  return headers
}

// OPTIONS request handler for CORS preflight
export function handleOptions(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    const headers = corsMiddleware(request)
    return new NextResponse(null, { status: 200, headers })
  }
  return null
}