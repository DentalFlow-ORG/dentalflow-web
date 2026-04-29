export type UserRole = 'ADMIN' | 'OWNER' | 'DENTIST' | 'ASSISTANT' | 'PATIENT'

export type AdminClinic = {
  id: string
  name: string
}

export type AdminUser = {
  id: string
  clinicId: string | null
  clinic: { id: string; name: string } | null
  email: string
  firstName: string
  lastName: string
  role: UserRole
  phone: string | null
  avatarUrl: string | null
  isEmailVerified: boolean
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export type AdminUsersResponse = {
  data: AdminUser[]
  total: number
  page: number
  limit: number
}

export type CreateAdminUserDto = {
  firstName: string
  lastName: string
  email: string
  password: string
  role: UserRole
  clinicId?: string
  phone?: string
}

export type UpdateAdminUserDto = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  role?: UserRole
  isActive?: boolean
  clinicId?: string | null
}

export type UpdateAdminPasswordDto = {
  password: string
}
