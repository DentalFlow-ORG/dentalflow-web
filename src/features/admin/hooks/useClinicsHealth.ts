import { useCallback, useEffect, useState } from 'react'

import { getClinicsHealth } from '../services/admin-clinics.service'
import type { ClinicHealthRow } from '../types/admin.types'

export function useClinicsHealth() {
  const [rows, setRows] = useState<ClinicHealthRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(() => {
    setIsLoading(true)
    setLoadError(null)
    getClinicsHealth()
      .then(setRows)
      .catch((err) => {
        const msg =
          err instanceof Error ? err.message : 'Não foi possível carregar a saúde das clínicas.'
        setLoadError(msg)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { rows, isLoading, loadError, load }
}
