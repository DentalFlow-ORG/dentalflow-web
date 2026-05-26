import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type { ExpenseClassificationResult, FinancialTransaction } from '../types/finance.types'

export function classifyExpense(
  transactionId: string,
  forceAi = false,
): Promise<ExpenseClassificationResult> {
  return apiRequest<ExpenseClassificationResult>(
    `/finance/transactions/${transactionId}/classify-expense`,
    {
      method: 'POST',
      accessToken: getAccessToken(),
      body: JSON.stringify({ forceAi }),
    },
  )
}

export function applySuggestedCategory(
  transactionId: string,
  categoryId: string,
): Promise<FinancialTransaction> {
  return apiRequest<FinancialTransaction>(
    `/finance/transactions/${transactionId}/apply-suggested-category`,
    {
      method: 'PATCH',
      accessToken: getAccessToken(),
      body: JSON.stringify({ categoryId }),
    },
  )
}
