import { useCallback, useEffect, useState } from 'react'
import type { NotificationTemplate } from '../types/notifications.types'
import { listTemplates } from '../services/notifications.service'

export function useNotificationTemplates() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(() => {
    setIsLoading(true)
    listTemplates()
      .then(setTemplates)
      .catch(() => {/* silent — templates are non-critical */})
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return { templates, isLoading }
}
