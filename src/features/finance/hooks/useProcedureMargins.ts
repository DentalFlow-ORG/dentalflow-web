import { useState } from 'react'

import { ApiError } from '@/services/http'

import {
  type ProcedureMarginsQuery,
  fetchProcedureMargins,
} from '../services/finance-analytics.service'
import type { ProcedureMarginsResponse } from '../types/finance.types'

export type ProcedureMarginsState = {
  data: ProcedureMarginsResponse | null
  isLoading: boolean
  isPlanBlocked: boolean
  error: string | null
}

export function useProcedureMargins() {
  const [state, setState] = useState<ProcedureMarginsState>({
    data: null,
    isLoading: false,
    isPlanBlocked: false,
    error: null,
  })

  async function load(query: ProcedureMarginsQuery = {}) {
    setState((prev) => ({ ...prev, isLoading: true, error: null, isPlanBlocked: false }))
    try {
      const data = await fetchProcedureMargins(query)
      setState((prev) => ({ ...prev, data, isLoading: false }))
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setState((prev) => ({ ...prev, isPlanBlocked: true, isLoading: false }))
        return
      }
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Erro ao carregar margens por procedimento.',
        isLoading: false,
      }))
    }
  }

  return { state, load }
}
