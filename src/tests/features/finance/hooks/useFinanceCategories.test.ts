import type { FormEvent } from 'react'

import { useFinanceCategories } from '@/features/finance/hooks/useFinanceCategories'
import {
  createFinancialCategory,
  deleteFinancialCategory,
  updateFinancialCategory,
} from '@/features/finance/services/finance.service'
import { makeCategory } from '@/test-utils/factories/finance.factory'
import { act, renderHook } from '@/test-utils/render-utils'

const showAlert = vi.hoisted(() => vi.fn())
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert }),
}))
vi.mock('@/features/finance/services/finance.service', () => ({
  createFinancialCategory: vi.fn(),
  deleteFinancialCategory: vi.fn(),
  updateFinancialCategory: vi.fn(),
}))
const submit = () => new Event('submit', { cancelable: true }) as unknown as FormEvent
beforeEach(() => vi.resetAllMocks())

it('rejects whitespace-only names on create and edit without calling the API', async () => {
  const { result } = renderHook(() => useFinanceCategories(vi.fn()))
  act(() => result.current.setCategory('name', '   '))
  await act(async () => result.current.handleCreateCategory(submit()))
  expect(result.current.categoryError).toBe('O nome da categoria é obrigatório.')
  act(() => result.current.handleOpenEditCategory(makeCategory({ color: null })))
  act(() => result.current.setCategoryEdit('name', '   '))
  await act(async () => result.current.handleUpdateCategory(submit()))
  expect(result.current.categoryEditError).toBe('O nome da categoria é obrigatório.')
  expect(createFinancialCategory).not.toHaveBeenCalled()
  expect(updateFinancialCategory).not.toHaveBeenCalled()
})

it('does not update or delete a category without a selected target', async () => {
  const { result } = renderHook(() => useFinanceCategories(vi.fn()))
  await act(async () => result.current.handleUpdateCategory(submit()))
  await act(async () => result.current.handleDeleteCategory())
  expect(updateFinancialCategory).not.toHaveBeenCalled()
  expect(deleteFinancialCategory).not.toHaveBeenCalled()
})

it.each([new Error('Categoria duplicada'), null])(
  'preserves the create form after failure: %s',
  async (failure) => {
    vi.mocked(createFinancialCategory).mockRejectedValue(failure)
    const reload = vi.fn()
    const { result } = renderHook(() => useFinanceCategories(reload))
    act(() => result.current.setCategory('name', 'Materiais'))
    await act(async () => result.current.handleCreateCategory(submit()))
    expect(result.current.categoryError).toBe(
      failure instanceof Error ? failure.message : 'Erro ao criar categoria.',
    )
    expect(result.current.categoryForm.name).toBe('Materiais')
    expect(result.current.isSavingCategory).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  },
)

it.each([new Error('Conflito'), null])(
  'keeps the edit dialog available after failure: %s',
  async (failure) => {
    vi.mocked(updateFinancialCategory)
      .mockRejectedValueOnce(failure)
      .mockResolvedValue(makeCategory())
    const reload = vi.fn()
    const { result } = renderHook(() => useFinanceCategories(reload))
    act(() => result.current.handleOpenEditCategory(makeCategory()))
    await act(async () => result.current.handleUpdateCategory(submit()))
    expect(result.current.categoryEditError).toBe(
      failure instanceof Error ? failure.message : 'Erro ao atualizar categoria.',
    )
    expect(result.current.editingCategory?.id).toBe('cat-1')
    expect(result.current.isUpdatingCategory).toBe(false)
    expect(reload).not.toHaveBeenCalled()
    await act(async () => result.current.handleUpdateCategory(submit()))
    expect(result.current.categoryEditError).toBeNull()
    expect(result.current.editingCategory).toBeNull()
    expect(reload).toHaveBeenCalledOnce()
  },
)

it.each([new Error('Categoria em uso'), null])(
  'reports deletion failure without reloading: %s',
  async (failure) => {
    vi.mocked(deleteFinancialCategory).mockRejectedValue(failure)
    const reload = vi.fn()
    const { result } = renderHook(() => useFinanceCategories(reload))
    act(() => result.current.setDeletingCategory(makeCategory()))
    await act(async () => result.current.handleDeleteCategory())
    expect(showAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: 'error',
        description:
          failure instanceof Error
            ? failure.message
            : 'Verifique se a categoria possui lançamentos vinculados.',
      }),
    )
    expect(result.current.deletingCategory).toBeNull()
    expect(result.current.isDeletingCategory).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  },
)
