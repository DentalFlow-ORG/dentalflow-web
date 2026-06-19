import { X } from 'lucide-react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextInput } from '@/components/common/FormField'
import { PanelCard } from '@/components/common/PanelCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { INVOICE_STATUS_LABEL } from '../constants/invoice-status'
import type { ServiceInvoiceStatus } from '../types/fiscal.types'
import { formatInvoiceDate } from '../utils/invoice-format'

type Props = {
  customer: string
  status: ServiceInvoiceStatus | undefined
  to: string
  onCustomerChange: (value: string) => void
  onStatusChange: (value: ServiceInvoiceStatus | undefined) => void
  onToChange: (value: string) => void
  onClear: () => void
}

export function FiscalInvoiceFiltersBar({
  customer,
  status,
  to,
  onCustomerChange,
  onStatusChange,
  onToChange,
  onClear,
}: Props) {
  const hasActiveFilters = !!(customer || status || to)

  return (
    <PanelCard className="p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">Filtros</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Refine os resultados por cliente, status ou competência.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <FormField label="Cliente" htmlFor="invoiceCustomer">
          <TextInput
            id="invoiceCustomer"
            placeholder="Buscar por cliente..."
            value={customer}
            onChange={(e) => onCustomerChange(e.target.value)}
          />
        </FormField>
        <FormField label="Status" htmlFor="invoiceStatus">
          <Select
            value={status ?? '__all__'}
            onValueChange={(value) =>
              onStatusChange(
                (value === '__all__' ? undefined : value) as ServiceInvoiceStatus | undefined,
              )
            }
          >
            <SelectTrigger id="invoiceStatus">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {Object.entries(INVOICE_STATUS_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Competência até" htmlFor="invoiceTo">
          <DatePickerInput id="invoiceTo" value={to} onValueChange={onToChange} />
        </FormField>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 rounded-lg border border-border bg-muted/30 px-3 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {customer && (
              <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                Cliente: {customer}
              </span>
            )}
            {status && (
              <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                Status: {INVOICE_STATUS_LABEL[status]}
              </span>
            )}
            {to && (
              <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                Competência até: {formatInvoiceDate(to)}
              </span>
            )}
            <button
              type="button"
              onClick={onClear}
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
