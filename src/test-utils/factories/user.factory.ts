import type { AuthUser } from '@/features/auth/types'

export function makeAuthUser(overrides?: Partial<AuthUser>): AuthUser {
  return {
    id: 'user-1',
    clinicId: 'clinic-1',
    role: 'OWNER',
    email: 'test@clinic.com',
    firstName: 'Test',
    lastName: 'User',
    isProfileComplete: true,
    ...overrides,
  }
}

export function makeOwnerUser(overrides?: Partial<AuthUser>): AuthUser {
  return makeAuthUser({ role: 'OWNER', ...overrides })
}

export function makeDentistUser(overrides?: Partial<AuthUser>): AuthUser {
  return makeAuthUser({ role: 'DENTIST', ...overrides })
}

export function makeAssistantUser(overrides?: Partial<AuthUser>): AuthUser {
  return makeAuthUser({ role: 'ASSISTANT', ...overrides })
}

export function makeAdminUser(overrides?: Partial<AuthUser>): AuthUser {
  return makeAuthUser({ role: 'ADMIN', clinicId: null, ...overrides })
}
