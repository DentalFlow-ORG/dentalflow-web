import { useEffect, useMemo, useRef, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { ApiError } from '@/services/http'

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
} from '../services/finance.service'
import type {
  CategoryFormState,
  CreateFinancialCategoryDto,
  FinanceFilters,
  FinanceSummary,
  FinancialCategory,
  FinancialTransaction,
  FixedExpense,
  FixedExpenseEditFormState,
  FixedExpenseFormState,
  TransactionFormState,
} from '../types/finance.types'
import { CATEGORY_COLORS } from '../constants/finance-display'

const emptyCategoryForm: CategoryFormState = {
  name: '',
  type: 'INCOME',
  color: CATEGORY_COLORS[0],
}

function getMonthRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    from: formatDateInput(from),
    to: formatDateInput(to),
  }
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPreviousPeriod(from: string, to: string): { from: string; to: string } {
  const [fy, fm, fd] = from.split('-').map(Number)
  const [ty, tm, td] = to.split('-').map(Number)
  const fromDate = new Date(fy, fm - 1, fd)
  const toDate = new Date(ty, tm - 1, td)
  const durationDays = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1
  const prevToMs = fromDate.getTime() - 86400000
  const prevFromMs = prevToMs - (durationDays - 1) * 86400000
  return {
    from: formatDateInput(new Date(prevFromMs)),
    to: formatDateInput(new Date(prevToMs)),
  }
}

const currentPeriod = getMonthRange()

const initialFilters: FinanceFilters = {
  from: currentPeriod.from,
  to: currentPeriod.to,
  groupBy: 'day',
}

const emptyTransactionForm: TransactionFormState = {
  type: 'INCOME',
  categoryId: '',
  amount: '',
  description: '',
  transactionDate: formatDateInput(new Date()),
  dueDate: '',
  status: 'PAID',
}

const emptyFixedExpenseForm: FixedExpenseFormState = {
  categoryId: '',
  description: '',
  amount: '',
  recurrence: 'MONTHLY',
  dueDay: String(new Date().getDate()),
  startDate: formatDateInput(new Date()),
}

export function useFinancePage() {
  const { showAlert } = useGlobalAlerts()
  const [filters, setFilters] = useState<FinanceFilters>(initialFilters)
  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [previousSummary, setPreviousSummary] = useState<FinanceSummary | null>(null)
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [transactionsTotal, setTransactionsTotal] = useState(0)
  const [transactionsPage, setTransactionsPage] = useState(1)
  const [transactionsPageSize, setTransactionsPageSize] = useState(20)
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [planBlocked, setPlanBlocked] = useState(false)
  const [transactionForm, setTransactionForm] =
    useState<TransactionFormState>(emptyTransactionForm)
  const [fixedExpenseForm, setFixedExpenseForm] =
    useState<FixedExpenseFormState>(emptyFixedExpenseForm)
  const [transactionError, setTransactionError] = useState<string | null>(null)
  const [fixedExpenseError, setFixedExpenseError] = useState<string | null>(null)
  const [isSavingTransaction, setIsSavingTransaction] = useState(false)
  const [isSavingFixedExpense, setIsSavingFixedExpense] = useState(false)
  const [generatingExpenseId, setGeneratingExpenseId] = useState<string | null>(null)
  const [editingFixedExpense, setEditingFixedExpense] = useState<FixedExpense | null>(null)
  const [togglingFixedExpense, setTogglingFixedExpense] = useState<FixedExpense | null>(null)
  const [fixedExpenseEditForm, setFixedExpenseEditForm] = useState<FixedExpenseEditFormState>({
    categoryId: '',
    description: '',
    amount: '',
    recurrence: 'MONTHLY',
    dueDay: '1',
    startDate: '',
    endDate: '',
  })
  const [fixedExpenseEditError, setFixedExpenseEditError] = useState<string | null>(null)
  const [isUpdatingFixedExpense, setIsUpdatingFixedExpense] = useState(false)
  const [isTogglingFixedExpense, setIsTogglingFixedExpense] = useState(false)
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm)
  const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null)
  const [categoryEditForm, setCategoryEditForm] = useState<CategoryFormState>(emptyCategoryForm)
  const [deletingCategory, setDeletingCategory] = useState<FinancialCategory | null>(null)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [categoryEditError, setCategoryEditError] = useState<string | null>(null)
  const [isSavingCategory, setIsSavingCategory] = useState(false)
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<FinancialTransaction | null>(null)
  const [editForm, setEditForm] = useState<TransactionFormState>(emptyTransactionForm)
  const [editError, setEditError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const didMountTransactionsPagination = useRef(false)

  const incomeCategories = useMemo(
    () => categories.filter((category) => category.type === 'INCOME'),
    [categories],
  )
  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === 'EXPENSE'),
    [categories],
  )
  const transactionCategories =
    transactionForm.type === 'INCOME' ? incomeCategories : expenseCategories

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
      .then(([summaryResponse, categoriesResponse, transactionsResponse, fixedResponse, prevSummaryResponse]) => {
        setSummary(summaryResponse)
        setCategories(categoriesResponse)
        setTransactions(transactionsResponse.data)
        setTransactionsTotal(transactionsResponse.total)
        setTransactionsPage(transactionsResponse.page)
        setFixedExpenses(fixedResponse)
        setPreviousSummary(prevSummaryResponse)
      })
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

  function setFilter<K extends keyof FinanceFilters>(field: K, value: FinanceFilters[K]) {
    setTransactionsPage(1)
    setFilters((prev) => ({ ...prev, [field]: value || undefined }))
  }

  function setTransaction<K extends keyof TransactionFormState>(
    field: K,
    value: TransactionFormState[K],
  ) {
    setTransactionForm((prev) => {
      const next = { ...prev, [field]: value }

      if (field === 'type') {
        next.categoryId = ''
      }

      return next
    })
  }

  function setFixedExpense<K extends keyof FixedExpenseFormState>(
    field: K,
    value: FixedExpenseFormState[K],
  ) {
    setFixedExpenseForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleCreateTransaction(event: React.FormEvent) {
    event.preventDefault()
    setTransactionError(null)

    if (!transactionForm.categoryId || !transactionForm.amount || !transactionForm.description) {
      setTransactionError('Categoria, valor e descricao sao obrigatorios.')
      return
    }

    setIsSavingTransaction(true)
    try {
      await createFinancialTransaction({
        type: transactionForm.type,
        categoryId: transactionForm.categoryId,
        amount: Number(transactionForm.amount),
        description: transactionForm.description.trim(),
        transactionDate: transactionForm.transactionDate,
        dueDate: transactionForm.dueDate || undefined,
        status: transactionForm.status,
      })
      showAlert({
        title: 'Movimentacao criada',
        description: 'O lancamento foi registrado no financeiro.',
        tone: 'success',
      })
      setTransactionForm(emptyTransactionForm)
      load()
    } catch (err) {
      setTransactionError(err instanceof Error ? err.message : 'Erro ao salvar movimentacao.')
    } finally {
      setIsSavingTransaction(false)
    }
  }

  async function handleCreateFixedExpense(event: React.FormEvent) {
    event.preventDefault()
    setFixedExpenseError(null)

    if (!fixedExpenseForm.categoryId || !fixedExpenseForm.amount || !fixedExpenseForm.description) {
      setFixedExpenseError('Categoria, valor e descricao sao obrigatorios.')
      return
    }

    setIsSavingFixedExpense(true)
    try {
      await createFixedExpense({
        categoryId: fixedExpenseForm.categoryId,
        amount: Number(fixedExpenseForm.amount),
        description: fixedExpenseForm.description.trim(),
        recurrence: fixedExpenseForm.recurrence,
        dueDay: Number(fixedExpenseForm.dueDay),
        startDate: fixedExpenseForm.startDate,
        isActive: true,
      })
      showAlert({
        title: 'Despesa fixa criada',
        description: 'A despesa recorrente foi cadastrada.',
        tone: 'success',
      })
      setFixedExpenseForm(emptyFixedExpenseForm)
      load()
    } catch (err) {
      setFixedExpenseError(err instanceof Error ? err.message : 'Erro ao salvar despesa fixa.')
    } finally {
      setIsSavingFixedExpense(false)
    }
  }

  function setCategory<K extends keyof CategoryFormState>(field: K, value: CategoryFormState[K]) {
    setCategoryForm((prev) => ({ ...prev, [field]: value }))
  }

  function setCategoryEdit<K extends keyof CategoryFormState>(field: K, value: CategoryFormState[K]) {
    setCategoryEditForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleOpenEditCategory(category: FinancialCategory) {
    setCategoryEditForm({
      name: category.name,
      type: category.type,
      color: category.color ?? CATEGORY_COLORS[0],
    })
    setCategoryEditError(null)
    setEditingCategory(category)
  }

  async function handleCreateCategory(event: React.FormEvent) {
    event.preventDefault()
    setCategoryError(null)

    if (!categoryForm.name.trim()) {
      setCategoryError('O nome da categoria e obrigatorio.')
      return
    }

    setIsSavingCategory(true)
    try {
      const dto: CreateFinancialCategoryDto = {
        name: categoryForm.name.trim(),
        type: categoryForm.type,
        color: categoryForm.color,
      }
      await createFinancialCategory(dto)
      showAlert({
        title: 'Categoria criada',
        description: `"${dto.name}" foi adicionada as categorias.`,
        tone: 'success',
      })
      setCategoryForm(emptyCategoryForm)
      load()
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : 'Erro ao criar categoria.')
    } finally {
      setIsSavingCategory(false)
    }
  }

  async function handleUpdateCategory(event: React.FormEvent) {
    event.preventDefault()
    if (!editingCategory) return
    setCategoryEditError(null)

    if (!categoryEditForm.name.trim()) {
      setCategoryEditError('O nome da categoria e obrigatorio.')
      return
    }

    setIsUpdatingCategory(true)
    try {
      await updateFinancialCategory(editingCategory.id, {
        name: categoryEditForm.name.trim(),
        type: categoryEditForm.type,
        color: categoryEditForm.color,
      })
      showAlert({
        title: 'Categoria atualizada',
        description: 'As alteracoes foram salvas.',
        tone: 'success',
      })
      setEditingCategory(null)
      load()
    } catch (err) {
      setCategoryEditError(err instanceof Error ? err.message : 'Erro ao atualizar categoria.')
    } finally {
      setIsUpdatingCategory(false)
    }
  }

  async function handleDeleteCategory() {
    if (!deletingCategory) return
    setIsDeletingCategory(true)
    try {
      await deleteFinancialCategory(deletingCategory.id)
      showAlert({
        title: 'Categoria removida',
        description: `"${deletingCategory.name}" foi removida.`,
        tone: 'success',
      })
      setDeletingCategory(null)
      load()
    } catch (err) {
      showAlert({
        title: 'Nao foi possivel remover',
        description:
          err instanceof Error ? err.message : 'Verifique se a categoria possui lancamentos vinculados.',
        tone: 'error',
      })
      setDeletingCategory(null)
    } finally {
      setIsDeletingCategory(false)
    }
  }

  function handleOpenEditFixedExpense(expense: FixedExpense) {
    setFixedExpenseEditForm({
      categoryId: expense.categoryId,
      description: expense.description,
      amount: String(expense.amount),
      recurrence: expense.recurrence,
      dueDay: String(expense.dueDay),
      startDate: expense.startDate.slice(0, 10),
      endDate: expense.endDate?.slice(0, 10) ?? '',
    })
    setFixedExpenseEditError(null)
    setEditingFixedExpense(expense)
  }

  function setFixedExpenseEditField<K extends keyof FixedExpenseEditFormState>(
    field: K,
    value: FixedExpenseEditFormState[K],
  ) {
    setFixedExpenseEditForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleUpdateFixedExpense(event: React.FormEvent) {
    event.preventDefault()
    if (!editingFixedExpense) return
    setFixedExpenseEditError(null)

    if (!fixedExpenseEditForm.categoryId || !fixedExpenseEditForm.amount || !fixedExpenseEditForm.description) {
      setFixedExpenseEditError('Categoria, valor e descricao sao obrigatorios.')
      return
    }

    setIsUpdatingFixedExpense(true)
    try {
      await updateFixedExpense(editingFixedExpense.id, {
        categoryId: fixedExpenseEditForm.categoryId,
        description: fixedExpenseEditForm.description.trim(),
        amount: Number(fixedExpenseEditForm.amount),
        recurrence: fixedExpenseEditForm.recurrence,
        dueDay: Number(fixedExpenseEditForm.dueDay),
        startDate: fixedExpenseEditForm.startDate,
        endDate: fixedExpenseEditForm.endDate || null,
      })
      showAlert({
        title: 'Despesa fixa atualizada',
        description: 'As alteracoes foram salvas com sucesso.',
        tone: 'success',
      })
      setEditingFixedExpense(null)
      load()
    } catch (err) {
      setFixedExpenseEditError(
        err instanceof Error ? err.message : 'Erro ao atualizar despesa fixa.',
      )
    } finally {
      setIsUpdatingFixedExpense(false)
    }
  }

  async function handleToggleFixedExpense() {
    if (!togglingFixedExpense) return
    setIsTogglingFixedExpense(true)
    const nextActive = !togglingFixedExpense.isActive
    try {
      await updateFixedExpense(togglingFixedExpense.id, { isActive: nextActive })
      showAlert({
        title: nextActive ? 'Despesa fixa ativada' : 'Despesa fixa desativada',
        description: `"${togglingFixedExpense.description}" foi ${nextActive ? 'ativada' : 'desativada'}.`,
        tone: 'success',
      })
      setTogglingFixedExpense(null)
      load()
    } catch (err) {
      showAlert({
        title: 'Erro ao alterar status',
        description: err instanceof Error ? err.message : 'Nao foi possivel alterar o status.',
        tone: 'error',
      })
    } finally {
      setIsTogglingFixedExpense(false)
    }
  }

  function handleOpenEdit(transaction: FinancialTransaction) {
    setEditForm({
      type: transaction.type,
      categoryId: transaction.categoryId,
      amount: String(transaction.amount),
      description: transaction.description,
      transactionDate: transaction.transactionDate.slice(0, 10),
      dueDate: transaction.dueDate?.slice(0, 10) ?? '',
      status: transaction.status,
    })
    setEditError(null)
    setEditingTransaction(transaction)
  }

  function setEditField<K extends keyof TransactionFormState>(
    field: K,
    value: TransactionFormState[K],
  ) {
    setEditForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'type') next.categoryId = ''
      return next
    })
  }

  async function handleUpdateTransaction(event: React.FormEvent) {
    event.preventDefault()
    if (!editingTransaction) return
    setEditError(null)

    if (!editForm.categoryId || !editForm.amount || !editForm.description) {
      setEditError('Categoria, valor e descricao sao obrigatorios.')
      return
    }

    setIsUpdating(true)
    try {
      await updateFinancialTransaction(editingTransaction.id, {
        type: editForm.type,
        categoryId: editForm.categoryId,
        amount: Number(editForm.amount),
        description: editForm.description.trim(),
        transactionDate: editForm.transactionDate,
        dueDate: editForm.dueDate || null,
        status: editForm.status,
      })
      showAlert({
        title: 'Movimentacao atualizada',
        description: 'O lancamento foi atualizado com sucesso.',
        tone: 'success',
      })
      setEditingTransaction(null)
      load()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Erro ao atualizar movimentacao.')
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleDeleteTransaction() {
    if (!deletingTransaction) return
    setIsDeleting(true)
    try {
      await deleteFinancialTransaction(deletingTransaction.id)
      showAlert({
        title: 'Lancamento cancelado',
        description: `"${deletingTransaction.description}" foi cancelado.`,
        tone: 'success',
      })
      setDeletingTransaction(null)
      load()
    } catch (err) {
      showAlert({
        title: 'Erro ao cancelar lancamento',
        description: err instanceof Error ? err.message : 'Nao foi possivel cancelar.',
        tone: 'error',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleGenerateFixedExpense(expense: FixedExpense) {
    setGeneratingExpenseId(expense.id)
    try {
      await generateFixedExpenseOccurrence(expense.id, filters.from.slice(0, 7))
      showAlert({
        title: 'Lancamento gerado',
        description: `${expense.description} foi adicionada ao periodo atual.`,
        tone: 'success',
      })
      load()
    } catch (err) {
      showAlert({
        title: 'Erro ao gerar lancamento',
        description: err instanceof Error ? err.message : 'Nao foi possivel gerar a despesa.',
        tone: 'error',
      })
    } finally {
      setGeneratingExpenseId(null)
    }
  }

  return {
    filters,
    summary,
    previousSummary,
    categories,
    transactions,
    transactionsTotal,
    transactionsPage,
    transactionsPageSize,
    fixedExpenses,
    isLoading,
    isLoadingTransactions,
    loadError,
    planBlocked,
    transactionForm,
    fixedExpenseForm,
    transactionError,
    fixedExpenseError,
    isSavingTransaction,
    isSavingFixedExpense,
    generatingExpenseId,
    editingFixedExpense,
    setEditingFixedExpense,
    togglingFixedExpense,
    setTogglingFixedExpense,
    fixedExpenseEditForm,
    fixedExpenseEditError,
    isUpdatingFixedExpense,
    isTogglingFixedExpense,
    categoryForm,
    editingCategory,
    setEditingCategory,
    categoryEditForm,
    deletingCategory,
    setDeletingCategory,
    categoryError,
    categoryEditError,
    isSavingCategory,
    isUpdatingCategory,
    isDeletingCategory,
    editingTransaction,
    setEditingTransaction,
    deletingTransaction,
    setDeletingTransaction,
    editForm,
    editError,
    isUpdating,
    isDeleting,
    incomeCategories,
    expenseCategories,
    transactionCategories,
    load,
    setFilter,
    setTransaction,
    setFixedExpense,
    handleCreateTransaction,
    handleCreateFixedExpense,
    setCategory,
    setCategoryEdit,
    handleOpenEditCategory,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleOpenEditFixedExpense,
    setFixedExpenseEditField,
    handleUpdateFixedExpense,
    handleToggleFixedExpense,
    handleOpenEdit,
    setEditField,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleGenerateFixedExpense,
    setTransactionsPage,
    setTransactionsPageSize,
  }
}

