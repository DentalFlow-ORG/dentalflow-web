import type {
  FinanceSummary,
  FinancialCategory,
  FinancialTransaction,
  FixedExpense,
} from '@/features/finance/types/finance.types'

export function makeSummary(overrides: Partial<FinanceSummary> = {}): FinanceSummary {
  return {
    period: { from: '2026-06-01', to: '2026-06-30', groupBy: 'day' },
    kpis: {
      totalIncome: 1000,
      totalExpenses: 500,
      netProfit: 500,
      profitMargin: 50,
      pendingReceivables: 100,
      fixedExpensesTotal: 200,
    },
    incomeVsExpenses: [],
    expensesByCategory: [],
    incomeByService: [],
    ...overrides,
  }
}

export function makeCategory(overrides: Partial<FinancialCategory> = {}): FinancialCategory {
  return {
    id: 'cat-1',
    clinicId: 'clinic-1',
    name: 'Consultas',
    type: 'INCOME',
    color: '#10B981',
    icon: null,
    isDefault: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeTransaction(
  overrides: Partial<FinancialTransaction> = {},
): FinancialTransaction {
  return {
    id: 'txn-1',
    clinicId: 'clinic-1',
    type: 'INCOME',
    source: 'MANUAL',
    categoryId: 'cat-1',
    amount: 500,
    description: 'Consulta João',
    transactionDate: '2026-06-10',
    dueDate: null,
    paidAt: null,
    status: 'PAID',
    appointmentId: null,
    serviceId: null,
    profileId: null,
    paymentReference: null,
    fixedExpenseId: null,
    createdByUserId: 'user-1',
    createdAt: '2026-06-10T00:00:00.000Z',
    updatedAt: '2026-06-10T00:00:00.000Z',
    category: null,
    service: null,
    profile: null,
    ...overrides,
  }
}

export function makeFixedExpense(overrides: Partial<FixedExpense> = {}): FixedExpense {
  return {
    id: 'exp-1',
    clinicId: 'clinic-1',
    categoryId: 'cat-2',
    description: 'Aluguel',
    amount: 3000,
    recurrence: 'MONTHLY',
    dueDay: 5,
    startDate: '2026-01-01',
    endDate: null,
    isActive: true,
    createdByUserId: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    category: null,
    ...overrides,
  }
}
