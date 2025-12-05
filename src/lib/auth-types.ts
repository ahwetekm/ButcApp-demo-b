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