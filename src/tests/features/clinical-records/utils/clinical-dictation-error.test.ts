import { getClinicalDictationErrorMessage } from '@/features/clinical-records/utils/clinical-dictation-error'
import { ApiError } from '@/services/http'

describe('getClinicalDictationErrorMessage', () => {
  it('returns the dev backend-unreachable hint for status 0 (DEV mode in Vitest)', () => {
    const err = new ApiError('Failed to fetch', 0, null)
    expect(getClinicalDictationErrorMessage(err)).toContain('Backend inacessível')
  })

  it('returns a plan-gate message for status 402', () => {
    const err = new ApiError('Payment required', 402, null)
    expect(getClinicalDictationErrorMessage(err)).toBe(
      'Ditado clínico disponível apenas no plano Premium.',
    )
  })

  it('returns a plan-gate message for status 403', () => {
    const err = new ApiError('Forbidden', 403, null)
    expect(getClinicalDictationErrorMessage(err)).toBe(
      'Ditado clínico disponível apenas no plano Premium.',
    )
  })

  it('returns a monthly-quota message for 429 when the message mentions "mensal"', () => {
    const err = new ApiError('Limite mensal atingido', 429, null)
    expect(getClinicalDictationErrorMessage(err)).toBe(
      'Limite mensal de ditados clínicos atingido para este plano.',
    )
  })

  it('returns a monthly-quota message for 429 when the message mentions "mês"', () => {
    const err = new ApiError('Cota do mês esgotada', 429, null)
    expect(getClinicalDictationErrorMessage(err)).toBe(
      'Limite mensal de ditados clínicos atingido para este plano.',
    )
  })

  it('returns a throttle message for 429 when the message does not mention quota', () => {
    const err = new ApiError('Too many requests', 429, null)
    expect(getClinicalDictationErrorMessage(err)).toBe(
      'Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.',
    )
  })

  it('returns an AI-unavailable message for status 503', () => {
    const err = new ApiError('Service unavailable', 503, null)
    expect(getClinicalDictationErrorMessage(err)).toBe(
      'O ditado clínico está temporariamente indisponível. Tente novamente mais tarde.',
    )
  })

  it('returns an audio-invalid message for status 400', () => {
    const err = new ApiError('Bad request', 400, null)
    expect(getClinicalDictationErrorMessage(err)).toBe(
      'O áudio é muito longo ou inválido. Grave um áudio mais curto e tente novamente.',
    )
  })

  it('returns an audio-invalid message for status 413', () => {
    const err = new ApiError('Payload too large', 413, null)
    expect(getClinicalDictationErrorMessage(err)).toBe(
      'O áudio é muito longo ou inválido. Grave um áudio mais curto e tente novamente.',
    )
  })

  it('returns the generic fallback for an unmapped ApiError status', () => {
    const err = new ApiError('Internal error', 500, null)
    expect(getClinicalDictationErrorMessage(err)).toBe(
      'Não foi possível processar o ditado clínico agora. Tente novamente.',
    )
  })

  it('returns the generic fallback for a non-ApiError value', () => {
    expect(getClinicalDictationErrorMessage(new Error('boom'))).toBe(
      'Não foi possível processar o ditado clínico agora. Tente novamente.',
    )
  })

  it('returns the generic fallback for a non-Error value', () => {
    expect(getClinicalDictationErrorMessage('boom')).toBe(
      'Não foi possível processar o ditado clínico agora. Tente novamente.',
    )
  })
})
