import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarPlus,
  Loader2,
  Plus,
  RefreshCw,
  Scale,
  WalletCards,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { FormField, DateInput, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { ListPageShell } from '@/components/common/ListPageShell'
import { MetricCard } from '@/components/common/MetricCard'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
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
  createFinancialTransaction,
  createFixedExpense,
  generateFixedExpenseOccurrence,
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
    <div className="mx-auto max-w-7xl space-y-6">
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

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
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

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <TransactionsTable transactions={transactions} />
              <TransactionForm
                form={transactionForm}
                categories={transactionCategories}
                error={transactionError}
                isSubmitting={isSavingTransaction}
                onChange={setTransaction}
                onSubmit={handleCreateTransaction}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <FixedExpensesList
                expenses={fixedExpenses}
                generatingExpenseId={generatingExpenseId}
                onGenerate={handleGenerateFixedExpense}
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
          </>
        )}
      </ListPageShell>
    </div>
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
          <DateInput
            id="financeFrom"
            value={filters.from}
            onChange={(event) => onChange('from', event.target.value)}
          />
        </FormField>
        <FormField label="Fim" htmlFor="financeTo">
          <DateInput
            id="financeTo"
            value={filters.to}
            onChange={(event) => onChange('to', event.target.value)}
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

function TransactionsTable({ transactions }: { transactions: FinancialTransaction[] }) {
  return (
    <PanelCard>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Movimentacoes</h2>
          <p className="mt-1 text-sm text-slate-500">Ultimos lancamentos do periodo.</p>
        </div>
        <WalletCards className="h-5 w-5 text-primary" />
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Descricao</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
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
                      <p className="max-w-[220px] truncate font-medium text-slate-900">
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
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Valor" htmlFor="transactionAmount">
            <TextInput
              id="transactionAmount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) => onChange('amount', event.target.value)}
            />
          </FormField>
          <FormField label="Data" htmlFor="transactionDate">
            <DateInput
              id="transactionDate"
              value={form.transactionDate}
              onChange={(event) => onChange('transactionDate', event.target.value)}
            />
          </FormField>
          <FormField label="Vencimento" htmlFor="transactionDueDate" optional>
            <DateInput
              id="transactionDueDate"
              value={form.dueDate}
              onChange={(event) => onChange('dueDate', event.target.value)}
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
}: {
  expenses: FixedExpense[]
  generatingExpenseId: string | null
  onGenerate: (expense: FixedExpense) => void
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
              className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">{expense.description}</p>
                  <StatusBadge tone={expense.isActive ? 'success' : 'muted'}>
                    {expense.isActive ? 'Ativa' : 'Inativa'}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {expense.category?.name ?? 'Sem categoria'} - {RECURRENCE_LABEL[expense.recurrence]} -
                  dia {expense.dueDay}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-semibold text-red-700">
                  {formatCurrency(expense.amount)}
                </span>
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
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Valor" htmlFor="fixedAmount">
            <TextInput
              id="fixedAmount"
              type="number"
              min="0.01"
              step="0.01"
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
              value={form.dueDay}
              onChange={(event) => onChange('dueDay', event.target.value)}
            />
          </FormField>
        </div>
        <FormField label="Inicio" htmlFor="fixedStartDate">
          <DateInput
            id="fixedStartDate"
            value={form.startDate}
            onChange={(event) => onChange('startDate', event.target.value)}
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
