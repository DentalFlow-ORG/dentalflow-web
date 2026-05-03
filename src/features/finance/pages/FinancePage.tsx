import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarPlus,
  Layers,
  Loader2,
  Lock,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Scale,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useMemo, useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { ListPageShell } from '@/components/common/ListPageShell'
import { MetricCard } from '@/components/common/MetricCard'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

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
  CreateFinancialCategoryDto,
  FinanceFilters,
  FinanceSummary,
  FinancialCategory,
  FinancialTransaction,
  FinancialTransactionStatus,
  FinancialTransactionType,
  FixedExpense,
  FixedExpenseRecurrence,
} from '../types/finance.types'

type TransactionFormState = {
  type: FinancialTransactionType
  categoryId: string
  amount: string
  description: string
  transactionDate: string
  dueDate: string
  status: FinancialTransactionStatus
}

type FixedExpenseFormState = {
  categoryId: string
  description: string
  amount: string
  recurrence: FixedExpenseRecurrence
  dueDay: string
  startDate: string
}

type FixedExpenseEditFormState = FixedExpenseFormState & { endDate: string }

type CategoryFormState = {
  name: string
  type: FinancialTransactionType
  color: string
}

const CATEGORY_COLORS = [
  '#10B981',
  '#6366F1',
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#0EA5E9',
  '#7C3AED',
  '#64748B',
  '#EC4899',
  '#14B8A6',
] as const

const emptyCategoryForm: CategoryFormState = {
  name: '',
  type: 'INCOME',
  color: CATEGORY_COLORS[0],
}

const STATUS_LABEL: Record<FinancialTransactionStatus, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  CANCELED: 'Cancelado',
}

const TYPE_LABEL: Record<FinancialTransactionType, string> = {
  INCOME: 'Entrada',
  EXPENSE: 'Saida',
}

const SOURCE_LABEL: Record<string, string> = {
  MANUAL: 'Manual',
  SERVICE_PAYMENT: 'Servico pago',
  FIXED_EXPENSE: 'Despesa fixa',
  ADJUSTMENT: 'Ajuste',
}

const RECURRENCE_LABEL: Record<FixedExpenseRecurrence, string> = {
  MONTHLY: 'Mensal',
  WEEKLY: 'Semanal',
  YEARLY: 'Anual',
}

const statusTone: Record<FinancialTransactionStatus, 'success' | 'warning' | 'muted'> = {
  PAID: 'success',
  PENDING: 'warning',
  CANCELED: 'muted',
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

export function FinancePage() {
  const { showAlert } = useGlobalAlerts()
  const [filters, setFilters] = useState<FinanceFilters>(initialFilters)
  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
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

    Promise.all([
      getFinanceSummary(filters),
      listFinancialCategories(),
      listFinancialTransactions(filters, 1, 20),
      listFixedExpenses(),
    ])
      .then(([summaryResponse, categoriesResponse, transactionsResponse, fixedResponse]) => {
        setSummary(summaryResponse)
        setCategories(categoriesResponse)
        setTransactions(transactionsResponse.data)
        setFixedExpenses(fixedResponse)
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : 'Nao foi possivel carregar o financeiro.'
        setLoadError(message)
        showAlert({
          title: 'Erro ao carregar financeiro',
          description: message,
          tone: 'error',
        })
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    load()
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  function setFilter<K extends keyof FinanceFilters>(field: K, value: FinanceFilters[K]) {
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

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Gestao financeira"
        title="Financeiro da clinica"
        description="Acompanhe entradas, saidas, despesas fixas e desempenho financeiro por periodo."
        action={
          <Button variant="outline" onClick={load}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        }
      />

      <FinanceFiltersBar filters={filters} categories={categories} onChange={setFilter} />

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando dados financeiros..."
        error={loadError}
        onRetry={load}
        isEmpty={false}
      >
        {summary && (
          <>
            <KpiGrid summary={summary} />

            <div className="grid gap-6 lg:grid-cols-2">
              <PanelCard>
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      Entradas x saidas
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Evolucao financeira no periodo selecionado.
                    </p>
                  </div>
                  <StatusBadge tone={summary.kpis.netProfit >= 0 ? 'success' : 'warning'}>
                    {summary.kpis.netProfit >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
                  </StatusBadge>
                </div>
                <IncomeExpensesChart summary={summary} />
              </PanelCard>

              <PanelCard>
                <h2 className="text-base font-semibold text-slate-950">
                  Composicao financeira
                </h2>
                <div className="mt-5 space-y-6">
                  <Ranking
                    title="Despesas por categoria"
                    items={summary.expensesByCategory.map((item) => ({
                      label: item.categoryName,
                      amount: item.amount,
                      color: item.color ?? '#EF4444',
                    }))}
                  />
                  <Ranking
                    title="Receitas por servico"
                    items={summary.incomeByService.map((item) => ({
                      label: item.serviceName,
                      amount: item.amount,
                      color: '#10B981',
                    }))}
                  />
                </div>
              </PanelCard>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <TransactionsTable
                transactions={transactions}
                onEdit={handleOpenEdit}
                onDelete={setDeletingTransaction}
              />
              <TransactionForm
                form={transactionForm}
                categories={transactionCategories}
                error={transactionError}
                isSubmitting={isSavingTransaction}
                onChange={setTransaction}
                onSubmit={handleCreateTransaction}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <FixedExpensesList
                expenses={fixedExpenses}
                generatingExpenseId={generatingExpenseId}
                onGenerate={handleGenerateFixedExpense}
                onEdit={handleOpenEditFixedExpense}
                onToggle={setTogglingFixedExpense}
              />
              <FixedExpenseForm
                form={fixedExpenseForm}
                categories={expenseCategories}
                error={fixedExpenseError}
                isSubmitting={isSavingFixedExpense}
                onChange={setFixedExpense}
                onSubmit={handleCreateFixedExpense}
              />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <CategoriesPanel
                categories={categories}
                onEdit={handleOpenEditCategory}
                onDelete={setDeletingCategory}
              />
              <CategoryCreateForm
                form={categoryForm}
                error={categoryError}
                isSubmitting={isSavingCategory}
                onChange={setCategory}
                onSubmit={handleCreateCategory}
              />
            </div>
          </>
        )}
      </ListPageShell>

      <CategoryEditModal
        category={editingCategory}
        form={categoryEditForm}
        error={categoryEditError}
        isSubmitting={isUpdatingCategory}
        onChange={setCategoryEdit}
        onSubmit={handleUpdateCategory}
        onClose={() => setEditingCategory(null)}
      />

      <ConfirmDialog
        open={deletingCategory !== null}
        title="Remover categoria"
        subject={deletingCategory?.name}
        description="A categoria sera removida permanentemente. Categorias com lancamentos vinculados nao podem ser removidas."
        confirmLabel="Remover categoria"
        tone="destructive"
        isConfirming={isDeletingCategory}
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeletingCategory(null)}
      />

      <FixedExpenseEditModal
        expense={editingFixedExpense}
        form={fixedExpenseEditForm}
        categories={expenseCategories}
        error={fixedExpenseEditError}
        isSubmitting={isUpdatingFixedExpense}
        onChange={setFixedExpenseEditField}
        onSubmit={handleUpdateFixedExpense}
        onClose={() => setEditingFixedExpense(null)}
      />

      <ConfirmDialog
        open={togglingFixedExpense !== null}
        title={togglingFixedExpense?.isActive ? 'Desativar despesa fixa' : 'Ativar despesa fixa'}
        subject={togglingFixedExpense?.description}
        description={
          togglingFixedExpense?.isActive
            ? 'A despesa sera desativada e nao podera gerar novos lancamentos ate ser reativada.'
            : 'A despesa sera reativada e voltara a poder gerar lancamentos.'
        }
        confirmLabel={togglingFixedExpense?.isActive ? 'Desativar' : 'Ativar'}
        tone={togglingFixedExpense?.isActive ? 'destructive' : 'warning'}
        isConfirming={isTogglingFixedExpense}
        onConfirm={handleToggleFixedExpense}
        onCancel={() => setTogglingFixedExpense(null)}
      />

      <TransactionEditModal
        transaction={editingTransaction}
        form={editForm}
        categories={
          editForm.type === 'INCOME' ? incomeCategories : expenseCategories
        }
        error={editError}
        isSubmitting={isUpdating}
        onChange={setEditField}
        onSubmit={handleUpdateTransaction}
        onClose={() => setEditingTransaction(null)}
      />

      <ConfirmDialog
        open={deletingTransaction !== null}
        title="Cancelar lancamento"
        subject={deletingTransaction?.description}
        description="O lancamento sera marcado como cancelado e nao contara nos totais do periodo. Esta acao pode ser desfeita editando o status do lancamento."
        confirmLabel="Cancelar lancamento"
        tone="destructive"
        isConfirming={isDeleting}
        onConfirm={handleDeleteTransaction}
        onCancel={() => setDeletingTransaction(null)}
      />
    </AppPage>
  )
}

function FinanceFiltersBar({
  filters,
  categories,
  onChange,
}: {
  filters: FinanceFilters
  categories: FinancialCategory[]
  onChange: <K extends keyof FinanceFilters>(field: K, value: FinanceFilters[K]) => void
}) {
  return (
    <PanelCard className="p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <FormField label="Inicio" htmlFor="financeFrom">
          <DatePickerInput
            id="financeFrom"
            value={filters.from}
            onValueChange={(value) => onChange('from', value)}
          />
        </FormField>
        <FormField label="Fim" htmlFor="financeTo">
          <DatePickerInput
            id="financeTo"
            value={filters.to}
            onValueChange={(value) => onChange('to', value)}
          />
        </FormField>
        <FormField label="Agrupar" htmlFor="financeGroupBy">
          <Select value={filters.groupBy} onValueChange={(value) => onChange('groupBy', value as never)}>
            <SelectTrigger id="financeGroupBy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dia</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mes</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Tipo" htmlFor="financeType">
          <Select
            value={filters.type ?? 'all'}
            onValueChange={(value) =>
              onChange('type', value === 'all' ? undefined : (value as FinancialTransactionType))
            }
          >
            <SelectTrigger id="financeType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="INCOME">Entradas</SelectItem>
              <SelectItem value="EXPENSE">Saidas</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Status" htmlFor="financeStatus">
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(value) =>
              onChange(
                'status',
                value === 'all' ? undefined : (value as FinancialTransactionStatus),
              )
            }
          >
            <SelectTrigger id="financeStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PAID">Pago</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="CANCELED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Categoria" htmlFor="financeCategory">
          <Select
            value={filters.categoryId ?? 'all'}
            onValueChange={(value) =>
              onChange('categoryId', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger id="financeCategory">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>
    </PanelCard>
  )
}

function KpiGrid({ summary }: { summary: FinanceSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <MetricCard value={formatCurrency(summary.kpis.totalIncome)} label="Entradas pagas" />
      <MetricCard value={formatCurrency(summary.kpis.totalExpenses)} label="Saidas pagas" />
      <MetricCard
        value={formatCurrency(summary.kpis.netProfit)}
        label="Lucro liquido"
        className={summary.kpis.netProfit >= 0 ? 'border-emerald-200' : 'border-red-200'}
      />
      <MetricCard
        value={`${summary.kpis.profitMargin.toFixed(1)}%`}
        label="Margem de lucro"
      />
      <MetricCard
        value={formatCurrency(summary.kpis.pendingReceivables)}
        label="Recebiveis pendentes"
      />
      <MetricCard
        value={formatCurrency(summary.kpis.fixedExpensesTotal)}
        label="Despesas fixas ativas"
      />
    </div>
  )
}

function IncomeExpensesChart({ summary }: { summary: FinanceSummary }) {
  const maxValue = Math.max(
    1,
    ...summary.incomeVsExpenses.flatMap((item) => [item.income, item.expenses]),
  )

  if (summary.incomeVsExpenses.length === 0) {
    return <EmptyChart message="Nenhuma movimentacao paga neste periodo." />
  }

  return (
    <div className="space-y-3">
      {summary.incomeVsExpenses.map((item) => (
        <div key={item.date} className="grid gap-2 sm:grid-cols-[96px_1fr] sm:items-center">
          <span className="text-xs font-semibold text-slate-500">{formatShortDate(item.date)}</span>
          <div className="space-y-1.5">
            <ChartBar
              label="Entradas"
              value={item.income}
              maxValue={maxValue}
              className="bg-emerald-500"
            />
            <ChartBar
              label="Saidas"
              value={item.expenses}
              maxValue={maxValue}
              className="bg-red-500"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function ChartBar({
  label,
  value,
  maxValue,
  className,
}: {
  label: string
  value: number
  maxValue: number
  className: string
}) {
  const width = Math.max(2, Math.round((value / maxValue) * 100))

  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={cn('h-full rounded-full', className)} style={{ width: `${width}%` }} />
      </div>
      <span className="w-24 shrink-0 text-right text-xs font-medium text-slate-600">
        {label}: {formatCurrency(value)}
      </span>
    </div>
  )
}

function Ranking({
  title,
  items,
}: {
  title: string
  items: Array<{ label: string; amount: number; color: string }>
}) {
  const maxValue = Math.max(1, ...items.map((item) => item.amount))

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? (
          <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">
            Sem dados no periodo.
          </p>
        ) : (
          items.slice(0, 5).map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-slate-700">{item.label}</span>
                <span className="shrink-0 text-slate-500">{formatCurrency(item.amount)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, Math.round((item.amount / maxValue) * 100))}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function TransactionsTable({
  transactions,
  onEdit,
  onDelete,
}: {
  transactions: FinancialTransaction[]
  onEdit: (transaction: FinancialTransaction) => void
  onDelete: (transaction: FinancialTransaction) => void
}) {
  return (
    <PanelCard>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Movimentacoes</h2>
          <p className="mt-1 text-sm text-slate-500">Ultimos lancamentos do periodo.</p>
        </div>
        <WalletCards className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-3 md:hidden">
        {transactions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            Nenhuma movimentacao encontrada.
          </p>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 font-semibold',
                        transaction.type === 'INCOME' ? 'text-emerald-700' : 'text-red-700',
                      )}
                    >
                      {transaction.type === 'INCOME' ? (
                        <ArrowUpCircle className="h-4 w-4" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4" />
                      )}
                      {TYPE_LABEL[transaction.type]}
                    </span>
                    <StatusBadge tone={statusTone[transaction.status]}>
                      {STATUS_LABEL[transaction.status]}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {transaction.description}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(transaction.transactionDate)} - {transaction.category?.name ?? 'Sem categoria'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {SOURCE_LABEL[transaction.source] ?? transaction.source}
                    {transaction.service?.name ? ` - ${transaction.service.name}` : ''}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-sm font-semibold',
                    transaction.type === 'INCOME' ? 'text-emerald-700' : 'text-red-700',
                  )}
                >
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-end gap-1">
                <button
                  type="button"
                  title="Editar lancamento"
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  onClick={() => onEdit(transaction)}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Cancelar lancamento"
                  disabled={transaction.status === 'CANCELED'}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:pointer-events-none disabled:opacity-30"
                  onClick={() => onDelete(transaction)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-slate-200 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Descricao</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                    Nenhuma movimentacao encontrada.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(transaction.transactionDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 font-semibold',
                          transaction.type === 'INCOME' ? 'text-emerald-700' : 'text-red-700',
                        )}
                      >
                        {transaction.type === 'INCOME' ? (
                          <ArrowUpCircle className="h-4 w-4" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4" />
                        )}
                        {TYPE_LABEL[transaction.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {transaction.category?.name ?? 'Sem categoria'}
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[200px] truncate font-medium text-slate-900">
                        {transaction.description}
                      </p>
                      {transaction.service?.name && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {transaction.service.name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {SOURCE_LABEL[transaction.source] ?? transaction.source}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={statusTone[transaction.status]}>
                        {STATUS_LABEL[transaction.status]}
                      </StatusBadge>
                    </td>
                    <td
                      className={cn(
                        'px-4 py-3 text-right font-semibold',
                        transaction.type === 'INCOME' ? 'text-emerald-700' : 'text-red-700',
                      )}
                    >
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Editar lancamento"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          onClick={() => onEdit(transaction)}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Cancelar lancamento"
                          disabled={transaction.status === 'CANCELED'}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:pointer-events-none disabled:opacity-30"
                          onClick={() => onDelete(transaction)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PanelCard>
  )
}

function TransactionForm({
  form,
  categories,
  error,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  form: TransactionFormState
  categories: FinancialCategory[]
  error: string | null
  isSubmitting: boolean
  onChange: <K extends keyof TransactionFormState>(
    field: K,
    value: TransactionFormState[K],
  ) => void
  onSubmit: (event: React.FormEvent) => void
}) {
  return (
    <PanelCard>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-950">Novo lancamento</h2>
          <p className="text-sm text-slate-500">Registre entradas ou despesas manuais.</p>
        </div>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        {error && <InlineFeedback>{error}</InlineFeedback>}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Tipo" htmlFor="transactionType">
            <Select
              value={form.type}
              onValueChange={(value) => onChange('type', value as FinancialTransactionType)}
            >
              <SelectTrigger id="transactionType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Entrada</SelectItem>
                <SelectItem value="EXPENSE">Saida</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Status" htmlFor="transactionStatus">
            <Select
              value={form.status}
              onValueChange={(value) => onChange('status', value as FinancialTransactionStatus)}
            >
              <SelectTrigger id="transactionStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAID">Pago</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="CANCELED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <FormField label="Categoria" htmlFor="transactionCategory">
          <Select value={form.categoryId} onValueChange={(value) => onChange('categoryId', value)}>
            <SelectTrigger id="transactionCategory">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Descricao" htmlFor="transactionDescription">
          <TextInput
            id="transactionDescription"
            value={form.description}
            maxLength={160}
            placeholder="Ex.: pagamento de clareamento"
            onChange={(event) => onChange('description', event.target.value)}
          />
        </FormField>
        <div className="grid items-end gap-4 sm:grid-cols-3">
          <FormField label="Valor" htmlFor="transactionAmount">
            <TextInput
              id="transactionAmount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0,00"
              value={form.amount}
              onChange={(event) => onChange('amount', event.target.value)}
            />
          </FormField>
          <FormField label="Data" htmlFor="transactionDate">
            <DatePickerInput
              id="transactionDate"
              value={form.transactionDate}
              onValueChange={(value) => onChange('transactionDate', value)}
            />
          </FormField>
          <FormField label="Vencimento" htmlFor="transactionDueDate" optional>
            <DatePickerInput
              id="transactionDueDate"
              value={form.dueDate}
              onValueChange={(value) => onChange('dueDate', value)}
            />
          </FormField>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar lancamento
        </Button>
      </form>
    </PanelCard>
  )
}

function FixedExpensesList({
  expenses,
  generatingExpenseId,
  onGenerate,
  onEdit,
  onToggle,
}: {
  expenses: FixedExpense[]
  generatingExpenseId: string | null
  onGenerate: (expense: FixedExpense) => void
  onEdit: (expense: FixedExpense) => void
  onToggle: (expense: FixedExpense) => void
}) {
  return (
    <PanelCard>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Despesas fixas</h2>
          <p className="mt-1 text-sm text-slate-500">
            Custos recorrentes e geracao de ocorrencias.
          </p>
        </div>
        <CalendarPlus className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            Nenhuma despesa fixa cadastrada.
          </p>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className={cn(
                'flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between',
                expense.isActive ? 'border-slate-200' : 'border-slate-100 bg-slate-50/60',
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn('font-semibold', expense.isActive ? 'text-slate-950' : 'text-slate-400')}>
                    {expense.description}
                  </p>
                  <StatusBadge tone={expense.isActive ? 'success' : 'muted'}>
                    {expense.isActive ? 'Ativa' : 'Inativa'}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {expense.category?.name ?? 'Sem categoria'} · {RECURRENCE_LABEL[expense.recurrence]} ·
                  dia {expense.dueDay}
                </p>
              </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
                <span className={cn('font-semibold', expense.isActive ? 'text-red-700' : 'text-slate-400')}>
                  {formatCurrency(expense.amount)}
                </span>
                <button
                  type="button"
                  title="Editar despesa fixa"
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  onClick={() => onEdit(expense)}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title={expense.isActive ? 'Desativar despesa fixa' : 'Ativar despesa fixa'}
                  className={cn(
                    'rounded-md p-1.5 transition-colors',
                    expense.isActive
                      ? 'text-slate-400 hover:bg-amber-50 hover:text-amber-600'
                      : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600',
                  )}
                  onClick={() => onToggle(expense)}
                >
                  {expense.isActive ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!expense.isActive || generatingExpenseId === expense.id}
                  onClick={() => onGenerate(expense)}
                >
                  {generatingExpenseId === expense.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarPlus className="h-4 w-4" />
                  )}
                  Gerar
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </PanelCard>
  )
}

function FixedExpenseForm({
  form,
  categories,
  error,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  form: FixedExpenseFormState
  categories: FinancialCategory[]
  error: string | null
  isSubmitting: boolean
  onChange: <K extends keyof FixedExpenseFormState>(
    field: K,
    value: FixedExpenseFormState[K],
  ) => void
  onSubmit: (event: React.FormEvent) => void
}) {
  return (
    <PanelCard>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-950">Nova despesa fixa</h2>
          <p className="text-sm text-slate-500">Cadastre custos recorrentes da clinica.</p>
        </div>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        {error && <InlineFeedback>{error}</InlineFeedback>}
        <FormField label="Categoria" htmlFor="fixedCategory">
          <Select value={form.categoryId} onValueChange={(value) => onChange('categoryId', value)}>
            <SelectTrigger id="fixedCategory">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Descricao" htmlFor="fixedDescription">
          <TextInput
            id="fixedDescription"
            value={form.description}
            maxLength={160}
            placeholder="Ex.: aluguel da clinica"
            onChange={(event) => onChange('description', event.target.value)}
          />
        </FormField>
        <div className="grid items-end gap-4 sm:grid-cols-3">
          <FormField label="Valor" htmlFor="fixedAmount">
            <TextInput
              id="fixedAmount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0,00"
              value={form.amount}
              onChange={(event) => onChange('amount', event.target.value)}
            />
          </FormField>
          <FormField label="Recorrencia" htmlFor="fixedRecurrence">
            <Select
              value={form.recurrence}
              onValueChange={(value) => onChange('recurrence', value as FixedExpenseRecurrence)}
            >
              <SelectTrigger id="fixedRecurrence">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Mensal</SelectItem>
                <SelectItem value="WEEKLY">Semanal</SelectItem>
                <SelectItem value="YEARLY">Anual</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Dia" htmlFor="fixedDueDay">
            <TextInput
              id="fixedDueDay"
              type="number"
              min="1"
              max="31"
              placeholder="1–31"
              value={form.dueDay}
              onChange={(event) => onChange('dueDay', event.target.value)}
            />
          </FormField>
        </div>
        <FormField label="Inicio" htmlFor="fixedStartDate">
          <DatePickerInput
            id="fixedStartDate"
            value={form.startDate}
            onValueChange={(value) => onChange('startDate', value)}
          />
        </FormField>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar despesa fixa
        </Button>
      </form>
    </PanelCard>
  )
}

function CategoriesPanel({
  categories,
  onEdit,
  onDelete,
}: {
  categories: FinancialCategory[]
  onEdit: (category: FinancialCategory) => void
  onDelete: (category: FinancialCategory) => void
}) {
  const income = categories.filter((c) => c.type === 'INCOME')
  const expense = categories.filter((c) => c.type === 'EXPENSE')

  return (
    <PanelCard>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Categorias</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie as categorias de entradas e saidas da clinica.
          </p>
        </div>
        <Layers className="h-5 w-5 text-primary" />
      </div>

      <div className="space-y-5">
        <CategoryGroup
          title="Entradas"
          titleColor="text-emerald-700"
          categories={income}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        <CategoryGroup
          title="Saidas"
          titleColor="text-red-700"
          categories={expense}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </PanelCard>
  )
}

function CategoryGroup({
  title,
  titleColor,
  categories,
  onEdit,
  onDelete,
}: {
  title: string
  titleColor: string
  categories: FinancialCategory[]
  onEdit: (category: FinancialCategory) => void
  onDelete: (category: FinancialCategory) => void
}) {
  return (
    <div>
      <h3 className={cn('mb-2 text-xs font-semibold uppercase tracking-wide', titleColor)}>
        {title}
      </h3>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        {categories.length === 0 ? (
          <p className="px-4 py-4 text-sm text-slate-500">Nenhuma categoria cadastrada.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/70">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color ?? '#94A3B8' }}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                  {category.name}
                </span>
                {category.isDefault && (
                  <span
                    title="Categoria padrao — nao pode ser removida"
                    className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
                  >
                    <Lock className="h-3 w-3" />
                    Padrao
                  </span>
                )}
                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  <button
                    type="button"
                    title="Editar categoria"
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    onClick={() => onEdit(category)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title={
                      category.isDefault
                        ? 'Categorias padrao nao podem ser removidas'
                        : 'Remover categoria'
                    }
                    disabled={category.isDefault}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:pointer-events-none disabled:opacity-25"
                    onClick={() => onDelete(category)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          title={color}
          className={cn(
            'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
            value === color ? 'border-slate-700 scale-110' : 'border-transparent',
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  )
}

function CategoryCreateForm({
  form,
  error,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  form: CategoryFormState
  error: string | null
  isSubmitting: boolean
  onChange: <K extends keyof CategoryFormState>(field: K, value: CategoryFormState[K]) => void
  onSubmit: (event: React.FormEvent) => void
}) {
  return (
    <PanelCard>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-950">Nova categoria</h2>
          <p className="text-sm text-slate-500">Crie categorias personalizadas para a clinica.</p>
        </div>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        {error && <InlineFeedback>{error}</InlineFeedback>}
        <FormField label="Tipo" htmlFor="catType">
          <Select
            value={form.type}
            onValueChange={(value) => onChange('type', value as FinancialTransactionType)}
          >
            <SelectTrigger id="catType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Entrada</SelectItem>
              <SelectItem value="EXPENSE">Saida</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Nome" htmlFor="catName">
          <TextInput
            id="catName"
            value={form.name}
            maxLength={80}
            placeholder="Ex.: Marketing, Equipamentos..."
            onChange={(event) => onChange('name', event.target.value)}
          />
        </FormField>
        <FormField label="Cor" htmlFor="catColor">
          <ColorPicker value={form.color} onChange={(color) => onChange('color', color)} />
        </FormField>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Criar categoria
        </Button>
      </form>
    </PanelCard>
  )
}

function CategoryEditModal({
  category,
  form,
  error,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: {
  category: FinancialCategory | null
  form: CategoryFormState
  error: string | null
  isSubmitting: boolean
  onChange: <K extends keyof CategoryFormState>(field: K, value: CategoryFormState[K]) => void
  onSubmit: (event: React.FormEvent) => void
  onClose: () => void
}) {
  return (
    <Dialog.Root open={category !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="edit-cat-title"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <Dialog.Title id="edit-cat-title" className="text-base font-semibold text-slate-950">
              Editar categoria
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form className="space-y-4 px-6 py-5" onSubmit={onSubmit}>
            {error && <InlineFeedback>{error}</InlineFeedback>}

            <FormField label="Tipo" htmlFor="editCatType">
              <Select
                value={form.type}
                onValueChange={(value) => onChange('type', value as FinancialTransactionType)}
              >
                <SelectTrigger id="editCatType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Entrada</SelectItem>
                  <SelectItem value="EXPENSE">Saida</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Nome" htmlFor="editCatName">
              <TextInput
                id="editCatName"
                value={form.name}
                maxLength={80}
                onChange={(event) => onChange('name', event.target.value)}
              />
            </FormField>

            <FormField label="Cor" htmlFor="editCatColor">
              <ColorPicker value={form.color} onChange={(color) => onChange('color', color)} />
            </FormField>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar alteracoes
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function FixedExpenseEditModal({
  expense,
  form,
  categories,
  error,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: {
  expense: FixedExpense | null
  form: FixedExpenseEditFormState
  categories: FinancialCategory[]
  error: string | null
  isSubmitting: boolean
  onChange: <K extends keyof FixedExpenseEditFormState>(field: K, value: FixedExpenseEditFormState[K]) => void
  onSubmit: (event: React.FormEvent) => void
  onClose: () => void
}) {
  return (
    <Dialog.Root open={expense !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="edit-fe-title"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <Dialog.Title id="edit-fe-title" className="text-base font-semibold text-slate-950">
              Editar despesa fixa
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form className="space-y-4 px-6 py-5" onSubmit={onSubmit}>
            {error && <InlineFeedback>{error}</InlineFeedback>}

            <FormField label="Categoria" htmlFor="editFeCategory">
              <Select value={form.categoryId} onValueChange={(value) => onChange('categoryId', value)}>
                <SelectTrigger id="editFeCategory">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Descricao" htmlFor="editFeDescription">
              <TextInput
                id="editFeDescription"
                value={form.description}
                maxLength={160}
                onChange={(event) => onChange('description', event.target.value)}
              />
            </FormField>

            <div className="grid items-end gap-4 sm:grid-cols-3">
              <FormField label="Valor" htmlFor="editFeAmount">
                <TextInput
                  id="editFeAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0,00"
                  value={form.amount}
                  onChange={(event) => onChange('amount', event.target.value)}
                />
              </FormField>
              <FormField label="Recorrencia" htmlFor="editFeRecurrence">
                <Select
                  value={form.recurrence}
                  onValueChange={(value) => onChange('recurrence', value as FixedExpenseRecurrence)}
                >
                  <SelectTrigger id="editFeRecurrence">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Dia" htmlFor="editFeDueDay">
                <TextInput
                  id="editFeDueDay"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1–31"
                  value={form.dueDay}
                  onChange={(event) => onChange('dueDay', event.target.value)}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Inicio" htmlFor="editFeStartDate">
                <DatePickerInput
                  id="editFeStartDate"
                  value={form.startDate}
                  onValueChange={(value) => onChange('startDate', value)}
                />
              </FormField>
              <FormField label="Fim" htmlFor="editFeEndDate" optional>
                <DatePickerInput
                  id="editFeEndDate"
                  value={form.endDate}
                  onValueChange={(value) => onChange('endDate', value)}
                />
              </FormField>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar alteracoes
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function TransactionEditModal({
  transaction,
  form,
  categories,
  error,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: {
  transaction: FinancialTransaction | null
  form: TransactionFormState
  categories: FinancialCategory[]
  error: string | null
  isSubmitting: boolean
  onChange: <K extends keyof TransactionFormState>(field: K, value: TransactionFormState[K]) => void
  onSubmit: (event: React.FormEvent) => void
  onClose: () => void
}) {
  return (
    <Dialog.Root open={transaction !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="edit-tx-title"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <Dialog.Title id="edit-tx-title" className="text-base font-semibold text-slate-950">
              Editar lancamento
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form className="space-y-4 px-6 py-5" onSubmit={onSubmit}>
            {error && <InlineFeedback>{error}</InlineFeedback>}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Tipo" htmlFor="editTxType">
                <Select
                  value={form.type}
                  onValueChange={(value) => onChange('type', value as FinancialTransactionType)}
                >
                  <SelectTrigger id="editTxType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Entrada</SelectItem>
                    <SelectItem value="EXPENSE">Saida</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Status" htmlFor="editTxStatus">
                <Select
                  value={form.status}
                  onValueChange={(value) => onChange('status', value as FinancialTransactionStatus)}
                >
                  <SelectTrigger id="editTxStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Pago</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="CANCELED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField label="Categoria" htmlFor="editTxCategory">
              <Select value={form.categoryId} onValueChange={(value) => onChange('categoryId', value)}>
                <SelectTrigger id="editTxCategory">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Descricao" htmlFor="editTxDescription">
              <TextInput
                id="editTxDescription"
                value={form.description}
                maxLength={160}
                onChange={(event) => onChange('description', event.target.value)}
              />
            </FormField>

            <div className="grid items-end gap-4 sm:grid-cols-3">
              <FormField label="Valor" htmlFor="editTxAmount">
                <TextInput
                  id="editTxAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0,00"
                  value={form.amount}
                  onChange={(event) => onChange('amount', event.target.value)}
                />
              </FormField>
              <FormField label="Data" htmlFor="editTxDate">
                <DatePickerInput
                  id="editTxDate"
                  value={form.transactionDate}
                  onValueChange={(value) => onChange('transactionDate', value)}
                />
              </FormField>
              <FormField label="Vencimento" htmlFor="editTxDueDate" optional>
                <DatePickerInput
                  id="editTxDueDate"
                  value={form.dueDate}
                  onValueChange={(value) => onChange('dueDate', value)}
                />
              </FormField>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar alteracoes
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
      {message}
    </div>
  )
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value))
}
