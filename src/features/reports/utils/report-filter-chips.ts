import {
  STATUS_LABEL as FINANCE_STATUS_LABEL,
  TYPE_LABEL as FINANCE_TYPE_LABEL,
} from '@/features/finance/constants/finance-display'
import { INVOICE_STATUS_LABEL } from '@/features/fiscal/constants/invoice-status'
import { STATUS_OPTIONS } from '@/features/inventory/constants/inventory-filters'
import { STATUS_LABELS as APPOINTMENT_STATUS_LABELS } from '@/features/scheduling/constants/appointment-display'

import type {
  AppointmentsReportFilters,
  FinanceReportFilters,
  InventoryReportFilters,
  InvoicesReportFilters,
} from '../types/reports.types'

export interface FilterChip {
  key: string
  label: string
}

export interface DefaultDateRange {
  startDate?: string
  endDate?: string
}

function formatChipDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// Labels come from each domain's canonical map so Reports never drifts from the
// screens where the same statuses are shown and filtered.
function labelFor(labels: Record<string, string>, value: string) {
  return labels[value] ?? value
}

function inventoryStatusLabel(value: string) {
  return STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value
}

export function getFinanceFilterChips(
  filters: FinanceReportFilters,
  defaults: DefaultDateRange,
): FilterChip[] {
  const chips: FilterChip[] = []
  if (filters.startDate && filters.startDate !== defaults.startDate) {
    chips.push({ key: 'startDate', label: `Início: ${formatChipDate(filters.startDate)}` })
  }
  if (filters.endDate && filters.endDate !== defaults.endDate) {
    chips.push({ key: 'endDate', label: `Fim: ${formatChipDate(filters.endDate)}` })
  }
  if (filters.type) {
    chips.push({ key: 'type', label: `Tipo: ${labelFor(FINANCE_TYPE_LABEL, filters.type)}` })
  }
  if (filters.status) {
    chips.push({
      key: 'status',
      label: `Status: ${labelFor(FINANCE_STATUS_LABEL, filters.status)}`,
    })
  }
  return chips
}

export function getAppointmentsFilterChips(
  filters: AppointmentsReportFilters,
  defaults: DefaultDateRange,
): FilterChip[] {
  const chips: FilterChip[] = []
  if (filters.startDate && filters.startDate !== defaults.startDate) {
    chips.push({ key: 'startDate', label: `Início: ${formatChipDate(filters.startDate)}` })
  }
  if (filters.endDate && filters.endDate !== defaults.endDate) {
    chips.push({ key: 'endDate', label: `Fim: ${formatChipDate(filters.endDate)}` })
  }
  if (filters.status) {
    chips.push({
      key: 'status',
      label: `Status: ${labelFor(APPOINTMENT_STATUS_LABELS, filters.status)}`,
    })
  }
  return chips
}

export function getInventoryFilterChips(filters: InventoryReportFilters): FilterChip[] {
  const chips: FilterChip[] = []
  if (filters.status) {
    chips.push({
      key: 'status',
      label: `Status: ${inventoryStatusLabel(filters.status)}`,
    })
  }
  return chips
}

export function getInvoicesFilterChips(
  filters: InvoicesReportFilters,
  defaults: DefaultDateRange,
): FilterChip[] {
  const chips: FilterChip[] = []
  if (filters.startDate && filters.startDate !== defaults.startDate) {
    chips.push({
      key: 'startDate',
      label: `Competência inicial: ${formatChipDate(filters.startDate)}`,
    })
  }
  if (filters.endDate && filters.endDate !== defaults.endDate) {
    chips.push({
      key: 'endDate',
      label: `Competência final: ${formatChipDate(filters.endDate)}`,
    })
  }
  if (filters.status) {
    chips.push({
      key: 'status',
      label: `Status: ${labelFor(INVOICE_STATUS_LABEL, filters.status)}`,
    })
  }
  return chips
}
