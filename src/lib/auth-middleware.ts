import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader, JWTPayload } from './jwt'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

export function withAuth(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('authorization')
      const token = extractTokenFromHeader(authHeader)

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }

      const user = verifyToken(token)
      ;(req as AuthenticatedRequest).user = user

      return await handler(req as AuthenticatedRequest, ...args)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  }
}

export function withRole(allowedRoles: string[]) {
  return function (handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
    return withAuth(async (req: AuthenticatedRequest, ...args: any[]): Promise<NextResponse> => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      return await handler(req, ...args)
    })
  }
}