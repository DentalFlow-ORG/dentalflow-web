import { describe, expect, it } from 'vitest'

import { getMissingFiscalProfileFields } from '@/features/fiscal/utils/fiscal-profile-completeness'

const COMPLETE = {
  legalName: 'Clínica X',
  documentNumber: '11.222.333/0001-81',
  taxRegime: 'SIMPLES_NACIONAL' as const,
  addressStreet: 'Rua A',
  addressNumber: '100',
  addressNeighborhood: 'Centro',
  addressCity: 'São Paulo',
  addressState: 'SP',
  addressZipCode: '01310-100',
}

describe('getMissingFiscalProfileFields', () => {
  it('lists every required identity and address field of an incomplete draft', () => {
    expect(
      getMissingFiscalProfileFields({
        ...COMPLETE,
        legalName: '',
        documentNumber: '',
        addressStreet: '',
        addressNumber: '',
        addressNeighborhood: '',
        addressCity: '',
        addressState: '',
        addressZipCode: '',
      }),
    ).toEqual(['razão social', 'CNPJ/CPF válido', 'rua', 'número', 'bairro', 'cidade', 'UF', 'CEP'])
  })
  it('returns nothing for a complete profile', () => {
    expect(getMissingFiscalProfileFields(COMPLETE)).toEqual([])
  })

  it('asks for the whole profile when there is none', () => {
    expect(getMissingFiscalProfileFields(null)).toEqual(['dados fiscais da clínica'])
  })

  it('lists blank CEP and UF of a draft, in the API order', () => {
    expect(
      getMissingFiscalProfileFields({ ...COMPLETE, addressState: '', addressZipCode: '' }),
    ).toEqual(['UF', 'CEP'])
  })

  it('treats invalid values and whitespace as missing', () => {
    expect(
      getMissingFiscalProfileFields({
        ...COMPLETE,
        documentNumber: '11.222.333/0001-80',
        addressCity: '   ',
        addressState: 'XX',
        addressZipCode: '0131',
      }),
    ).toEqual(['CNPJ/CPF válido', 'cidade', 'UF', 'CEP'])
  })
})
