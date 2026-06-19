import { ArrowDownCircle, ArrowUpCircle, Loader2, Pencil, Trash2, WalletCards } from 'lucide-react'

type EmptyStateConfig = {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

function EmptyStateContent({ emptyState }: { emptyState?: EmptyStateConfig }) {
  if (!emptyState) {
    return <span className="text-sm text-muted-foreground">Nenhuma movimentação encontrada.</span>
  }
  return (
    <div>
      <p className="font-medium text-foreground">{emptyState.title}</p>
      {emptyState.description && (
        <p className="mt-1 text-sm text-muted-foreground">{emptyState.description}</p>
      )}
      {emptyState.actionLabel && emptyState.onAction && (
        <button
          type="button"
          onClick={emptyState.onAction}
          className="mt-3 text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          {emptyState.actionLabel}
        </button>
      )}
    </div>
  )
}

import { ActionIconButton } from '@/components/common/ActionIconButton'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { cn } from '@/lib/utils'

import { SOURCE_LABEL, STATUS_LABEL, TYPE_LABEL, statusTone } from '../constants/finance-display'
import type { ClassifierState } from '../hooks/useExpenseClassifier'
import type { FinancialTransaction } from '../types/finance.types'
import { formatCurrency, formatDate } from '../utils/finance-format'
import { ExpenseClassifyAction } from './ExpenseClassifyAction'

export function TransactionsTable({
  transactions,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  getClassifierState,
  onClassify,
  onApplyCategory,
  onDismissClassify,
  emptyState,
}: {
  transactions: FinancialTransaction[]
  isLoading: boolean
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onEdit: (transaction: FinancialTransaction) => void
  onDelete: (transaction: FinancialTransaction) => void
  getClassifierState: (transactionId: string) => ClassifierState
  onClassify: (transactionId: string) => void
  onApplyCategory: (transactionId: string, categoryId: string) => void
  onDismissClassify: (transactionId: string) => void
  emptyState?: EmptyStateConfig
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <PanelCard>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Movimentações</h2>
          <p className="mt-1 text-sm text-muted-foreground">Últimos lançamentos do período.</p>
        </div>
        {isLoading ? (
          <span role="status" aria-label="Carregando movimentações">
            <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          </span>
        ) : (
          <WalletCards className="h-5 w-5 text-primary" aria-hidden="true" />
        )}
      </div>

      {/* ── Mobile cards ───────────────────────────────────────────────── */}
      <div className="space-y-3 md:hidden">
        {transactions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <EmptyStateContent emptyState={emptyState} />
          </div>
        ) : (
          transactions.map((transaction) => {
            const isIncome = transaction.type === 'INCOME'
            const amountClass = isIncome
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-red-700 dark:text-red-400'

            return (
              <div
                key={transaction.id}
                className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm"
              >
                {/* Description + Amount */}
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                    {transaction.description}
                  </p>
                  <span className={cn('shrink-0 text-sm font-semibold tabular-nums', amountClass)}>
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>

                {/* Type + Status badges */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-xs font-semibold',
                      amountClass,
                    )}
                  >
                    {isIncome ? (
                      <ArrowUpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <ArrowDownCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {TYPE_LABEL[transaction.type]}
                  </span>
                  <StatusBadge tone={statusTone[transaction.status]}>
                    {STATUS_LABEL[transaction.status]}
                  </StatusBadge>
                </div>

                {/* Date · Category */}
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(transaction.transactionDate)}
                  {' · '}
                  {transaction.category?.name ?? 'Sem categoria'}
                </p>

                {/* Source · Service */}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {SOURCE_LABEL[transaction.source] ?? transaction.source}
                  {transaction.service?.name ? ` · ${transaction.service.name}` : ''}
                </p>

                {/* AI classify (EXPENSE only) */}
                {transaction.type === 'EXPENSE' && (
                  <ExpenseClassifyAction
                    transactionId={transaction.id}
                    state={getClassifierState(transaction.id)}
                    onClassify={onClassify}
                    onApply={onApplyCategory}
                    onDismiss={onDismissClassify}
                  />
                )}

                {/* Actions */}
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-border/50 pt-3">
                  <ActionIconButton
                    title="Editar lançamento"
                    aria-label="Editar lançamento"
                    onClick={() => onEdit(transaction)}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </ActionIconButton>
                  <ActionIconButton
                    tone="danger"
                    title="Cancelar lançamento"
                    aria-label="Cancelar lançamento"
                    disabled={transaction.status === 'CANCELED'}
                    onClick={() => onDelete(transaction)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </ActionIconButton>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Desktop table ──────────────────────────────────────────────── */}
      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <div className="app-scrollbar overflow-x-auto">
          <table className="w-full min-w-205 text-sm" aria-label="Movimentações financeiras">
            <thead>
              <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-4 py-3">
                  Data
                </th>
                <th scope="col" className="px-4 py-3">
                  Tipo
                </th>
                <th scope="col" className="px-4 py-3">
                  Categoria
                </th>
                <th scope="col" className="px-4 py-3">
                  Descrição
                </th>
                <th scope="col" className="px-4 py-3">
                  Origem
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Valor
                </th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <EmptyStateContent emptyState={emptyState} />
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const isIncome = transaction.type === 'INCOME'
                  const amountClass = isIncome
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-red-700 dark:text-red-400'

                  return (
                    <tr key={transaction.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 font-semibold',
                            amountClass,
                          )}
                        >
                          {isIncome ? (
                            <ArrowUpCircle className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <ArrowDownCircle className="h-4 w-4" aria-hidden="true" />
                          )}
                          {TYPE_LABEL[transaction.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div>
                          <span>{transaction.category?.name ?? 'Sem categoria'}</span>
                          {transaction.type === 'EXPENSE' && (
                            <ExpenseClassifyAction
                              transactionId={transaction.id}
                              state={getClassifierState(transaction.id)}
                              onClassify={onClassify}
                              onApply={onApplyCategory}
                              onDismiss={onDismissClassify}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-50 truncate font-medium text-foreground">
                          {transaction.description}
                        </p>
                        {transaction.service?.name && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {transaction.service.name}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {SOURCE_LABEL[transaction.source] ?? transaction.source}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={statusTone[transaction.status]}>
                          {STATUS_LABEL[transaction.status]}
                        </StatusBadge>
                      </td>
                      <td className={cn('px-4 py-3 text-right font-semibold', amountClass)}>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <ActionIconButton
                            title="Editar lançamento"
                            aria-label="Editar lançamento"
                            onClick={() => onEdit(transaction)}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </ActionIconButton>
                          <ActionIconButton
                            tone="danger"
                            title="Cancelar lançamento"
                            aria-label="Cancelar lançamento"
                            disabled={transaction.status === 'CANCELED'}
                            onClick={() => onDelete(transaction)}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </ActionIconButton>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ────────────────────────────────────────────────── */}
      <Pagination
        className="mt-4 border-t border-border pt-4"
        page={page}
        totalPages={totalPages}
        filteredCount={total}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </PanelCard>
  )
}
