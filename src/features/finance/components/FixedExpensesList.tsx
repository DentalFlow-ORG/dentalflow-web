import { CalendarPlus, Loader2, Pause, Pencil, Play } from 'lucide-react'

import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { RECURRENCE_LABEL } from '../constants/finance-display'
import type { FixedExpense } from '../types/finance.types'
import { formatCurrency } from '../utils/finance-format'

export function FixedExpensesList({
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
          <h2 className="text-base font-semibold text-foreground">Despesas fixas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Custos recorrentes e geração de ocorrências.
          </p>
        </div>
        <CalendarPlus className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma despesa fixa cadastrada.
          </p>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className={cn(
                'flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between',
                expense.isActive ? 'border-border' : 'border-border/50 bg-muted/50',
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={cn(
                      'font-semibold',
                      expense.isActive ? 'text-foreground' : 'text-muted-foreground/50',
                    )}
                  >
                    {expense.description}
                  </p>
                  <StatusBadge tone={expense.isActive ? 'success' : 'muted'}>
                    {expense.isActive ? 'Ativa' : 'Inativa'}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {expense.category?.name ?? 'Sem categoria'} ·{' '}
                  {RECURRENCE_LABEL[expense.recurrence]} · dia {expense.dueDay}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
                <span
                  className={cn(
                    'font-semibold',
                    expense.isActive ? 'text-red-700' : 'text-muted-foreground/50',
                  )}
                >
                  {formatCurrency(expense.amount)}
                </span>
                <button
                  type="button"
                  title="Editar despesa fixa"
                  aria-label="Editar despesa fixa"
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  onClick={() => onEdit(expense)}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  title={expense.isActive ? 'Desativar despesa fixa' : 'Ativar despesa fixa'}
                  aria-label={expense.isActive ? 'Desativar despesa fixa' : 'Ativar despesa fixa'}
                  className={cn(
                    'rounded-md p-1.5 transition-colors',
                    expense.isActive
                      ? 'text-muted-foreground hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/40 dark:hover:text-amber-300'
                      : 'text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300',
                  )}
                  onClick={() => onToggle(expense)}
                >
                  {expense.isActive ? (
                    <Pause className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Play className="h-4 w-4" aria-hidden="true" />
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
