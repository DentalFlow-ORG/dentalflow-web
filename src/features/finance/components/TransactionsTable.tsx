import { ArrowDownCircle, ArrowUpCircle, Loader2, Pencil, Trash2, WalletCards } from 'lucide-react'

import { ActionIconButton } from '@/components/common/ActionIconButton'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { cn } from '@/lib/utils'

import type { FinancialTransaction } from '../types/finance.types'
import { SOURCE_LABEL, STATUS_LABEL, TYPE_LABEL, statusTone } from '../utils/finance-constants'
import { formatCurrency, formatDate } from '../utils/finance-format'

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
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <PanelCard>
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
      <div className="space-y-3 md:hidden">
        {transactions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma movimentação encontrada.
          </p>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 font-semibold',
                        transaction.type === 'INCOME' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400',
                      )}
                    >
                      {transaction.type === 'INCOME' ? (
                        <ArrowUpCircle className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4" aria-hidden="true" />
                      )}
                      {TYPE_LABEL[transaction.type]}
                    </span>
                    <StatusBadge tone={statusTone[transaction.status]}>
                      {STATUS_LABEL[transaction.status]}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {transaction.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(transaction.transactionDate)} - {transaction.category?.name ?? 'Sem categoria'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {SOURCE_LABEL[transaction.source] ?? transaction.source}
                    {transaction.service?.name ? ` - ${transaction.service.name}` : ''}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-sm font-semibold',
                    transaction.type === 'INCOME' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400',
                  )}
                >
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-end gap-1">
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
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <div className="app-scrollbar overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm" aria-label="Movimentações financeiras">
            <thead>
              <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-4 py-3">Data</th>
                <th scope="col" className="px-4 py-3">Tipo</th>
                <th scope="col" className="px-4 py-3">Categoria</th>
                <th scope="col" className="px-4 py-3">Descrição</th>
                <th scope="col" className="px-4 py-3">Origem</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Valor</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhuma movimentação encontrada.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(transaction.transactionDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 font-semibold',
                          transaction.type === 'INCOME' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400',
                        )}
                      >
                        {transaction.type === 'INCOME' ? (
                          <ArrowUpCircle className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4" aria-hidden="true" />
                        )}
                        {TYPE_LABEL[transaction.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {transaction.category?.name ?? 'Sem categoria'}
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[200px] truncate font-medium text-foreground">
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
                    <td
                      className={cn(
                        'px-4 py-3 text-right font-semibold',
                        transaction.type === 'INCOME' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400',
                      )}
                    >
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Editar lançamento"
                          aria-label="Editar lançamento"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          onClick={() => onEdit(transaction)}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          title="Cancelar lançamento"
                          aria-label="Cancelar lançamento"
                          disabled={transaction.status === 'CANCELED'}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-300 transition-colors disabled:pointer-events-none disabled:opacity-30"
                          onClick={() => onDelete(transaction)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
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
