import type { FiscalProfilePayload } from '../types/fiscal.types'

// Mirrors the API's fiscal profile DTO limits (modules/fiscal/dto/upsert-fiscal-profile.dto.ts).
export const FISCAL_PROFILE_FIELD_LIMITS = {
  legalName: 150,
  tradeName: 150,
  registration: 30,
  addressStreet: 200,
  addressNumber: 20,
  addressComplement: 100,
  addressNeighborhood: 100,
  addressCity: 100,
  serviceCode: 50,
  cnae: 50,
  cityIbgeCode: 7,
} as const

export const TAX_REGIME_LABEL: Record<FiscalProfilePayload['taxRegime'], string> = {
  SIMPLES_NACIONAL: 'Simples Nacional',
  LUCRO_PRESUMIDO: 'Lucro Presumido',
  LUCRO_REAL: 'Lucro Real',
  MEI: 'MEI',
  OUTRO: 'Outro',
}
