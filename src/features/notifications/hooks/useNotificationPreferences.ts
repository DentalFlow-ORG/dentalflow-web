import { useCallback, useEffect, useState } from 'react'
import type { NotificationPreference } from '../types/notifications.types'
import { getPreferences, updatePreferences } from '../services/notifications.service'

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setIsLoading(true)
    setError(null)
    getPreferences()
      .then(setPreferences)
      .catch(() => setError('Não foi possível carregar as preferências.'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (data: Partial<NotificationPreference>) => {
    setIsSaving(true)
    try {
      const updated = await updatePreferences(data)
      setPreferences(updated)
      return updated
    } finally {
      setIsSaving(false)
    }
  }, [])

  return { preferences, isLoading, isSaving, error, save, reload: load }
}
