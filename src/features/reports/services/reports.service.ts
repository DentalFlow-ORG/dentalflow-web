import { env } from '@/config/env'
import { getAccessToken } from '@/features/auth/utils/session-storage'
import { ApiError } from '@/services/http'
import type {
  AppointmentsReportFilters,
  FinanceReportFilters,
  InventoryReportFilters,
  InvoicesReportFilters,
  LeadsReportFilters,
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
  if (!env.apiUrl) throw new Error('VITE_API_URL não está configurada.')

  const token = getAccessToken()
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    let message = `Erro ${response.status} ao gerar relatório.`
    try {
      const body = (await response.json()) as { message?: string | string[] }
      const raw = body?.message
      message = Array.isArray(raw) ? raw.join('; ') : (raw ?? message)
    } catch {
      // ignore parse error
    }
    throw new ApiError(message, response.status, null)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

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
