import type { AdminSubscriptionStatus } from './admin-finance.types'

export type UserRole = 'ADMIN' | 'OWNER' | 'DENTIST' | 'ASSISTANT' | 'PATIENT'

export type AdminClinic = {
  id: string
  name: string
  email?: string | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export type ClinicHealthRow = {
  clinic: {
    id: string
    name: string
    email?: string | null
    createdAt?: string | null
    isActive?: boolean
  }
  subscription: {
    planSlug?: string | null
    planName?: string | null
    status?: AdminSubscriptionStatus | null
    trialEndsAt?: string | null
    billingInterval?: string | null
    createdAt?: string | null
  } | null
  counts: {
    dentists: number
    activeUsers: number
    totalAppointments: number
    recentAppointments: number
  }
  lastActivity: {
    timestamp: string | null
    source: 'USER_LOGIN' | 'AUDIT_LOG' | null
  }
  compliance?: {
    fiscalSetupComplete: boolean | null
  }
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

export type AdminClinicsResponse = {
  data: AdminClinic[]
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

export type CreateAdminClinicDto = {
  name: string
}

export type UpdateAdminClinicDto = {
  name?: string
  isActive?: boolean
}
