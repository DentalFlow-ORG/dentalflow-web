import { X } from 'lucide-react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField } from '@/components/common/FormField'
import { PanelCard } from '@/components/common/PanelCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { STATUS_LABEL, TYPE_LABEL } from '../constants/finance-display'
import type {
  FinanceFilters,
  FinancialCategory,
  FinancialTransactionStatus,
  FinancialTransactionType,
} from '../types/finance.types'

export function FinanceFiltersBar({
  filters,
  categories,
  onChange,
}: {
  filters: FinanceFilters
  categories: FinancialCategory[]
  onChange: <K extends keyof FinanceFilters>(field: K, value: FinanceFilters[K]) => void
}) {
  const hasActiveFilters =
    filters.type !== undefined || filters.status !== undefined || filters.categoryId !== undefined
  const isDrillDown = filters.type === 'INCOME' && filters.status === 'PENDING'
  const categoryName = filters.categoryId
    ? categories.find((c) => c.id === filters.categoryId)?.name
    : undefined

  function clearActiveFilters() {
    onChange('type', undefined)
    onChange('status', undefined)
    onChange('categoryId', undefined)
  }

  return (
    <PanelCard className="p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <FormField label="Início" htmlFor="financeFrom">
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
          <Select
            value={filters.groupBy}
            onValueChange={(value) => onChange('groupBy', value as never)}
          >
            <SelectTrigger id="financeGroupBy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dia</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
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
              <SelectItem value="EXPENSE">Saídas</SelectItem>
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
            onValueChange={(value) => onChange('categoryId', value === 'all' ? undefined : value)}
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

      {hasActiveFilters && (
        <div className="mt-3 rounded-lg border border-border bg-muted/30 px-3 py-3">
          {isDrillDown && (
            <div className="mb-2.5 rounded-md border border-amber-200 bg-amber-50/60 px-2.5 py-2 dark:border-amber-800/40 dark:bg-amber-950/20">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Visualizando recebíveis pendentes
              </p>
              <p className="mt-0.5 text-xs text-amber-700/80 dark:text-amber-400/80">
                Entradas pendentes no período selecionado.
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {filters.type && (
              <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                Tipo: {TYPE_LABEL[filters.type]}
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                Status: {STATUS_LABEL[filters.status]}
              </span>
            )}
            {filters.categoryId && categoryName && (
              <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                Categoria: {categoryName}
              </span>
            )}
            <button
              type="button"
              onClick={clearActiveFilters}
              className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              Limpar filtros
            </button>
          </div>
        </div>
      )}
    </PanelCard>
  )
}
