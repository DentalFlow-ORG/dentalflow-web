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
  clinicId: string
  role: 'OWNER' | 'ADMIN' | 'DENTIST' | 'ASSISTANT'
  email?: string
  firstName?: string
  lastName?: string
}

export type AuthResponse = {
  accessToken: string
  user: AuthUser
}
