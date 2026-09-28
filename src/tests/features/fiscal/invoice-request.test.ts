import { describe, expect, it } from 'vitest'

import type { InvoicePayload } from '@/features/fiscal/types/fiscal.types'
import { buildInvoiceRequest, toInvoiceFormContact } from '@/features/fiscal/utils/invoice-request'

const form: InvoicePayload = {
  customerName: ' Ana Souza ',
  customerDocument: '',
  customerEmail: '   ',
  customerPhone: '',
  serviceDescription: ' Limpeza ',
  serviceCode: '',
  amountCents: 15000,
  competenceDate: '2026-06-07',
  notes: '',
}

describe('buildInvoiceRequest', () => {
  it('omits empty optional fields on create so the API never receives an empty e-mail', () => {
    const request = buildInvoiceRequest(form, 'create')
    expect(request.customerEmail).toBeUndefined()
    expect(request.customerDocument).toBeUndefined()
    expect(request.customerPhone).toBeUndefined()
    expect(request.serviceCode).toBeUndefined()
    expect(request.notes).toBeUndefined()
  })

  it('sends null for empty optional fields on update so cleared values are removed', () => {
    const request = buildInvoiceRequest(form, 'update')
    expect(request.customerEmail).toBeNull()
    expect(request.customerDocument).toBeNull()
    expect(request.customerPhone).toBeNull()
    expect(request.notes).toBeNull()
  })

  it('trims required text and sends CPF/CNPJ and phone as digits', () => {
    const request = buildInvoiceRequest(
      {
        ...form,
        customerDocument: '11.222.333/0001-81',
        customerPhone: '(11) 98765-4321',
        customerEmail: ' ana@exemplo.com ',
      },
      'create',
    )
    expect(request).toMatchObject({
      customerName: 'Ana Souza',
      serviceDescription: 'Limpeza',
      customerDocument: '11222333000181',
      customerPhone: '11987654321',
      customerEmail: 'ana@exemplo.com',
    })
  })
})

describe('toInvoiceFormContact', () => {
  it('masks stored digits for display', () => {
    expect(toInvoiceFormContact('12345678909', '11987654321')).toEqual({
      customerDocument: '123.456.789-09',
      customerPhone: '(11) 98765-4321',
    })
  })

  it('returns empty strings when no contact is stored', () => {
    expect(toInvoiceFormContact(null, null)).toEqual({ customerDocument: '', customerPhone: '' })
  })
})
