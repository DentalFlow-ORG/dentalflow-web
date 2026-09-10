import type { ClinicProfile } from '@/features/settings/types/settings.types'

export function makeClinicProfile(overrides: Partial<ClinicProfile> = {}): ClinicProfile {
  return {
    id: 'clinic-1',
    name: 'Clínica Teste',
    email: 'clinica@teste.com',
    phone: null,
    logoUrl: null,
    websiteUrl: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: null,
    country: 'BR',
    postalCode: null,
    timezone: 'America/Sao_Paulo',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}
