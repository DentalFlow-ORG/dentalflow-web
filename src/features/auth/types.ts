export type AuthMode = 'login' | 'register'

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  clinicName: string
  responsibleName: string
  email: string
  password: string
}

export type AuthUser = {
  id: string
  name: string
  email: string
}

export type AuthResponse = {
  accessToken: string
  user: AuthUser
}

