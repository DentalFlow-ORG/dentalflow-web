import { useState } from 'react'

import { ApiError } from '@/services/http'

import {
  applySuggestedCategory,
  classifyExpense,
} from '../services/finance-classify.service'
import type { ExpenseClassificationResult } from '../types/finance.types'

export type ClassifierState = {
  result: ExpenseClassificationResult | null
  isClassifying: boolean
  isApplying: boolean
  isPlanBlocked: boolean
  isQuotaExceeded: boolean
  error: string | null
}

const initial: ClassifierState = {
  result: null,
  isClassifying: false,
  isApplying: false,
  isPlanBlocked: false,
  isQuotaExceeded: false,
  error: null,
}

export function useExpenseClassifier(onApplied: () => void) {
  const [states, setStates] = useState<Record<string, ClassifierState>>({})

  function getState(transactionId: string): ClassifierState {
    return states[transactionId] ?? initial
  }

  function patch(transactionId: string, update: Partial<ClassifierState>) {
    setStates((prev) => ({
      ...prev,
      [transactionId]: { ...(prev[transactionId] ?? initial), ...update },
    }))
  }

  async function handleClassify(transactionId: string, forceAi = false) {
    patch(transactionId, {
      isClassifying: true,
      error: null,
      isPlanBlocked: false,
      isQuotaExceeded: false,
      result: null,
    })

    try {
      const result = await classifyExpense(transactionId, forceAi)
      patch(transactionId, { result, isClassifying: false })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          patch(transactionId, { isPlanBlocked: true, isClassifying: false })
          return
        }
        if (err.status === 429) {
          patch(transactionId, { isQuotaExceeded: true, isClassifying: false })
          return
        }
      }
      patch(transactionId, {
        error: err instanceof Error ? err.message : 'Não foi possível classificar o gasto.',
        isClassifying: false,
      })
    }
  }

  async function handleApply(transactionId: string, categoryId: string) {
    patch(transactionId, { isApplying: true, error: null })
    try {
      await applySuggestedCategory(transactionId, categoryId)
      patch(transactionId, { isApplying: false, result: null })
      onApplied()
    } catch (err) {
      patch(transactionId, {
        error: err instanceof Error ? err.message : 'Não foi possível aplicar a categoria.',
        isApplying: false,
      })
    }
  }

  function handleDismiss(transactionId: string) {
    patch(transactionId, { result: null, error: null })
  }

  return { getState, handleClassify, handleApply, handleDismiss }
}
