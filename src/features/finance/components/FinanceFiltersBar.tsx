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
          <Select value={filters.groupBy} onValueChange={(value) => onChange('groupBy', value as never)}>
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
