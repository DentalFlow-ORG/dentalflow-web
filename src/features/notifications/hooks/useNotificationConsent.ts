import { useCallback, useEffect, useState } from 'react'
import {
  createOrUpdateConsent,
  listConsents,
  revokeConsent,
} from '../services/notifications.service'
import type { NotificationConsent } from '../types/notifications.types'

export function useNotificationConsent(phone?: string) {
  const [consent, setConsent] = useState<NotificationConsent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const load = useCallback(() => {
    if (!phone) return
    setIsLoading(true)
    listConsents({ phone })
      .then((list) => setConsent(list[0] ?? null))
      .catch(() => {
        /* silent */
      })
      .finally(() => setIsLoading(false))
  }, [phone])

  useEffect(() => {
    load()
  }, [load])

  const grant = useCallback(
    async (normalizedPhone: string) => {
      setIsSaving(true)
      try {
        await createOrUpdateConsent({
          phone: normalizedPhone,
          channel: 'WHATSAPP',
          scope: 'UTILITY',
          granted: true,
          source: 'MANUAL',
        })
        await load()
      } finally {
        setIsSaving(false)
      }
    },
    [load],
  )

  const revoke = useCallback(async () => {
    if (!consent) return
    setIsSaving(true)
    try {
      await revokeConsent(consent.id)
      setConsent((c) => (c ? { ...c, granted: false, revokedAt: new Date().toISOString() } : null))
    } finally {
      setIsSaving(false)
    }
  }, [consent])

  return { consent, isLoading, isSaving, grant, revoke, reload: load }
}
