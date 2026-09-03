import { act } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

import { useMonthlyFinanceDiagnosis } from '@/features/finance/hooks/useMonthlyFinanceDiagnosis'
import { ApiError } from '@/services/http'

const mockGenerateMonthlyDiagnosis = vi.fn()
vi.mock('@/features/finance/services/finance-diagnosis.service', () => ({
  generateMonthlyDiagnosis: (...args: unknown[]) => mockGenerateMonthlyDiagnosis(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useMonthlyFinanceDiagnosis', () => {
  it('starts with the initial idle state', () => {
    const { result } = renderHook(() => useMonthlyFinanceDiagnosis())
    expect(result.current.state).toEqual({
      diagnosis: null,
      isGenerating: false,
      isPlanBlocked: false,
      isQuotaExceeded: false,
      error: null,
    })
  })

  it('generates a diagnosis successfully', async () => {
    mockGenerateMonthlyDiagnosis.mockResolvedValue({ summary: 'ok' })
    const { result } = renderHook(() => useMonthlyFinanceDiagnosis())
    await act(async () => {
      await result.current.handleGenerate('2026-06')
    })
    expect(result.current.state.diagnosis).toEqual({ summary: 'ok' })
    expect(result.current.state.isGenerating).toBe(false)
    expect(mockGenerateMonthlyDiagnosis).toHaveBeenCalledWith('2026-06', false)
  })

  it('forwards forceRefresh when specified', async () => {
    mockGenerateMonthlyDiagnosis.mockResolvedValue({ summary: 'ok' })
    const { result } = renderHook(() => useMonthlyFinanceDiagnosis())
    await act(async () => {
      await result.current.handleGenerate('2026-06', true)
    })
    expect(mockGenerateMonthlyDiagnosis).toHaveBeenCalledWith('2026-06', true)
  })

  it('sets isPlanBlocked on a 403 ApiError', async () => {
    mockGenerateMonthlyDiagnosis.mockRejectedValue(new ApiError('Forbidden', 403, null))
    const { result } = renderHook(() => useMonthlyFinanceDiagnosis())
    await act(async () => {
      await result.current.handleGenerate('2026-06')
    })
    expect(result.current.state.isPlanBlocked).toBe(true)
    expect(result.current.state.isGenerating).toBe(false)
  })

  it('sets isQuotaExceeded on a 429 ApiError', async () => {
    mockGenerateMonthlyDiagnosis.mockRejectedValue(new ApiError('Too many', 429, null))
    const { result } = renderHook(() => useMonthlyFinanceDiagnosis())
    await act(async () => {
      await result.current.handleGenerate('2026-06')
    })
    expect(result.current.state.isQuotaExceeded).toBe(true)
  })

  it('sets a generic message for other ApiError statuses', async () => {
    mockGenerateMonthlyDiagnosis.mockRejectedValue(new ApiError('Server error', 500, null))
    const { result } = renderHook(() => useMonthlyFinanceDiagnosis())
    await act(async () => {
      await result.current.handleGenerate('2026-06')
    })
    expect(result.current.state.error).toBe('Server error')
    expect(result.current.state.isPlanBlocked).toBe(false)
    expect(result.current.state.isQuotaExceeded).toBe(false)
  })

  it('sets the fallback message for a non-Error rejection', async () => {
    mockGenerateMonthlyDiagnosis.mockRejectedValue('boom')
    const { result } = renderHook(() => useMonthlyFinanceDiagnosis())
    await act(async () => {
      await result.current.handleGenerate('2026-06')
    })
    expect(result.current.state.error).toBe(
      'Não foi possível gerar o diagnóstico financeiro. Tente novamente.',
    )
  })

  it('resets to the initial state on handleClear', async () => {
    mockGenerateMonthlyDiagnosis.mockResolvedValue({ summary: 'ok' })
    const { result } = renderHook(() => useMonthlyFinanceDiagnosis())
    await act(async () => {
      await result.current.handleGenerate('2026-06')
    })
    act(() => result.current.handleClear())
    expect(result.current.state.diagnosis).toBeNull()
  })
})
