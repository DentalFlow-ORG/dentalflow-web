import { getStatusFallbackMessage, translateApiErrorMessage } from '@/services/api-error-messages'

describe('translateApiErrorMessage', () => {
  it('returns null when there is no message and no status', () => {
    expect(translateApiErrorMessage(null)).toBeNull()
  })

  it('returns the status fallback when there is no message but a known status', () => {
    expect(translateApiErrorMessage(null, 404)).toBe('Recurso não encontrado.')
  })

  it('returns undefined-safe fallback for an unmapped status when there is no message', () => {
    expect(translateApiErrorMessage(null, 418)).toBeUndefined()
  })

  it('translates a known exact-match message', () => {
    expect(translateApiErrorMessage('Unauthorized')).toBe('Sessão expirada. Faça login novamente.')
  })

  it('trims whitespace before matching an exact translation', () => {
    expect(translateApiErrorMessage('  Forbidden  ')).toBe(
      'Você não tem permissão para acessar este recurso.',
    )
  })

  it('translates and deduplicates validation messages matching known patterns', () => {
    const message = 'page must not be less than 1, page must be an integer number'
    expect(translateApiErrorMessage(message)).toBe(
      'Página deve ser maior ou igual a 1. Página deve ser um número inteiro.',
    )
  })

  it('deduplicates repeated identical validation translations', () => {
    const message =
      'addressState must be longer than or equal to 2 characters and shorter than or equal to 2 characters'
    expect(translateApiErrorMessage(message)).toBe('UF deve ter exatamente 2 caracteres.')
  })

  it('falls back to a status-based translation when the message mentions "unauthorized"', () => {
    expect(translateApiErrorMessage('User is unauthorized here')).toBe(
      'Sessão expirada. Faça login novamente.',
    )
  })

  it('falls back to a status-based translation when the message mentions "forbidden"', () => {
    expect(translateApiErrorMessage('Access forbidden for this route')).toBe(
      'Você não tem permissão para acessar este recurso.',
    )
  })

  it('falls back to a status-based translation when the message mentions "not found"', () => {
    expect(translateApiErrorMessage('Patient not found')).toBe('Recurso não encontrado.')
  })

  it('falls back to a status-based translation for a "Cannot GET/POST ..." message', () => {
    expect(translateApiErrorMessage('Cannot GET /api/foo')).toBe('Recurso não encontrado.')
  })

  it('falls back to a status-based translation when the message mentions "bad request"', () => {
    expect(translateApiErrorMessage('This was a bad request')).toBe(
      'Não foi possível processar os dados enviados.',
    )
  })

  it('falls back to a status-based translation when the message mentions "internal server error"', () => {
    expect(translateApiErrorMessage('internal server error occurred')).toBe(
      'Erro interno do servidor. Tente novamente em instantes.',
    )
  })

  it('returns a connectivity message when the message mentions "network error"', () => {
    expect(translateApiErrorMessage('network error: fetch failed')).toBe(
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
    )
  })

  it('returns the original trimmed message when nothing else matches', () => {
    expect(translateApiErrorMessage('  Some totally custom message  ')).toBe(
      'Some totally custom message',
    )
  })
})

describe('getStatusFallbackMessage', () => {
  it('returns the mapped message for a known status', () => {
    expect(getStatusFallbackMessage(500)).toBe(
      'Erro interno do servidor. Tente novamente em instantes.',
    )
  })

  it('returns a generic fallback for an unmapped status', () => {
    expect(getStatusFallbackMessage(418)).toBe('Erro ao comunicar com o servidor.')
  })
})
