import { useEffect, useState } from 'react'

import { getProductivitySummary } from '../services/productivity.service'
import type { ProductivitySummary } from '../types/productivity.types'

export function useProductivitySummary() {
  const [data, setData] = useState<ProductivitySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    getProductivitySummary()
      .then(setData)
      .catch(() =>
        setError('Não foi possível carregar os dados de produtividade. Tente recarregar.'),
      )
      .finally(() => setIsLoading(false))
  }, [])

  return { data, isLoading, error }
}
