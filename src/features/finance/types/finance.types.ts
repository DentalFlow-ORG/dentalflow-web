export type FinancialTransactionType = 'INCOME' | 'EXPENSE'
export type FinancialTransactionSource =
  | 'MANUAL'
  | 'SERVICE_PAYMENT'
  | 'FIXED_EXPENSE'
  | 'ADJUSTMENT'
export type FinancialTransactionStatus = 'PENDING' | 'PAID' | 'CANCELED'
export type FixedExpenseRecurrence = 'MONTHLY' | 'WEEKLY' | 'YEARLY'
export type FinanceGroupBy = 'day' | 'week' | 'month'

export type FinancialCategory = {
  id: string
  clinicId: string
  name: string
  type: FinancialTransactionType
  color?: string | null
  icon?: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type FinancialTransaction = {
  id: string
  clinicId: string
  type: FinancialTransactionType
  source: FinancialTransactionSource
  categoryId: string
  fixedExpenseId?: string | null
  amount: string | number
  description: string
  transactionDate: string
  dueDate?: string | null
  paidAt?: string | null
  status: FinancialTransactionStatus
  appointmentId?: string | null
  serviceId?: string | null
  profileId?: string | null
  paymentReference?: string | null
  createdByUserId: string
  createdAt: string
  updatedAt: string
  category?: FinancialCategory | null
  service?: { id: string; name: string } | null
  profile?: { id: string; displayName: string } | null
}

export type FixedExpense = {
  id: string
  clinicId: string
  categoryId: string
  description: string
  amount: string | number
  recurrence: FixedExpenseRecurrence
  dueDay: number
  startDate: string
  endDate?: string | null
  isActive: boolean
  createdByUserId: string
  createdAt: string
  updatedAt: string
  category?: FinancialCategory | null
}

export type FinanceSummary = {
  period: {
    from: string
    to: string
    groupBy: FinanceGroupBy
  }
  kpis: {
    totalIncome: number
    totalExpenses: number
    netProfit: number
    profitMargin: number
    pendingReceivables: number
    fixedExpensesTotal: number
  }
  incomeVsExpenses: Array<{
    date: string
    income: number
    expenses: number
    netProfit: number
  }>
  expensesByCategory: Array<{
    categoryId: string | null
    categoryName: string
    color?: string | null
    amount: number
  }>
  incomeByService: Array<{
    serviceId: string | null
    serviceName: string
    amount: number
  }>
}

export type FinancialTransactionsResponse = {
  data: FinancialTransaction[]
  total: number
  page: number
  limit: number
}

export type FinanceFilters = {
  from: string
  to: string
  groupBy: FinanceGroupBy
  type?: FinancialTransactionType
  status?: FinancialTransactionStatus
  categoryId?: string
}

export type CreateFinancialTransactionDto = {
  type: FinancialTransactionType
  categoryId: string
  amount: number
  description: string
  transactionDate: string
  dueDate?: string
  paidAt?: string
  status?: FinancialTransactionStatus
}

export type CreateFixedExpenseDto = {
  categoryId: string
  description: string
  amount: number
  recurrence: FixedExpenseRecurrence
  dueDay: number
  startDate: string
  endDate?: string
  isActive?: boolean
}

export type CreateFinancialCategoryDto = {
  name: string
  type: FinancialTransactionType
  color?: string
  icon?: string
}

export type UpdateFinancialCategoryDto = {
  name?: string
  type?: FinancialTransactionType
  color?: string
  icon?: string
}

export type UpdateFixedExpenseDto = {
  categoryId?: string
  description?: string
  amount?: number
  recurrence?: FixedExpenseRecurrence
  dueDay?: number
  startDate?: string
  endDate?: string | null
  isActive?: boolean
}

export type UpdateFinancialTransactionDto = {
  type?: FinancialTransactionType
  categoryId?: string
  amount?: number
  description?: string
  transactionDate?: string
  dueDate?: string | null
  status?: FinancialTransactionStatus
  paidAt?: string | null
}

export type TransactionFormState = {
  type: FinancialTransactionType
  categoryId: string
  amount: string
  description: string
  transactionDate: string
  dueDate: string
  status: FinancialTransactionStatus
}

export type FixedExpenseFormState = {
  categoryId: string
  description: string
  amount: string
  recurrence: FixedExpenseRecurrence
  dueDay: string
  startDate: string
}

export type FixedExpenseEditFormState = FixedExpenseFormState & { endDate: string }

export type CategoryFormState = {
  name: string
  type: FinancialTransactionType
  color: string
}
