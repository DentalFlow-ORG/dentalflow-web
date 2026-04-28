export type AuthMode = 'login' | 'register'

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  clinicName: string
  firstName: string
  lastName: string
  email: string
  password: string
}

export type AuthUser = {
  id: string
  clinicId: string | null
  role: 'ADMIN' | 'OWNER' | 'DENTIST' | 'ASSISTANT' | 'PATIENT'
  email: string
  firstName: string
  lastName: string
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export type RefreshResponse = {
  accessToken: string
  refreshToken: string
}
