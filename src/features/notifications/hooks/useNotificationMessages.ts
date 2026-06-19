import { useCallback, useEffect, useState } from 'react'
import { listMessages } from '../services/notifications.service'
import type { NotificationMessage } from '../types/notifications.types'

export function useNotificationMessages(appointmentId?: string) {
  const [messages, setMessages] = useState<NotificationMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const load = useCallback(() => {
    setIsLoading(true)
    listMessages({ appointmentId, limit: 50 })
      .then((res) => {
        setMessages(res.data)
        setTotal(res.total)
      })
      .catch(() => {
        /* silent */
      })
      .finally(() => setIsLoading(false))
  }, [appointmentId])

  useEffect(() => {
    if (appointmentId) load()
  }, [appointmentId, load])

  return { messages, isLoading, total, reload: load }
}
