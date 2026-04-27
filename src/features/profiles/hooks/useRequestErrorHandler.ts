import { useCallback } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { ApiError } from '@/services/http'

export function useRequestErrorHandler(
  setError: (message: string | null) => void,
) {
  const { showAlert } = useGlobalAlerts()

  return useCallback(
    (requestError: unknown, fallback: string) => {
      const message =
        requestError instanceof Error ? requestError.message : null

      setError(message ?? fallback)
      showAlert({
        title: fallback,
        description: message ?? undefined,
        tone: 'error',
      })
    },
    [setError, showAlert],
  )
}

export type { ApiError }
