import type { FormEvent } from 'react'

import { useFinanceFixedExpenses } from '@/features/finance/hooks/useFinanceFixedExpenses'
import {
  createFixedExpense,
  generateFixedExpenseOccurrence,
  updateFixedExpense,
} from '@/features/finance/services/finance.service'
import { makeFixedExpense } from '@/test-utils/factories/finance.factory'
import { act, renderHook } from '@/test-utils/render-utils'

const showAlert = vi.hoisted(() => vi.fn())
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert }),
}))
vi.mock('@/features/finance/services/finance.service', () => ({
  createFixedExpense: vi.fn(),
  generateFixedExpenseOccurrence: vi.fn(),
  updateFixedExpense: vi.fn(),
}))
const submit = () => new Event('submit', { cancelable: true }) as unknown as FormEvent
const filters = { from: '2026-12-01', to: '2026-12-31', groupBy: 'day' as const }
beforeEach(() => vi.resetAllMocks())

it.each(['categoryId', 'amount', 'description'] as const)(
  'requires %s on create and edit',
  async (missing) => {
    const { result } = renderHook(() => useFinanceFixedExpenses(vi.fn(), filters))
    act(() => {
      result.current.setFixedExpense('categoryId', 'cat-1')
      result.current.setFixedExpense('amount', '12,50')
      result.current.setFixedExpense('description', 'Materiais')
      result.current.setFixedExpense(missing, '')
      result.current.handleOpenEditFixedExpense(makeFixedExpense())
    })
    act(() => result.current.setFixedExpenseEditField(missing, ''))
    await act(async () => result.current.handleCreateFixedExpense(submit()))
    await act(async () => result.current.handleUpdateFixedExpense(submit()))
    expect(result.current.fixedExpenseError).toBe('Categoria, valor e descricao sao obrigatorios.')
    expect(result.current.fixedExpenseEditError).toBe(
      'Categoria, valor e descricao sao obrigatorios.',
    )
    expect(createFixedExpense).not.toHaveBeenCalled()
    expect(updateFixedExpense).not.toHaveBeenCalled()
  },
)

it('does not update or toggle without a selected expense', async () => {
  const { result } = renderHook(() => useFinanceFixedExpenses(vi.fn(), filters))
  await act(async () => result.current.handleUpdateFixedExpense(submit()))
  await act(async () => result.current.handleToggleFixedExpense())
  expect(updateFixedExpense).not.toHaveBeenCalled()
})

it.each([new Error('Falha'), null])(
  'retains create/edit input after failure: %s',
  async (failure) => {
    vi.mocked(createFixedExpense).mockRejectedValue(failure)
    vi.mocked(updateFixedExpense).mockRejectedValue(failure)
    const reload = vi.fn()
    const { result } = renderHook(() => useFinanceFixedExpenses(reload, filters))
    act(() => {
      result.current.setFixedExpense('categoryId', 'cat-1')
      result.current.setFixedExpense('amount', '12,50')
      result.current.setFixedExpense('description', 'Materiais')
      result.current.handleOpenEditFixedExpense(makeFixedExpense({ endDate: '2027-12-31' }))
    })
    await act(async () => result.current.handleCreateFixedExpense(submit()))
    await act(async () => result.current.handleUpdateFixedExpense(submit()))
    expect(result.current.fixedExpenseError).toBe(
      failure instanceof Error ? failure.message : 'Erro ao salvar despesa fixa.',
    )
    expect(result.current.fixedExpenseEditError).toBe(
      failure instanceof Error ? failure.message : 'Erro ao atualizar despesa fixa.',
    )
    expect(result.current.fixedExpenseForm.amount).toBe('12,50')
    expect(result.current.editingFixedExpense?.id).toBe('exp-1')
    expect(result.current.isSavingFixedExpense).toBe(false)
    expect(result.current.isUpdatingFixedExpense).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  },
)

it.each([new Error('Falha'), null])(
  'settles failed toggles and occurrence generation: %s',
  async (failure) => {
    vi.mocked(updateFixedExpense).mockRejectedValue(failure)
    vi.mocked(generateFixedExpenseOccurrence).mockRejectedValue(failure)
    const reload = vi.fn()
    const { result } = renderHook(() => useFinanceFixedExpenses(reload, filters))
    act(() => result.current.setTogglingFixedExpense(makeFixedExpense()))
    await act(async () => result.current.handleToggleFixedExpense())
    expect(showAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: 'error',
        description:
          failure instanceof Error ? failure.message : 'Nao foi possivel alterar o status.',
      }),
    )
    expect(result.current.togglingFixedExpense?.id).toBe('exp-1')
    expect(result.current.isTogglingFixedExpense).toBe(false)
    await act(async () => result.current.handleGenerateFixedExpense(makeFixedExpense()))
    expect(generateFixedExpenseOccurrence).toHaveBeenCalledWith('exp-1', '2026-12')
    expect(showAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: 'error',
        description:
          failure instanceof Error ? failure.message : 'Nao foi possivel gerar a despesa.',
      }),
    )
    expect(result.current.generatingExpenseId).toBeNull()
    expect(reload).not.toHaveBeenCalled()
  },
)
