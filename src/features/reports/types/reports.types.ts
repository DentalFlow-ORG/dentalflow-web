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

export interface LeadsReportFilters {
  startDate?: string
  endDate?: string
  status?: string
  source?: string
}

export interface InvoicesReportFilters {
  startDate?: string
  endDate?: string
  status?: string
}
