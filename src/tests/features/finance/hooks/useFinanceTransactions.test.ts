import type { FormEvent } from 'react'

import { useFinanceTransactions } from '@/features/finance/hooks/useFinanceTransactions'
import {
  createFinancialTransaction,
  deleteFinancialTransaction,
  updateFinancialTransaction,
} from '@/features/finance/services/finance.service'
import { makeCategory, makeTransaction } from '@/test-utils/factories/finance.factory'
import { act, renderHook } from '@/test-utils/render-utils'

const showAlert = vi.hoisted(() => vi.fn())
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert }),
}))
vi.mock('@/features/finance/services/finance.service', () => ({
  createFinancialTransaction: vi.fn(),
  deleteFinancialTransaction: vi.fn(),
  updateFinancialTransaction: vi.fn(),
}))
const submit = () => new Event('submit', { cancelable: true }) as unknown as FormEvent
beforeEach(() => vi.resetAllMocks())

it('clears an incompatible category when changing transaction type in create and edit forms', () => {
  const income = [makeCategory()]
  const expenses = [makeCategory({ id: 'expense', type: 'EXPENSE' })]
  const { result } = renderHook(() => useFinanceTransactions(vi.fn(), income, expenses))
  act(() => {
    result.current.setTransaction('categoryId', 'cat-1')
    result.current.handleOpenEdit(makeTransaction())
  })
  act(() => {
    result.current.setTransaction('type', 'EXPENSE')
    result.current.setEditField('type', 'EXPENSE')
  })
  expect(result.current.transactionCategories).toEqual(expenses)
  expect(result.current.transactionForm.categoryId).toBe('')
  expect(result.current.editForm.categoryId).toBe('')
  expect(result.current.editForm.description).toBe('Consulta João')
})

it.each(['categoryId', 'amount', 'description'] as const)(
  'requires %s before creating or updating a transaction',
  async (missing) => {
    const { result } = renderHook(() => useFinanceTransactions(vi.fn(), [], []))
    act(() => {
      result.current.setTransaction('categoryId', 'cat-1')
      result.current.setTransaction('amount', '12,50')
      result.current.setTransaction('description', 'Consulta')
      result.current.setTransaction(missing, '')
      result.current.handleOpenEdit(makeTransaction())
    })
    act(() => result.current.setEditField(missing, ''))
    await act(async () => result.current.handleCreateTransaction(submit()))
    await act(async () => result.current.handleUpdateTransaction(submit()))
    expect(result.current.transactionError).toBe('Categoria, valor e descricao sao obrigatorios.')
    expect(result.current.editError).toBe('Categoria, valor e descricao sao obrigatorios.')
    expect(createFinancialTransaction).not.toHaveBeenCalled()
    expect(updateFinancialTransaction).not.toHaveBeenCalled()
  },
)

it('does not mutate a transaction without a selected target', async () => {
  const { result } = renderHook(() => useFinanceTransactions(vi.fn(), [], []))
  await act(async () => result.current.handleUpdateTransaction(submit()))
  await act(async () => result.current.handleDeleteTransaction())
  expect(updateFinancialTransaction).not.toHaveBeenCalled()
  expect(deleteFinancialTransaction).not.toHaveBeenCalled()
})

it.each([new Error('Falha'), null])(
  'retains input and settles create errors: %s',
  async (failure) => {
    vi.mocked(createFinancialTransaction).mockRejectedValue(failure)
    const reload = vi.fn()
    const { result } = renderHook(() => useFinanceTransactions(reload, [], []))
    act(() => {
      result.current.setTransaction('categoryId', 'cat-1')
      result.current.setTransaction('amount', '12,50')
      result.current.setTransaction('description', 'Consulta')
    })
    await act(async () => result.current.handleCreateTransaction(submit()))
    expect(result.current.transactionError).toBe(
      failure instanceof Error ? failure.message : 'Erro ao salvar movimentacao.',
    )
    expect(result.current.transactionForm.amount).toBe('12,50')
    expect(result.current.isSavingTransaction).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  },
)

it.each([new Error('Conflito'), null])(
  'retains edits and can retry a failed update: %s',
  async (failure) => {
    vi.mocked(updateFinancialTransaction)
      .mockRejectedValueOnce(failure)
      .mockResolvedValue(makeTransaction())
    const reload = vi.fn()
    const { result } = renderHook(() => useFinanceTransactions(reload, [], []))
    act(() => result.current.handleOpenEdit(makeTransaction({ dueDate: '2026-12-10' })))
    await act(async () => result.current.handleUpdateTransaction(submit()))
    expect(result.current.editError).toBe(
      failure instanceof Error ? failure.message : 'Erro ao atualizar movimentacao.',
    )
    expect(result.current.editingTransaction).not.toBeNull()
    expect(result.current.isUpdating).toBe(false)
    expect(reload).not.toHaveBeenCalled()
    await act(async () => result.current.handleUpdateTransaction(submit()))
    expect(result.current.editError).toBeNull()
    expect(result.current.editingTransaction).toBeNull()
    expect(reload).toHaveBeenCalledOnce()
  },
)

it.each([new Error('Falha'), null])(
  'retains the cancellation target after an API failure: %s',
  async (failure) => {
    vi.mocked(deleteFinancialTransaction).mockRejectedValue(failure)
    const reload = vi.fn()
    const { result } = renderHook(() => useFinanceTransactions(reload, [], []))
    act(() => result.current.setDeletingTransaction(makeTransaction()))
    await act(async () => result.current.handleDeleteTransaction())
    expect(showAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: 'error',
        description: failure instanceof Error ? failure.message : 'Nao foi possivel cancelar.',
      }),
    )
    expect(result.current.deletingTransaction?.id).toBe('txn-1')
    expect(result.current.isDeleting).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  },
)
