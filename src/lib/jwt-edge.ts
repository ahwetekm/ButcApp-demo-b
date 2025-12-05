import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

export interface JWTPayload {
  id: string
  username: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export const generateToken = async (payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> => {
  const { sign } = await import('jsonwebtoken')
  return await sign(payload, JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
  })
}

export const verifyToken = async (token: string): Promise<JWTPayload> => {
  const { verify } = await import('jsonwebtoken')
  try {
    const payload = verify(token, JWT_SECRET) as JWTPayload
    return payload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

export const extractTokenFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  return parts[1]
}

// Middleware için özel token doğrulama fonksiyonu
export const verifyAdminToken = async (token: string): Promise<boolean> => {
  try {
    // Use the same JWT_SECRET as AuthService
    const JWT_SECRET = process.env.JWT_SECRET || 'butcapp-secret-key-change-in-production-2024'
    const { verify } = await import('jsonwebtoken')
    
    const payload = verify(token, JWT_SECRET) as any
    console.log('JWT Payload:', payload);
    
    // Check if user has admin role in database
    if (payload.role === 'admin') {
      return true
    }
    
    // Double check in database for safety
    const { db } = await import('./db')
    const adminUser = await db.adminUser.findUnique({
      where: { userId: payload.userId }
    })
    
    return !!adminUser
  } catch (error) {
    console.error('Token verification error:', error);
    return false
  }
}