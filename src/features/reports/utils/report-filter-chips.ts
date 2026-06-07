import type {
  AppointmentsReportFilters,
  FinanceReportFilters,
  InventoryReportFilters,
  InvoicesReportFilters,
  LeadsReportFilters,
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

const FINANCE_TYPE_LABELS: Record<string, string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
}

const FINANCE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  CANCELED: 'Cancelado',
}

const APPT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
}

const INV_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Normal',
  LOW: 'Estoque baixo',
  EMPTY: 'Zerado',
  EXPIRING: 'Vencimento próximo',
  EXPIRED: 'Vencido',
  INACTIVE: 'Inativo',
}

const LEADS_STATUS_LABELS: Record<string, string> = {
  NEW: 'Novo',
  CONTACTED: 'Em contato',
  SCHEDULED: 'Agendado',
  CONVERTED: 'Convertido',
  LOST: 'Perdido',
  ARCHIVED: 'Arquivado',
}

const LEADS_SOURCE_LABELS: Record<string, string> = {
  MANUAL: 'Manual',
  WEBSITE: 'Site',
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
  GOOGLE: 'Google',
  REFERRAL: 'Indicação',
  IMPORT: 'Importação',
  OTHER: 'Outro',
}

const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  READY_TO_ISSUE: 'Pronto para emitir',
  SIMULATED: 'Simulado',
  ISSUED: 'Emitido',
  FAILED: 'Falhou',
  CANCELED: 'Cancelado',
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
    chips.push({ key: 'type', label: `Tipo: ${FINANCE_TYPE_LABELS[filters.type] ?? filters.type}` })
  }
  if (filters.status) {
    chips.push({
      key: 'status',
      label: `Status: ${FINANCE_STATUS_LABELS[filters.status] ?? filters.status}`,
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
      label: `Status: ${APPT_STATUS_LABELS[filters.status] ?? filters.status}`,
    })
  }
  return chips
}

export function getInventoryFilterChips(filters: InventoryReportFilters): FilterChip[] {
  const chips: FilterChip[] = []
  if (filters.status) {
    chips.push({
      key: 'status',
      label: `Status: ${INV_STATUS_LABELS[filters.status] ?? filters.status}`,
    })
  }
  return chips
}

export function getLeadsFilterChips(
  filters: LeadsReportFilters,
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
      label: `Status: ${LEADS_STATUS_LABELS[filters.status] ?? filters.status}`,
    })
  }
  if (filters.source) {
    chips.push({
      key: 'source',
      label: `Origem: ${LEADS_SOURCE_LABELS[filters.source] ?? filters.source}`,
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
      label: `Status: ${INVOICE_STATUS_LABELS[filters.status] ?? filters.status}`,
    })
  }
  return chips
}
