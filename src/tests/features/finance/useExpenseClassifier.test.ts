import { act } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

import { useExpenseClassifier } from '@/features/finance/hooks/useExpenseClassifier'
import { ApiError } from '@/services/http'

const mockClassifyExpense = vi.fn()
const mockApplySuggestedCategory = vi.fn()
vi.mock('@/features/finance/services/finance-classify.service', () => ({
  classifyExpense: (...args: unknown[]) => mockClassifyExpense(...args),
  applySuggestedCategory: (...args: unknown[]) => mockApplySuggestedCategory(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useExpenseClassifier', () => {
  it.each([
    new Error('Classificação indisponível'),
    new ApiError('Serviço indisponível', 503, null),
  ])(
    'presents a service error without treating it as a plan or quota block and allows retry: %s',
    async (error) => {
      mockClassifyExpense
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ suggestedCategoryId: 'cat-1' })
      const { result } = renderHook(() => useExpenseClassifier(vi.fn()))
      await act(async () => result.current.handleClassify('tx-1'))
      expect(result.current.getState('tx-1')).toMatchObject({
        error: error.message,
        isClassifying: false,
        isPlanBlocked: false,
        isQuotaExceeded: false,
      })
      await act(async () => result.current.handleClassify('tx-1'))
      expect(result.current.getState('tx-1')).toMatchObject({
        error: null,
        result: { suggestedCategoryId: 'cat-1' },
      })
    },
  )
  it('returns the initial state for an untouched transaction', () => {
    const { result } = renderHook(() => useExpenseClassifier(vi.fn()))
    expect(result.current.getState('tx-1')).toEqual({
      result: null,
      isClassifying: false,
      isApplying: false,
      isPlanBlocked: false,
      isQuotaExceeded: false,
      error: null,
    })
  })

  it('classifies successfully and stores the result per transaction', async () => {
    mockClassifyExpense.mockResolvedValue({ suggestedCategoryId: 'cat-1', confidence: 0.9 })
    const { result } = renderHook(() => useExpenseClassifier(vi.fn()))
    await act(async () => {
      await result.current.handleClassify('tx-1')
    })
    expect(result.current.getState('tx-1').result).toEqual({
      suggestedCategoryId: 'cat-1',
      confidence: 0.9,
    })
    expect(mockClassifyExpense).toHaveBeenCalledWith('tx-1', false)
  })

  it('forwards forceAi', async () => {
    mockClassifyExpense.mockResolvedValue({})
    const { result } = renderHook(() => useExpenseClassifier(vi.fn()))
    await act(async () => {
      await result.current.handleClassify('tx-1', true)
    })
    expect(mockClassifyExpense).toHaveBeenCalledWith('tx-1', true)
  })

  it('keeps state isolated per transaction id', async () => {
    mockClassifyExpense.mockResolvedValue({ suggestedCategoryId: 'cat-1' })
    const { result } = renderHook(() => useExpenseClassifier(vi.fn()))
    await act(async () => {
      await result.current.handleClassify('tx-1')
    })
    expect(result.current.getState('tx-2')).toEqual({
      result: null,
      isClassifying: false,
      isApplying: false,
      isPlanBlocked: false,
      isQuotaExceeded: false,
      error: null,
    })
  })

  it('sets isPlanBlocked on a 403 ApiError', async () => {
    mockClassifyExpense.mockRejectedValue(new ApiError('Forbidden', 403, null))
    const { result } = renderHook(() => useExpenseClassifier(vi.fn()))
    await act(async () => {
      await result.current.handleClassify('tx-1')
    })
    expect(result.current.getState('tx-1').isPlanBlocked).toBe(true)
  })

  it('sets isQuotaExceeded on a 429 ApiError', async () => {
    mockClassifyExpense.mockRejectedValue(new ApiError('Too many', 429, null))
    const { result } = renderHook(() => useExpenseClassifier(vi.fn()))
    await act(async () => {
      await result.current.handleClassify('tx-1')
    })
    expect(result.current.getState('tx-1').isQuotaExceeded).toBe(true)
  })

  it('sets a generic error message for a non-Error, non-ApiError rejection', async () => {
    mockClassifyExpense.mockRejectedValue('boom')
    const { result } = renderHook(() => useExpenseClassifier(vi.fn()))
    await act(async () => {
      await result.current.handleClassify('tx-1')
    })
    expect(result.current.getState('tx-1').error).toBe('Não foi possível classificar o gasto.')
  })

  it('applies the suggested category, clears the result, and calls onApplied', async () => {
    const onApplied = vi.fn()
    mockApplySuggestedCategory.mockResolvedValue({})
    const { result } = renderHook(() => useExpenseClassifier(onApplied))
    await act(async () => {
      await result.current.handleApply('tx-1', 'cat-1')
    })
    expect(mockApplySuggestedCategory).toHaveBeenCalledWith('tx-1', 'cat-1')
    expect(result.current.getState('tx-1').isApplying).toBe(false)
    expect(result.current.getState('tx-1').result).toBeNull()
    expect(onApplied).toHaveBeenCalledOnce()
  })

  it('sets an error and does not call onApplied when applying fails', async () => {
    const onApplied = vi.fn()
    mockApplySuggestedCategory.mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => useExpenseClassifier(onApplied))
    await act(async () => {
      await result.current.handleApply('tx-1', 'cat-1')
    })
    expect(result.current.getState('tx-1').error).toBe('network down')
    expect(onApplied).not.toHaveBeenCalled()
  })

  it('sets a fallback error message when applying fails with a non-Error', async () => {
    mockApplySuggestedCategory.mockRejectedValue('boom')
    const { result } = renderHook(() => useExpenseClassifier(vi.fn()))
    await act(async () => {
      await result.current.handleApply('tx-1', 'cat-1')
    })
    expect(result.current.getState('tx-1').error).toBe('Não foi possível aplicar a categoria.')
  })

  it('dismisses the result and error for a transaction', async () => {
    mockClassifyExpense.mockResolvedValue({ suggestedCategoryId: 'cat-1' })
    const { result } = renderHook(() => useExpenseClassifier(vi.fn()))
    await act(async () => {
      await result.current.handleClassify('tx-1')
    })
    act(() => result.current.handleDismiss('tx-1'))
    expect(result.current.getState('tx-1').result).toBeNull()
    expect(result.current.getState('tx-1').error).toBeNull()
  })
})
