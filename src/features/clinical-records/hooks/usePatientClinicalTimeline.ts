import { useCallback, useEffect, useReducer } from 'react'

import { getPatientClinicalTimeline } from '../services/clinical-records.service'
import type { ClinicalRecord } from '../types/clinical-record.types'

type State = { records: ClinicalRecord[]; isLoading: boolean; error: string | null }
type Action =
  | { type: 'loading' }
  | { type: 'success'; records: ClinicalRecord[] }
  | { type: 'idle' }
  | { type: 'error' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading': return { ...state, isLoading: true, error: null }
    case 'success': return { records: action.records, isLoading: false, error: null }
    case 'idle': return { records: [], isLoading: false, error: null }
    case 'error': return { ...state, isLoading: false, error: 'Não foi possível carregar o histórico clínico.' }
  }
}

export function usePatientClinicalTimeline(identifier: string | null) {
  const [state, dispatch] = useReducer(reducer, { records: [], isLoading: false, error: null })

  const load = useCallback(() => {
    if (!identifier) {
      dispatch({ type: 'idle' })
      return
    }
    dispatch({ type: 'loading' })
    let isCurrent = true

    getPatientClinicalTimeline(identifier)
      .then((data) => {
        if (isCurrent) dispatch({ type: 'success', records: data.records })
      })
      .catch(() => {
        if (isCurrent) dispatch({ type: 'error' })
      })

    return () => {
      isCurrent = false
    }
  }, [identifier])

  useEffect(load, [load])

  return { records: state.records, isLoading: state.isLoading, error: state.error }
}
