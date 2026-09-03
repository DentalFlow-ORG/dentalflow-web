import { getInvoiceEventLabel } from '@/features/fiscal/constants/invoice-events'

describe('getInvoiceEventLabel', () => {
  it.each([
    ['CREATED', 'Nota criada'],
    ['UPDATED', 'Nota atualizada'],
    ['STATUS_CHANGE', 'Status alterado'],
    ['ISSUED', 'Nota emitida'],
    ['CANCELED', 'Nota cancelada'],
    ['ERROR', 'Erro fiscal'],
  ])('returns the label for %s', (eventType, expected) => {
    expect(getInvoiceEventLabel(eventType)).toBe(expected)
  })

  it('falls back to a generic label for an unknown event type', () => {
    expect(getInvoiceEventLabel('SOMETHING_ELSE')).toBe('Evento registrado')
  })
})
