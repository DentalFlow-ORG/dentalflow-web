import { useEffect, useState } from 'react'

import { getLeadSummary } from '@/features/leads/services/leads.service'
import type { LeadSummary } from '@/features/leads/types/leads.types'

/**
 * Fetches the lead summary counts (new, contacted, scheduled, etc.).
 *
 * Failure is intentionally silent — the leads widget is non-critical to the
 * OWNER dashboard. If the request fails, `data` stays null and the KPI card
 * shows a fallback value instead of crashing the page.
 */
export function useLeadSummary() {
  const [data, setData] = useState<LeadSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getLeadSummary()
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return { data, isLoading }
}
