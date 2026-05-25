import { useCallback, useEffect, useState } from 'react'

import { ApiError } from '@/services/http'

import { getStockPurchaseList } from '../services/inventory.service'
import type { StockPurchaseList } from '../types/inventory.types'

type UseStockPurchaseListResult = {
  data: StockPurchaseList | null
  isLoading: boolean
  error: string | null
  isPlanBlocked: boolean
  refetch: () => void
}

export function useStockPurchaseList(): UseStockPurchaseListResult {
  const [data, setData] = useState<StockPurchaseList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlanBlocked, setIsPlanBlocked] = useState(false)

  const load = useCallback(() => {
    setIsLoading(true)
    setError(null)

    getStockPurchaseList()
      .then((result) => {
        setData(result)
      })
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 402 || err.status === 403)) {
          setIsPlanBlocked(true)
          return
        }
        setError(
          err instanceof ApiError
            ? err.message
            : 'Não foi possível carregar a lista de compras. Tente novamente.',
        )
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { data, isLoading, error, isPlanBlocked, refetch: load }
}
