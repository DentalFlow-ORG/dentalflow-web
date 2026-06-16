export interface FinanceReportFilters {
  startDate?: string
  endDate?: string
  type?: 'INCOME' | 'EXPENSE' | ''
  status?: 'PENDING' | 'PAID' | 'CANCELED' | ''
  categoryId?: string
}

export interface AppointmentsReportFilters {
  startDate?: string
  endDate?: string
  status?: string
  profileId?: string
}

export interface InventoryReportFilters {
  categoryId?: string
  status?: string
}

export interface InvoicesReportFilters {
  startDate?: string
  endDate?: string
  status?: string
}

// ── Preview types ──────────────────────────────────────────────────────────

interface ReportPreviewFilter {
  label: string
  value: string
}

interface ReportPreviewPeriod {
  startDate: string | null
  endDate: string | null
  label: string
}

type ReportPreviewReportType = 'finance' | 'appointments' | 'inventory' | 'invoices'

export interface ReportPreviewResponse {
  reportType: ReportPreviewReportType
  reportTitle: string
  clinic: { name: string; document: null }
  generatedAt: string
  filters: ReportPreviewFilter[]
  period: ReportPreviewPeriod | null
  recordCount: number
  maxRecords: number
  isTruncated: boolean
  exportFormat: 'CSV'
  empty: boolean
  previewNote: string | null
}
