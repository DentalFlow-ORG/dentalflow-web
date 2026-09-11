import { useCallback, useEffect, useRef, useState } from 'react'
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
  const phoneRef = useRef(phone)
  phoneRef.current = phone
  const mountedRef = useRef(false)
  const loadGeneration = useRef(0)
  const mutationGeneration = useRef(0)

  const load = useCallback(() => {
    if (!phone || phoneRef.current !== phone || !mountedRef.current) return
    const generation = ++loadGeneration.current
    setIsLoading(true)
    return listConsents({ phone })
      .then((list) => {
        if (mountedRef.current && generation === loadGeneration.current) setConsent(list[0] ?? null)
      })
      .catch(() => {
        /* silent */
      })
      .finally(() => {
        if (mountedRef.current && generation === loadGeneration.current) setIsLoading(false)
      })
  }, [phone])

  useEffect(() => {
    mountedRef.current = true
    setConsent(null)
    setIsLoading(false)
    setIsSaving(false)
    load()
    return () => {
      mountedRef.current = false
      loadGeneration.current++
      mutationGeneration.current++
    }
  }, [load])

  const grant = useCallback(
    async (normalizedPhone: string) => {
      const generation = ++mutationGeneration.current
      setIsSaving(true)
      try {
        await createOrUpdateConsent({
          phone: normalizedPhone,
          channel: 'WHATSAPP',
          scope: 'UTILITY',
          granted: true,
          source: 'MANUAL',
        })
        if (mountedRef.current && generation === mutationGeneration.current) await load()
      } finally {
        if (mountedRef.current && generation === mutationGeneration.current) setIsSaving(false)
      }
    },
    [load],
  )

  const revoke = useCallback(async () => {
    if (!consent) return
    const generation = ++mutationGeneration.current
    setIsSaving(true)
    try {
      await revokeConsent(consent.id)
      if (mountedRef.current && generation === mutationGeneration.current) {
        setConsent((c) =>
          c?.id === consent.id ? { ...c, granted: false, revokedAt: new Date().toISOString() } : c,
        )
      }
    } finally {
      if (mountedRef.current && generation === mutationGeneration.current) setIsSaving(false)
    }
  }, [consent])

  return { consent, isLoading, isSaving, grant, revoke, reload: load }
}
