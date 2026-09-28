import { useEffect, useState } from 'react'

import { listPatients } from '@/features/patients/services/patients.service'
import type { PatientSummary } from '@/features/patients/types/patients.types'

const SEARCH_DEBOUNCE_MS = 300

export type PatientSearchStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Debounced search over existing Patients. Only the latest query's response is
 * applied, so a slow earlier request can never replace newer results. Rows
 * without a stable patientId are dropped: an appointment can only be linked
 * to an explicit Patient identity.
 */
export function usePatientSearch(query: string, enabled: boolean) {
  const [results, setResults] = useState<PatientSummary[]>([])
  const [status, setStatus] = useState<PatientSearchStatus>('idle')
  const trimmed = query.trim()

  useEffect(() => {
    if (!enabled || !trimmed) {
      setResults([])
      setStatus('idle')
      return
    }

    let isCurrent = true
    setStatus('loading')
    const timer = setTimeout(() => {
      listPatients(trimmed)
        .then((response) => {
          if (!isCurrent) return
          setResults(response.data.filter((patient) => patient.patientId))
          setStatus('success')
        })
        .catch(() => {
          if (!isCurrent) return
          setResults([])
          setStatus('error')
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      isCurrent = false
      clearTimeout(timer)
    }
  }, [enabled, trimmed])

  return { results, status }
}
