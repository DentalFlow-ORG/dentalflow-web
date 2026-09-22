import { useEffect, useState } from 'react'

import { getPatientClinicalTimeline } from '../services/clinical-records.service'
import type { ClinicalRecord } from '../types/clinical-record.types'

type State = { key: string; records: ClinicalRecord[]; error: string | null }

export function usePatientClinicalTimeline(identifier: string | null, patientId?: string | null) {
  const key = identifier ? (patientId ?? identifier) : null
  const [state, setState] = useState<State | null>(null)
  useEffect(() => {
    if (!identifier || !key) return
    let current = true
    getPatientClinicalTimeline(identifier, patientId)
      .then((data) => {
        if (current) setState({ key, records: data.records, error: null })
      })
      .catch(() => {
        if (current)
          setState({ key, records: [], error: 'Não foi possível carregar o histórico clínico.' })
      })
    return () => {
      current = false
    }
  }, [identifier, patientId, key])
  const active = key !== null && state?.key === key
  return {
    records: active ? state.records : [],
    isLoading: key !== null && !active,
    error: active ? state.error : null,
  }
}
