import { useEffect, useState } from 'react'

import { getCachedBillingStatus } from '@/features/billing/services/billing-status-cache'
import { getCurrentBillingStatus } from '@/features/billing/services/billing.service'

export function useClinicalDictationAccess() {
  const [request, setRequest] = useState(() => ({ status: getCachedBillingStatus() }))
  const { status } = request
  const [error, setError] = useState(false)

  useEffect(() => {
    if (request.status) return
    let active = true
    getCurrentBillingStatus().then(
      (value) => {
        if (active) setRequest({ status: value })
      },
      () => {
        if (active) setError(true)
      },
    )
    return () => {
      active = false
    }
  }, [request])

  return {
    allowed: status?.planKey === 'premium' && status.accessAllowed,
    isLoading: !status && !error,
    error,
    retry: () => {
      setError(false)
      setRequest({ status: null })
    },
  }
}
