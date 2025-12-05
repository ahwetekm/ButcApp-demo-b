import { AuthUser, AuthResponse } from './auth-types'

// Client-side authentication service (uses API routes)
export class ClientAuthService {
  private static getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      // Return empty string to use relative URLs in the browser
      // This fixes networking issues in cloud development environments
      return ''
    }
    // Server-side fallback
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  static async signUp(email: string, password: string, fullName?: string, captchaAnswer?: string): Promise<AuthResponse> {
    try {
      console.log('ClientAuthService: Starting signup for email:', email)
      
      const response = await fetch(`${this.getBaseUrl()}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          fullName: fullName?.trim() || null,
          captchaAnswer: captchaAnswer?.trim() || null,
        }),
      })

      // Check if response is OK first
      if (!response.ok) {
        // Try to get error details from response
        const contentType = response.headers.get('content-type')
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (jsonError) {
            console.warn('Failed to parse error response as JSON:', jsonError)
          }
        } else {
          // Read as text for non-JSON responses (HTML error pages, etc.)
          const text = await response.text()
          console.error('API Error - Non-JSON response:', response.status, text)
          errorMessage = `Server returned ${response.status}. Check console for details.`
        }
        
        console.error('ClientAuthService: Signup failed:', errorMessage)
        return { error: errorMessage }
      }

      // Check Content-Type before parsing JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('API Error - Expected JSON but got:', response.status, text)
        return { error: `Server returned non-JSON response. Check console for details.` }
      }

      const data = await response.json()
      console.log('ClientAuthService: Signup successful for:', email)

      // Save token to localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }

      return {
        user: data.user,
        token: data.token
      }
    } catch (error) {
      console.error('ClientAuthService: Signup error:', error)
      return { error: `Network error: ${(error as Error).message}` }
    }
  }

  static async signIn(email: string, password: string, captchaAnswer?: string): Promise<AuthResponse> {
    try {
      console.log('ClientAuthService: Starting signin for email:', email)
      
      const response = await fetch(`${this.getBaseUrl()}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          captchaAnswer: captchaAnswer?.trim() || null,
        }),
      })

      // Check if response is OK first
      if (!response.ok) {
        // Try to get error details from response
        const contentType = response.headers.get('content-type')
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (jsonError) {
            console.warn('Failed to parse error response as JSON:', jsonError)
          }
        } else {
          // Read as text for non-JSON responses (HTML error pages, etc.)
          const text = await response.text()
          console.error('API Error - Non-JSON response:', response.status, text)
          errorMessage = `Server returned ${response.status}. Check console for details.`
        }
        
        console.error('ClientAuthService: Signin failed:', errorMessage)
        return { error: errorMessage }
      }

      // Check Content-Type before parsing JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('API Error - Expected JSON but got:', response.status, text)
        return { error: `Server returned non-JSON response. Check console for details.` }
      }

      const data = await response.json()
      console.log('ClientAuthService: Signin response:', data)
      console.log('ClientAuthService: Signin successful for:', email)

      // Save token to localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }

      return {
        user: data.user,
        token: data.token
      }
    } catch (error) {
      console.error('ClientAuthService: Signin error:', error)
      return { error: `Network error: ${(error as Error).message}` }
    }
  }

  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      console.log('ClientAuthService: Verifying token')
      
      const response = await fetch(`${this.getBaseUrl()}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      // Check if response is OK first
      if (!response.ok) {
        console.log('ClientAuthService: Token verification failed:', response.status, response.statusText)
        return null
      }

      // Check Content-Type before parsing JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('API Error - Expected JSON but got:', response.status, text)
        return null
      }

      const data = await response.json()
      console.log('ClientAuthService: Token verification successful for:', data.user.email)
      return data.user
    } catch (error) {
      console.error('ClientAuthService: Token verification error:', error)
      return null
    }
  }

  static async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
      })

      // Check if response is OK first
      if (!response.ok) {
        // Try to get error details from response
        const contentType = response.headers.get('content-type')
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (jsonError) {
            console.warn('Failed to parse error response as JSON:', jsonError)
          }
        } else {
          // Read as text for non-JSON responses (HTML error pages, etc.)
          const text = await response.text()
          console.error('API Error - Non-JSON response:', response.status, text)
          errorMessage = `Server returned ${response.status}. Check console for details.`
        }
        
        return { error: errorMessage }
      }

      // Check Content-Type before parsing JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('API Error - Expected JSON but got:', response.status, text)
        return { error: `Server returned non-JSON response. Check console for details.` }
      }

      const data = await response.json()
      console.log(`Password reset requested for: ${email}`)
      return {}
    } catch (error) {
      console.error('ClientAuthService: Password reset error:', error)
      return { error: `Network error: ${(error as Error).message}` }
    }
  }

  static async updateProfile(userId: string, data: { fullName?: string; avatarUrl?: string }): Promise<{ error?: string }> {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        return { error: 'Oturum bulunamadı' }
      }

      const response = await fetch(`${this.getBaseUrl()}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      // Check if response is OK first
      if (!response.ok) {
        // Try to get error details from response
        const contentType = response.headers.get('content-type')
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (jsonError) {
            console.warn('Failed to parse error response as JSON:', jsonError)
          }
        } else {
          // Read as text for non-JSON responses (HTML error pages, etc.)
          const text = await response.text()
          console.error('API Error - Non-JSON response:', response.status, text)
          errorMessage = `Server returned ${response.status}. Check console for details.`
        }
        
        return { error: errorMessage }
      }

      // Check Content-Type before parsing JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('API Error - Expected JSON but got:', response.status, text)
        return { error: `Server returned non-JSON response. Check console for details.` }
      }

      const responseData = await response.json()
      return {}
    } catch (error) {
      console.error('ClientAuthService: Profile update error:', error)
      return { error: `Network error: ${(error as Error).message}` }
    }
  }

  static signOut(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const token = this.getToken()
      if (!token) {
        console.log('ClientAuthService: No token found')
        return null
      }

      console.log('ClientAuthService: Getting current user with token')
      return await this.verifyToken(token)
    } catch (error) {
      console.error('ClientAuthService: Error getting current user:', error)
      return null
    }
  }
}