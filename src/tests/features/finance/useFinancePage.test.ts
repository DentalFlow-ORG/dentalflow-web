import { act, renderHook, waitFor } from '@/test-utils/render-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/services/http'
import type { FormEvent } from 'react'

const fakeEvent = { preventDefault: vi.fn() } as unknown as FormEvent

// ── Service mock ─────────────────────────────────────────────────────────────

vi.mock('@/features/finance/services/finance.service', () => ({
  getFinanceSummary: vi.fn(),
  listFinancialCategories: vi.fn(),
  listFinancialTransactions: vi.fn(),
  listFixedExpenses: vi.fn(),
  createFinancialTransaction: vi.fn(),
  updateFinancialTransaction: vi.fn(),
  deleteFinancialTransaction: vi.fn(),
  createFinancialCategory: vi.fn(),
  updateFinancialCategory: vi.fn(),
  deleteFinancialCategory: vi.fn(),
  createFixedExpense: vi.fn(),
  updateFixedExpense: vi.fn(),
  generateFixedExpenseOccurrence: vi.fn(),
}))

import {
  createFinancialCategory,
  createFinancialTransaction,
  createFixedExpense,
  deleteFinancialCategory,
  deleteFinancialTransaction,
  generateFixedExpenseOccurrence,
  getFinanceSummary,
  listFinancialCategories,
  listFinancialTransactions,
  listFixedExpenses,
  updateFinancialCategory,
  updateFinancialTransaction,
  updateFixedExpense,
} from '@/features/finance/services/finance.service'

// ── Alert mock ───────────────────────────────────────────────────────────────

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

// ── Import hook after mocks are registered ───────────────────────────────────

import { useFinancePage } from '@/features/finance/hooks/useFinancePage'

// ── Fixtures ─────────────────────────────────────────────────────────────────

import {
  makeCategory,
  makeFixedExpense,
  makeSummary,
  makeTransaction,
} from '@/test-utils/factories/finance.factory'

const defaultTransactionsResponse = {
  data: [],
  total: 0,
  page: 1,
  limit: 20,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function setupDefaultMocks() {
  vi.mocked(getFinanceSummary).mockResolvedValue(makeSummary())
  vi.mocked(listFinancialCategories).mockResolvedValue([makeCategory()])
  vi.mocked(listFinancialTransactions).mockResolvedValue(defaultTransactionsResponse)
  vi.mocked(listFixedExpenses).mockResolvedValue([makeFixedExpense()])
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useFinancePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([new Error('Página indisponível'), null])(
    'retains loaded transactions when pagination fails: %s',
    async (error) => {
      setupDefaultMocks()
      const transaction = makeTransaction()
      vi.mocked(listFinancialTransactions).mockResolvedValue({
        ...defaultTransactionsResponse,
        data: [transaction],
        total: 30,
      })
      const { result } = renderHook(() => useFinancePage())
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      vi.mocked(listFinancialTransactions).mockRejectedValueOnce(error)
      act(() => result.current.setTransactionsPage(2))
      await waitFor(() =>
        expect(mockShowAlert).toHaveBeenCalledWith({
          title: 'Erro ao carregar movimentacoes',
          description: error?.message ?? 'Não foi possível carregar as movimentações.',
          tone: 'error',
        }),
      )
      expect(result.current.isLoadingTransactions).toBe(false)
      expect(result.current.transactions).toEqual([transaction])
      expect(result.current.transactionsTotal).toBe(30)
      expect(result.current.loadError).toBeNull()
    },
  )

  it.each([
    { from: '2024-03-01', to: '2024-03-01', previousFrom: '2024-02-29', previousTo: '2024-02-29' },
    { from: '2026-01-01', to: '2026-01-31', previousFrom: '2025-12-01', previousTo: '2025-12-31' },
  ])(
    'requests an inclusive previous period across $from boundaries',
    async ({ from, to, previousFrom, previousTo }) => {
      setupDefaultMocks()
      const { result } = renderHook(() => useFinancePage())
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      vi.mocked(getFinanceSummary).mockClear()
      act(() => {
        result.current.setFilter('from', from)
        result.current.setFilter('to', to)
      })
      await waitFor(() =>
        expect(getFinanceSummary).toHaveBeenCalledWith(
          expect.objectContaining({ from: previousFrom, to: previousTo }),
        ),
      )
      await waitFor(() => expect(result.current.isLoading).toBe(false))
    },
  )

  // ── Public API shape ───────────────────────────────────────────────────────

  it('exposes the expected top-level keys required by FinancePageContainer', () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useFinancePage())

    const requiredKeys: (keyof ReturnType<typeof useFinancePage>)[] = [
      'filters',
      'summary',
      'previousSummary',
      'categories',
      'transactions',
      'transactionsTotal',
      'transactionsPage',
      'transactionsPageSize',
      'fixedExpenses',
      'isLoading',
      'isLoadingTransactions',
      'loadError',
      'planBlocked',
      'transactionForm',
      'fixedExpenseForm',
      'transactionError',
      'fixedExpenseError',
      'isSavingTransaction',
      'isSavingFixedExpense',
      'generatingExpenseId',
      'editingFixedExpense',
      'setEditingFixedExpense',
      'togglingFixedExpense',
      'setTogglingFixedExpense',
      'fixedExpenseEditForm',
      'fixedExpenseEditError',
      'isUpdatingFixedExpense',
      'isTogglingFixedExpense',
      'categoryForm',
      'editingCategory',
      'setEditingCategory',
      'categoryEditForm',
      'deletingCategory',
      'setDeletingCategory',
      'categoryError',
      'categoryEditError',
      'isSavingCategory',
      'isUpdatingCategory',
      'isDeletingCategory',
      'editingTransaction',
      'setEditingTransaction',
      'deletingTransaction',
      'setDeletingTransaction',
      'editForm',
      'editError',
      'isUpdating',
      'isDeleting',
      'incomeCategories',
      'expenseCategories',
      'transactionCategories',
      'load',
      'setFilter',
      'setTransaction',
      'setFixedExpense',
      'handleCreateTransaction',
      'handleCreateFixedExpense',
      'setCategory',
      'setCategoryEdit',
      'handleOpenEditCategory',
      'handleCreateCategory',
      'handleUpdateCategory',
      'handleDeleteCategory',
      'handleOpenEditFixedExpense',
      'setFixedExpenseEditField',
      'handleUpdateFixedExpense',
      'handleToggleFixedExpense',
      'handleOpenEdit',
      'setEditField',
      'handleUpdateTransaction',
      'handleDeleteTransaction',
      'handleGenerateFixedExpense',
      'setTransactionsPage',
      'setTransactionsPageSize',
    ]

    for (const key of requiredKeys) {
      expect(result.current).toHaveProperty(key)
    }
  })

  // ── Filters initial state ──────────────────────────────────────────────────

  it('initializes filters with from, to, and groupBy=day', () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useFinancePage())
    expect(result.current.filters.from).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result.current.filters.to).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result.current.filters.groupBy).toBe('day')
  })

  it('setFilter resets transactionsPage to 1', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useFinancePage())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setTransactionsPage(3))
    expect(result.current.transactionsPage).toBe(3)

    act(() => result.current.setFilter('groupBy', 'month'))
    expect(result.current.transactionsPage).toBe(1)
  })

  // ── Load: service calls ────────────────────────────────────────────────────

  it('calls getFinanceSummary with current filters on mount', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useFinancePage())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(getFinanceSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        from: result.current.filters.from,
        to: result.current.filters.to,
        groupBy: result.current.filters.groupBy,
      }),
    )
  })

  it('calls getFinanceSummary twice — once for current period, once for previous period', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useFinancePage())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Two calls: current period + previous period
    expect(getFinanceSummary).toHaveBeenCalledTimes(2)
  })

  it('calls listFinancialTransactions with filters and page=1 on mount', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useFinancePage())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(listFinancialTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ from: result.current.filters.from }),
      1,
      20,
    )
  })

  it('calls listFinancialCategories and listFixedExpenses on mount', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useFinancePage())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(listFinancialCategories).toHaveBeenCalledTimes(1)
    expect(listFixedExpenses).toHaveBeenCalledTimes(1)
  })

  it('populates summary, categories, transactions, and fixedExpenses after load', async () => {
    const category = makeCategory()
    const expense = makeFixedExpense()
    const summary = makeSummary()

    vi.mocked(getFinanceSummary).mockResolvedValue(summary)
    vi.mocked(listFinancialCategories).mockResolvedValue([category])
    vi.mocked(listFinancialTransactions).mockResolvedValue(defaultTransactionsResponse)
    vi.mocked(listFixedExpenses).mockResolvedValue([expense])

    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.summary).toEqual(summary)
    expect(result.current.categories).toHaveLength(1)
    expect(result.current.fixedExpenses).toHaveLength(1)
  })

  it('sets previousSummary to null when previous-period request fails', async () => {
    vi.mocked(getFinanceSummary)
      .mockResolvedValueOnce(makeSummary()) // current period
      .mockRejectedValueOnce(new Error('no data')) // previous period

    vi.mocked(listFinancialCategories).mockResolvedValue([])
    vi.mocked(listFinancialTransactions).mockResolvedValue(defaultTransactionsResponse)
    vi.mocked(listFixedExpenses).mockResolvedValue([])

    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.previousSummary).toBeNull()
  })

  // ── Plan blocking (403) ────────────────────────────────────────────────────

  it('sets planBlocked=true when load receives HTTP 403', async () => {
    vi.mocked(getFinanceSummary).mockRejectedValue(new ApiError('Plano insuficiente.', 403, null))
    vi.mocked(listFinancialCategories).mockResolvedValue([])
    vi.mocked(listFinancialTransactions).mockResolvedValue(defaultTransactionsResponse)
    vi.mocked(listFixedExpenses).mockResolvedValue([])

    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.planBlocked).toBe(true)
    expect(result.current.loadError).toBeNull()
    expect(mockShowAlert).not.toHaveBeenCalled()
  })

  it('sets loadError and shows alert for non-403 errors', async () => {
    vi.mocked(getFinanceSummary).mockRejectedValue(new Error('Server error'))
    vi.mocked(listFinancialCategories).mockResolvedValue([])
    vi.mocked(listFinancialTransactions).mockResolvedValue(defaultTransactionsResponse)
    vi.mocked(listFixedExpenses).mockResolvedValue([])

    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.planBlocked).toBe(false)
    expect(result.current.loadError).toBe('Server error')
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ tone: 'error' }))
  })

  // ── Reload (refresh all) ───────────────────────────────────────────────────

  it('load() reloads summary, categories, transactions, and fixedExpenses', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const callsBefore = vi.mocked(getFinanceSummary).mock.calls.length

    await act(async () => {
      result.current.load()
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Each load() makes 2 getFinanceSummary calls (current + previous)
    expect(vi.mocked(getFinanceSummary).mock.calls.length).toBe(callsBefore + 2)
    expect(listFinancialCategories).toHaveBeenCalledTimes(2)
    expect(listFinancialTransactions).toHaveBeenCalledTimes(2)
    expect(listFixedExpenses).toHaveBeenCalledTimes(2)
  })

  // ── Transaction CRUD ───────────────────────────────────────────────────────

  it('handleCreateTransaction calls createFinancialTransaction with correct payload', async () => {
    setupDefaultMocks()
    vi.mocked(createFinancialTransaction).mockResolvedValue(makeTransaction())

    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setTransaction('type', 'INCOME')
      result.current.setTransaction('categoryId', 'cat-1')
      result.current.setTransaction('amount', '500,00')
      result.current.setTransaction('description', 'Consulta')
      result.current.setTransaction('transactionDate', '2026-06-10')
      result.current.setTransaction('status', 'PAID')
    })

    await act(async () => {
      await result.current.handleCreateTransaction(fakeEvent)
    })

    expect(createFinancialTransaction).toHaveBeenCalledWith({
      type: 'INCOME',
      categoryId: 'cat-1',
      amount: 500,
      description: 'Consulta',
      transactionDate: expect.any(String),
      dueDate: undefined,
      status: 'PAID',
    })
  })

  it('handleCreateTransaction triggers reload after success', async () => {
    setupDefaultMocks()
    vi.mocked(createFinancialTransaction).mockResolvedValue(makeTransaction())

    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const callsBefore = vi.mocked(listFinancialTransactions).mock.calls.length

    act(() => {
      result.current.setTransaction('categoryId', 'cat-1')
      result.current.setTransaction('amount', '500')
      result.current.setTransaction('description', 'Consulta')
    })

    await act(async () => {
      await result.current.handleCreateTransaction(fakeEvent)
    })

    await waitFor(() =>
      expect(vi.mocked(listFinancialTransactions).mock.calls.length).toBeGreaterThan(callsBefore),
    )
  })

  it('handleUpdateTransaction calls updateFinancialTransaction with correct payload', async () => {
    setupDefaultMocks()
    vi.mocked(updateFinancialTransaction).mockResolvedValue(makeTransaction())

    const transaction = makeTransaction({ id: 'txn-42', description: 'Consulta Inicial' })

    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleOpenEdit(transaction))
    act(() => result.current.setEditField('description', 'Consulta Atualizada'))
    act(() => result.current.setEditField('amount', '750,00'))

    await act(async () => {
      await result.current.handleUpdateTransaction(fakeEvent)
    })

    expect(updateFinancialTransaction).toHaveBeenCalledWith(
      'txn-42',
      expect.objectContaining({
        description: 'Consulta Atualizada',
        amount: 750,
      }),
    )
  })

  it('handleUpdateTransaction triggers reload after success', async () => {
    setupDefaultMocks()
    vi.mocked(updateFinancialTransaction).mockResolvedValue(makeTransaction())

    const transaction = makeTransaction()
    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const callsBefore = vi.mocked(listFinancialTransactions).mock.calls.length

    act(() => result.current.handleOpenEdit(transaction))

    await act(async () => {
      await result.current.handleUpdateTransaction(fakeEvent)
    })

    await waitFor(() =>
      expect(vi.mocked(listFinancialTransactions).mock.calls.length).toBeGreaterThan(callsBefore),
    )
  })

  it('handleDeleteTransaction calls deleteFinancialTransaction and triggers reload', async () => {
    setupDefaultMocks()
    vi.mocked(deleteFinancialTransaction).mockResolvedValue(undefined)

    const transaction = makeTransaction({ id: 'txn-99' })
    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const callsBefore = vi.mocked(listFinancialTransactions).mock.calls.length

    act(() => result.current.setDeletingTransaction(transaction))

    await act(async () => {
      await result.current.handleDeleteTransaction()
    })

    expect(deleteFinancialTransaction).toHaveBeenCalledWith('txn-99')
    await waitFor(() =>
      expect(vi.mocked(listFinancialTransactions).mock.calls.length).toBeGreaterThan(callsBefore),
    )
  })

  // ── Category CRUD ──────────────────────────────────────────────────────────

  it('handleCreateCategory calls createFinancialCategory with correct payload', async () => {
    setupDefaultMocks()
    vi.mocked(createFinancialCategory).mockResolvedValue(makeCategory({ name: 'Nova Cat' }))

    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setCategory('name', 'Nova Cat'))
    act(() => result.current.setCategory('type', 'EXPENSE'))
    act(() => result.current.setCategory('color', '#FF0000'))

    await act(async () => {
      await result.current.handleCreateCategory(fakeEvent)
    })

    expect(createFinancialCategory).toHaveBeenCalledWith({
      name: 'Nova Cat',
      type: 'EXPENSE',
      color: '#FF0000',
    })
  })

  it('handleUpdateCategory calls updateFinancialCategory with correct payload', async () => {
    setupDefaultMocks()
    const category = makeCategory({ id: 'cat-77', name: 'Antiga' })
    vi.mocked(updateFinancialCategory).mockResolvedValue(makeCategory({ name: 'Nova' }))

    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleOpenEditCategory(category))
    act(() => result.current.setCategoryEdit('name', 'Nova'))

    await act(async () => {
      await result.current.handleUpdateCategory(fakeEvent)
    })

    expect(updateFinancialCategory).toHaveBeenCalledWith(
      'cat-77',
      expect.objectContaining({ name: 'Nova' }),
    )
  })

  it('handleDeleteCategory calls deleteFinancialCategory and triggers reload', async () => {
    setupDefaultMocks()
    vi.mocked(deleteFinancialCategory).mockResolvedValue(undefined)

    const category = makeCategory({ id: 'cat-99' })
    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const callsBefore = vi.mocked(listFinancialCategories).mock.calls.length

    act(() => result.current.setDeletingCategory(category))

    await act(async () => {
      await result.current.handleDeleteCategory()
    })

    expect(deleteFinancialCategory).toHaveBeenCalledWith('cat-99')
    await waitFor(() =>
      expect(vi.mocked(listFinancialCategories).mock.calls.length).toBeGreaterThan(callsBefore),
    )
  })

  // ── Fixed expense CRUD ─────────────────────────────────────────────────────

  it('handleCreateFixedExpense calls createFixedExpense with correct payload', async () => {
    setupDefaultMocks()
    vi.mocked(createFixedExpense).mockResolvedValue(makeFixedExpense())

    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setFixedExpense('categoryId', 'cat-2'))
    act(() => result.current.setFixedExpense('amount', '3000,00'))
    act(() => result.current.setFixedExpense('description', 'Aluguel'))
    act(() => result.current.setFixedExpense('recurrence', 'MONTHLY'))
    act(() => result.current.setFixedExpense('dueDay', '5'))

    await act(async () => {
      await result.current.handleCreateFixedExpense(fakeEvent)
    })

    expect(createFixedExpense).toHaveBeenCalledWith({
      categoryId: 'cat-2',
      amount: 3000,
      description: 'Aluguel',
      recurrence: 'MONTHLY',
      dueDay: 5,
      startDate: expect.any(String),
      isActive: true,
    })
  })

  it('handleUpdateFixedExpense calls updateFixedExpense with correct payload', async () => {
    setupDefaultMocks()
    vi.mocked(updateFixedExpense).mockResolvedValue(makeFixedExpense())

    const expense = makeFixedExpense({ id: 'exp-42', description: 'Aluguel' })
    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleOpenEditFixedExpense(expense))
    act(() => result.current.setFixedExpenseEditField('amount', '3500,00'))

    await act(async () => {
      await result.current.handleUpdateFixedExpense(fakeEvent)
    })

    expect(updateFixedExpense).toHaveBeenCalledWith(
      'exp-42',
      expect.objectContaining({ amount: 3500 }),
    )
  })

  it('handleToggleFixedExpense calls updateFixedExpense with isActive toggled', async () => {
    setupDefaultMocks()
    vi.mocked(updateFixedExpense).mockResolvedValue(makeFixedExpense({ isActive: false }))

    const expense = makeFixedExpense({ id: 'exp-55', isActive: true })
    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setTogglingFixedExpense(expense))

    await act(async () => {
      await result.current.handleToggleFixedExpense()
    })

    expect(updateFixedExpense).toHaveBeenCalledWith('exp-55', { isActive: false })
  })

  it('handleGenerateFixedExpense calls generateFixedExpenseOccurrence with the current month', async () => {
    setupDefaultMocks()
    vi.mocked(generateFixedExpenseOccurrence).mockResolvedValue(makeTransaction())

    const expense = makeFixedExpense({ id: 'exp-77' })
    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleGenerateFixedExpense(expense)
    })

    // Period is derived from filters.from (first 7 chars = YYYY-MM)
    expect(generateFixedExpenseOccurrence).toHaveBeenCalledWith(
      'exp-77',
      expect.stringMatching(/^\d{4}-\d{2}$/),
    )
  })

  // ── Derived category lists ─────────────────────────────────────────────────

  it('incomeCategories contains only INCOME type categories', async () => {
    vi.mocked(getFinanceSummary).mockResolvedValue(makeSummary())
    vi.mocked(listFinancialCategories).mockResolvedValue([
      makeCategory({ id: 'c1', type: 'INCOME' }),
      makeCategory({ id: 'c2', type: 'EXPENSE' }),
      makeCategory({ id: 'c3', type: 'INCOME' }),
    ])
    vi.mocked(listFinancialTransactions).mockResolvedValue(defaultTransactionsResponse)
    vi.mocked(listFixedExpenses).mockResolvedValue([])

    const { result } = renderHook(() => useFinancePage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.incomeCategories).toHaveLength(2)
    expect(result.current.expenseCategories).toHaveLength(1)
  })
})
