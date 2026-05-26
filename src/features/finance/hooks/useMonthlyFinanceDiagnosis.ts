import { useState } from 'react'

import { ApiError } from '@/services/http'

import { generateMonthlyDiagnosis } from '../services/finance-diagnosis.service'
import type { MonthlyFinanceDiagnosis } from '../types/finance.types'

export type DiagnosisState = {
  diagnosis: MonthlyFinanceDiagnosis | null
  isGenerating: boolean
  isPlanBlocked: boolean
  isQuotaExceeded: boolean
  error: string | null
}

const initialState: DiagnosisState = {
  diagnosis: null,
  isGenerating: false,
  isPlanBlocked: false,
  isQuotaExceeded: false,
  error: null,
}

export function useMonthlyFinanceDiagnosis() {
  const [state, setState] = useState<DiagnosisState>(initialState)

  function patch(update: Partial<DiagnosisState>) {
    setState((prev) => ({ ...prev, ...update }))
  }

  async function handleGenerate(month: string, forceRefresh = false) {
    patch({
      isGenerating: true,
      error: null,
      isPlanBlocked: false,
      isQuotaExceeded: false,
    })

    try {
      const diagnosis = await generateMonthlyDiagnosis(month, forceRefresh)
      patch({ diagnosis, isGenerating: false })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          patch({ isPlanBlocked: true, isGenerating: false })
          return
        }
        if (err.status === 429) {
          patch({ isQuotaExceeded: true, isGenerating: false })
          return
        }
      }
      patch({
        error:
          err instanceof Error
            ? err.message
            : 'Não foi possível gerar o diagnóstico financeiro. Tente novamente.',
        isGenerating: false,
      })
    }
  }

  function handleClear() {
    setState(initialState)
  }

  return { state, handleGenerate, handleClear }
}
