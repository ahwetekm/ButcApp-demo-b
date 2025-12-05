import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'butcapp-secret-key-change-in-production-2024'

export interface AuthUser {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
}

export interface AuthResponse {
  user?: AuthUser
  token?: string
  error?: string
}

export class AuthService {
  // Password validation function
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Şifre en az 8 karakter olmalıdır')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Şifre en az bir büyük harf içermelidir')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Şifre en az bir küçük harf içermelidir')
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Şifre en az bir rakam içermelidir')
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Şifre en az bir özel karakter içermelidir (!@#$%^&*()_+-=[]{}|;:,.<>?)')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  static async signUp(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    try {
      console.log('AuthService: Starting signup for email:', email)
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return { error: 'Geçerli bir e-posta adresi giriniz' }
      }
      
      // Validate password
      const passwordValidation = this.validatePassword(password)
      if (!passwordValidation.isValid) {
        return { error: passwordValidation.errors.join(', ') }
      }
      
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      })

      if (existingUser) {
        console.log('AuthService: User already exists:', email)
        return { error: 'Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta adresi kullanın veya giriş yapın.' }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12)

      // Create user - TIMING LOG START
      console.log(`[${Date.now()}] AuthService: Starting db.user.create for email:`, email)
      const user = await db.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          fullName: fullName?.trim() || null,
        }
      })
      console.log(`[${Date.now()}] AuthService: Completed db.user.create for userId:`, user.id)

      // Create profile
      await db.userProfile.create({
        data: {
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
        }
      })

      // Check if user is admin
      const adminUser = await db.adminUser.findUnique({
        where: { userId: user.id }
      })

      // Generate token - NO EMAIL VERIFICATION NEEDED
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: adminUser ? 'admin' : 'user'
        },
        JWT_SECRET,
        { expiresIn: '30d' } // Longer token for better UX
      )

      console.log('AuthService: Signup successful for:', email)

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName || undefined,
          avatarUrl: user.avatarUrl || undefined,
        },
        token
      }
    } catch (error) {
      console.error('AuthService: Signup error:', error)
      return { error: (error as Error).message }
    }
  }

  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('AuthService: Starting signin for email:', email)
      
      // Find user
      const user = await db.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      })

      if (!user) {
        console.log('AuthService: User not found:', email)
        return { error: 'E-posta veya şifre hatalı' }
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash)
      if (!isValidPassword) {
        console.log('AuthService: Invalid password for:', email)
        return { error: 'E-posta veya şifre hatalı' }
      }

      // Check if user is admin
      const adminUser = await db.adminUser.findUnique({
        where: { userId: user.id }
      })

      // Generate token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: adminUser ? 'admin' : 'user'
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      )

      console.log('AuthService: Signin successful for:', email)

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName || undefined,
          avatarUrl: user.avatarUrl || undefined,
        },
        token
      }
    } catch (error) {
      console.error('AuthService: Signin error:', error)
      return { error: (error as Error).message }
    }
  }

  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      console.log('AuthService: Verifying token')
      
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role?: string; id?: string }
      
      // Find user in database
      const user = await db.user.findUnique({
        where: { id: decoded.userId || decoded.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true
        }
      })

      if (user) {
        console.log('AuthService: Token verification successful for:', user.email)
        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName || undefined,
          avatarUrl: user.avatarUrl || undefined,
        }
      }

      console.log('AuthService: User not found for token verification')
      return null
    } catch (error) {
      console.error('AuthService: Token verification error:', error)
      return null
    }
  }

  static async verifyTokenForAPI(request: NextRequest): Promise<{ success: boolean; user?: AuthUser }> {
    try {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { success: false }
      }

      const token = authHeader.substring(7)
      if (!token) {
        return { success: false }
      }

      const user = await this.verifyToken(token)
      if (!user) {
        return { success: false }
      }

      return { success: true, user }
    } catch (error) {
      console.error('AuthService: API token verification error:', error)
      return { success: false }
    }
  }

  static async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const user = await db.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      })

      if (!user) {
        return { error: 'Bu e-posta adresi kayıtlı değil' }
      }

      // In a real app, you would send an email here
      // For now, we'll just return success
      console.log(`Password reset requested for: ${email}`)
      return {}
    } catch (error) {
      console.error('AuthService: Password reset error:', error)
      return { error: (error as Error).message }
    }
  }

  static async updateProfile(userId: string, data: { fullName?: string; avatarUrl?: string }): Promise<{ error?: string }> {
    try {
      await db.user.update({
        where: { id: userId },
        data: {
          ...(data.fullName && { fullName: data.fullName.trim() }),
          ...(data.avatarUrl && { avatarUrl: data.avatarUrl.trim() }),
        }
      })

      await db.userProfile.update({
        where: { userId },
        data: {
          ...(data.fullName && { fullName: data.fullName.trim() }),
          ...(data.avatarUrl && { avatarUrl: data.avatarUrl.trim() }),
        }
      })

      return {}
    } catch (error) {
      console.error('AuthService: Profile update error:', error)
      return { error: (error as Error).message }
    }
  }

  // Helper method to get current user from request (for API routes)
  static async getCurrentUserFromRequest(request: Request): Promise<AuthUser | null> {
    try {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
      }

      const token = authHeader.substring(7)
      return await this.verifyToken(token)
    } catch (error) {
      console.error('AuthService: Error getting user from request:', error)
      return null
    }
  }
}