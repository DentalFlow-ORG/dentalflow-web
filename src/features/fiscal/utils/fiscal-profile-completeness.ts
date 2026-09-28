import { isValidCEP, isValidCpfOrCnpj, isValidUF } from '@/lib/validators/br'

import type { FiscalProfilePayload } from '../types/fiscal.types'

type FiscalProfileCompletenessFields = Pick<
  FiscalProfilePayload,
  | 'legalName'
  | 'documentNumber'
  | 'taxRegime'
  | 'addressStreet'
  | 'addressNumber'
  | 'addressNeighborhood'
  | 'addressCity'
  | 'addressState'
  | 'addressZipCode'
>

/**
 * Fiscal data still missing before an invoice can be marked ready or simulated.
 * A profile may be saved as an incomplete draft; the API re-checks this same
 * list (fiscal.service `missingFiscalProfileFields`) at the issuing boundary,
 * so the labels match the message it returns.
 */
export function getMissingFiscalProfileFields(
  profile: FiscalProfileCompletenessFields | null | undefined,
): string[] {
  if (!profile) return ['dados fiscais da clínica']
  const filled = (value: string | null | undefined) => (value ?? '').trim().length > 0
  const missing: string[] = []

  if (!filled(profile.legalName)) missing.push('razão social')
  if (!isValidCpfOrCnpj(profile.documentNumber ?? '')) missing.push('CNPJ/CPF válido')
  if (!filled(profile.taxRegime)) missing.push('regime tributário')
  if (!filled(profile.addressStreet)) missing.push('rua')
  if (!filled(profile.addressNumber)) missing.push('número')
  if (!filled(profile.addressNeighborhood)) missing.push('bairro')
  if (!filled(profile.addressCity)) missing.push('cidade')
  if (!isValidUF(profile.addressState ?? '')) missing.push('UF')
  if (!isValidCEP(profile.addressZipCode ?? '')) missing.push('CEP')

  return missing
}
