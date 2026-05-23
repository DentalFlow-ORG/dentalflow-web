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
  acceptedTerms: boolean
}

export type AuthUserRole = 'ADMIN' | 'OWNER' | 'DENTIST' | 'ASSISTANT' | 'PATIENT'

export type AuthUser = {
  id: string
  clinicId: string | null
  role: AuthUserRole
  email: string
  firstName: string
  lastName: string
  isProfileComplete: boolean
}

export type AuthResponse = {
  accessToken: string
  user: AuthUser
}

export type RefreshResponse = {
  accessToken: string
}

export type CompleteProfilePayload = {
  clinicName: string
  firstName: string
  lastName: string
  acceptedTerms: boolean
}

export type MessageResponse = {
  message: string
}
