import { useCallback, useEffect, useState } from 'react'
import { getQuota } from '../services/notifications.service'
import type { NotificationQuota } from '../types/notifications.types'

export function useNotificationQuota() {
  const [quota, setQuota] = useState<NotificationQuota | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setIsLoading(true)
    setError(null)
    getQuota()
      .then(setQuota)
      .catch(() => setError('Não foi possível carregar o uso mensal.'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { quota, isLoading, error, reload: load }
}
