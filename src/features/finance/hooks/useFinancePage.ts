import { useEffect, useMemo, useRef, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { ApiError } from '@/services/http'

import {
  getFinanceSummary,
  listFinancialCategories,
  listFinancialTransactions,
  listFixedExpenses,
} from '../services/finance.service'
import type {
  FinanceFilters,
  FinanceSummary,
  FinancialCategory,
  FinancialTransaction,
  FixedExpense,
} from '../types/finance.types'
import { useFinanceCategories } from './useFinanceCategories'
import { useFinanceFilters } from './useFinanceFilters'
import { useFinanceFixedExpenses } from './useFinanceFixedExpenses'
import { useFinanceTransactions } from './useFinanceTransactions'

function getPreviousPeriod(from: string, to: string): { from: string; to: string } {
  const [fy, fm, fd] = from.split('-').map(Number)
  const [ty, tm, td] = to.split('-').map(Number)
  const fromDate = new Date(fy, fm - 1, fd)
  const toDate = new Date(ty, tm - 1, td)
  const durationDays = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1

  function isoFromDayOffset(isoDate: string, offsetDays: number): string {
    const [y, m, d] = isoDate.split('-').map(Number)
    const date = new Date(y, m - 1, d + offsetDays)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  return {
    from: isoFromDayOffset(from, -durationDays),
    to: isoFromDayOffset(from, -1),
  }
}

export function useFinancePage() {
  const { showAlert } = useGlobalAlerts()

  // ── Data state (owned by orchestration hook) ───────────────────────────────
  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [previousSummary, setPreviousSummary] = useState<FinanceSummary | null>(null)
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [transactionsTotal, setTransactionsTotal] = useState(0)
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [planBlocked, setPlanBlocked] = useState(false)
  const didMountTransactionsPagination = useRef(false)

  // ── Filters + pagination (sub-hook) ───────────────────────────────────────
  const {
    filters,
    transactionsPage,
    transactionsPageSize,
    setFilter,
    setTransactionsPage,
    setTransactionsPageSize,
  } = useFinanceFilters()

  // ── Derived category lists ─────────────────────────────────────────────────
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === 'INCOME'),
    [categories],
  )
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'EXPENSE'),
    [categories],
  )

  // ── Full-page reload (called on mount, filter change, and after mutations) ─
  function load() {
    setIsLoading(true)
    setLoadError(null)

    const prevPeriod = getPreviousPeriod(filters.from, filters.to)
    const previousFilters: FinanceFilters = {
      from: prevPeriod.from,
      to: prevPeriod.to,
      groupBy: filters.groupBy,
      type: filters.type,
      status: filters.status,
      categoryId: filters.categoryId,
    }

    Promise.all([
      getFinanceSummary(filters),
      listFinancialCategories(),
      listFinancialTransactions(filters, 1, transactionsPageSize),
      listFixedExpenses(),
      getFinanceSummary(previousFilters).catch(() => null),
    ])
      .then(
        ([
          summaryResponse,
          categoriesResponse,
          transactionsResponse,
          fixedResponse,
          prevSummaryResponse,
        ]) => {
          setSummary(summaryResponse)
          setCategories(categoriesResponse)
          setTransactions(transactionsResponse.data)
          setTransactionsTotal(transactionsResponse.total)
          setTransactionsPage(transactionsResponse.page)
          setFixedExpenses(fixedResponse)
          setPreviousSummary(prevSummaryResponse)
        },
      )
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) {
          setPlanBlocked(true)
          return
        }
        const message =
          err instanceof Error ? err.message : 'Não foi possível carregar o financeiro.'
        setLoadError(message)
        showAlert({
          title: 'Erro ao carregar financeiro',
          description: message,
          tone: 'error',
        })
      })
      .finally(() => setIsLoading(false))
  }

  // ── Pagination-only reload ─────────────────────────────────────────────────
  function loadTransactions(page = transactionsPage, pageSize = transactionsPageSize) {
    setIsLoadingTransactions(true)

    listFinancialTransactions(filters, page, pageSize)
      .then((transactionsResponse) => {
        setTransactions(transactionsResponse.data)
        setTransactionsTotal(transactionsResponse.total)
        setTransactionsPage(transactionsResponse.page)
        setTransactionsPageSize(transactionsResponse.limit)
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : 'Não foi possível carregar as movimentações.'
        showAlert({
          title: 'Erro ao carregar movimentacoes',
          description: message,
          tone: 'error',
        })
      })
      .finally(() => setIsLoadingTransactions(false))
  }

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    load()
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!didMountTransactionsPagination.current) {
      didMountTransactionsPagination.current = true
      return
    }
    loadTransactions(transactionsPage, transactionsPageSize)
  }, [transactionsPage, transactionsPageSize]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Domain sub-hooks (each delegates CRUD state + handlers) ───────────────
  const transactionsHook = useFinanceTransactions(load, incomeCategories, expenseCategories)
  const categoriesHook = useFinanceCategories(load)
  const fixedExpensesHook = useFinanceFixedExpenses(load, filters)

  // ── Public API (identical shape to original useFinancePage) ────────────────
  return {
    // Data
    filters,
    summary,
    previousSummary,
    categories,
    transactions,
    transactionsTotal,
    transactionsPage,
    transactionsPageSize,
    fixedExpenses,
    // Loading / error
    isLoading,
    isLoadingTransactions,
    loadError,
    planBlocked,
    // Derived
    incomeCategories,
    expenseCategories,
    // Actions
    load,
    setFilter,
    setTransactionsPage,
    setTransactionsPageSize,
    // Transaction CRUD (from sub-hook)
    ...transactionsHook,
    // Category CRUD (from sub-hook)
    ...categoriesHook,
    // Fixed expense CRUD (from sub-hook)
    ...fixedExpensesHook,
  }
}
