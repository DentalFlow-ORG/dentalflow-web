import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'
import { brazilTodayIso } from '@/lib/brazil-timezone'
import type {
  AppointmentsReportFilters,
  FinanceReportFilters,
  InventoryReportFilters,
  InvoicesReportFilters,
  LeadsReportFilters,
  ReportPreviewResponse,
} from '../types/reports.types'

function buildQuery(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      q.set(key, value)
    }
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

async function downloadCsv(path: string, filename: string): Promise<void> {
  const csvText = await apiRequest<string>(path, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
  const blob = new Blob([csvText], { type: 'text/csv; charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function fetchPreview(path: string): Promise<ReportPreviewResponse> {
  return apiRequest<ReportPreviewResponse>(path, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

function todayISO(): string {
  return brazilTodayIso()
}

// ── CSV exports ────────────────────────────────────────────────────────────

export function exportFinanceReport(filters: FinanceReportFilters): Promise<void> {
  const path = `/reports/finance/export${buildQuery({
    startDate: filters.startDate,
    endDate: filters.endDate,
    type: filters.type,
    status: filters.status,
    categoryId: filters.categoryId,
  })}`
  return downloadCsv(path, `relatorio_financeiro_${todayISO()}.csv`)
}

export function exportAppointmentsReport(filters: AppointmentsReportFilters): Promise<void> {
  const path = `/reports/appointments/export${buildQuery({
    startDate: filters.startDate,
    endDate: filters.endDate,
    status: filters.status,
    profileId: filters.profileId,
  })}`
  return downloadCsv(path, `relatorio_agendamentos_${todayISO()}.csv`)
}

export function exportInventoryReport(filters: InventoryReportFilters): Promise<void> {
  const path = `/reports/inventory/export${buildQuery({
    categoryId: filters.categoryId,
    status: filters.status,
  })}`
  return downloadCsv(path, `relatorio_estoque_${todayISO()}.csv`)
}

export function exportLeadsReport(filters: LeadsReportFilters): Promise<void> {
  const path = `/reports/leads/export${buildQuery({
    startDate: filters.startDate,
    endDate: filters.endDate,
    status: filters.status,
    source: filters.source,
  })}`
  return downloadCsv(path, `relatorio_leads_${todayISO()}.csv`)
}

export function exportInvoicesReport(filters: InvoicesReportFilters): Promise<void> {
  const path = `/reports/invoices/export${buildQuery({
    startDate: filters.startDate,
    endDate: filters.endDate,
    status: filters.status,
  })}`
  return downloadCsv(path, `relatorio_notas_fiscais_${todayISO()}.csv`)
}

// ── Preview ────────────────────────────────────────────────────────────────

export function getFinanceReportPreview(
  filters: FinanceReportFilters,
): Promise<ReportPreviewResponse> {
  const path = `/reports/finance/preview${buildQuery({
    startDate: filters.startDate,
    endDate: filters.endDate,
    type: filters.type,
    status: filters.status,
    categoryId: filters.categoryId,
  })}`
  return fetchPreview(path)
}

export function getAppointmentsReportPreview(
  filters: AppointmentsReportFilters,
): Promise<ReportPreviewResponse> {
  const path = `/reports/appointments/preview${buildQuery({
    startDate: filters.startDate,
    endDate: filters.endDate,
    status: filters.status,
    profileId: filters.profileId,
  })}`
  return fetchPreview(path)
}

export function getInventoryReportPreview(
  filters: InventoryReportFilters,
): Promise<ReportPreviewResponse> {
  const path = `/reports/inventory/preview${buildQuery({
    categoryId: filters.categoryId,
    status: filters.status,
  })}`
  return fetchPreview(path)
}

export function getInvoicesReportPreview(
  filters: InvoicesReportFilters,
): Promise<ReportPreviewResponse> {
  const path = `/reports/invoices/preview${buildQuery({
    startDate: filters.startDate,
    endDate: filters.endDate,
    status: filters.status,
  })}`
  return fetchPreview(path)
}
