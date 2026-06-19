import { useCallback, useEffect, useReducer } from 'react'

import { listClinicalRecords } from '../services/clinical-records.service'
import type { ClinicalRecord } from '../types/clinical-record.types'

type Filters = {
  status?: string
  dentistProfileId?: string
}

type State = { records: ClinicalRecord[]; isLoading: boolean; error: string | null }
type Action =
  | { type: 'loading' }
  | { type: 'success'; records: ClinicalRecord[] }
  | { type: 'error' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'success':
      return { records: action.records, isLoading: false, error: null }
    case 'error':
      return { ...state, isLoading: false, error: 'Não foi possível carregar os prontuários.' }
  }
}

export function useClinicalRecords(filters: Filters = {}) {
  const [state, dispatch] = useReducer(reducer, { records: [], isLoading: true, error: null })

  // Destructure primitives so useCallback deps are stable across renders
  const { status, dentistProfileId } = filters

  const load = useCallback(() => {
    dispatch({ type: 'loading' })
    let isCurrent = true

    listClinicalRecords({ status, dentistProfileId })
      .then((data) => {
        if (isCurrent) dispatch({ type: 'success', records: data })
      })
      .catch(() => {
        if (isCurrent) dispatch({ type: 'error' })
      })

    return () => {
      isCurrent = false
    }
  }, [status, dentistProfileId])

  useEffect(() => load(), [load])

  return { records: state.records, isLoading: state.isLoading, error: state.error, refresh: load }
}
