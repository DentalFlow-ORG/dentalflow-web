import { useCallback, useEffect, useState } from 'react'

import { ApiError } from '@/services/http'

import { getAbnormalConsumption } from '../services/stock-abnormal-consumption.service'
import type { GetAbnormalConsumptionResponse } from '../types/inventory.types'

type UseStockAbnormalConsumptionResult = {
  data: GetAbnormalConsumptionResponse | null
  isLoading: boolean
  error: string | null
  isPlanBlocked: boolean
  refetch: () => void
}

export function useStockAbnormalConsumption(): UseStockAbnormalConsumptionResult {
  const [data, setData] = useState<GetAbnormalConsumptionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlanBlocked, setIsPlanBlocked] = useState(false)

  const load = useCallback(() => {
    setIsLoading(true)
    setError(null)

    getAbnormalConsumption()
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 402 || err.status === 403)) {
          setIsPlanBlocked(true)
          return
        }
        setError(
          err instanceof ApiError
            ? err.message
            : 'Não foi possível carregar a análise de consumo. Tente novamente.',
        )
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { data, isLoading, error, isPlanBlocked, refetch: load }
}
