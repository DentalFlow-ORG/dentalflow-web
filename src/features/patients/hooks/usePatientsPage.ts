import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { ApiError } from '@/services/http'

import { listPatients } from '../services/patients.service'
import type { PatientSummary } from '../types/patients.types'
import { patientAvatarCacheKey, setCachedPatientAvatar } from './usePatientAvatar'

type FetchState = { patients: PatientSummary[]; isLoading: boolean; error: string | null }
type FetchAction =
  | { type: 'loading' }
  | { type: 'success'; patients: PatientSummary[] }
  | { type: 'error'; message: string }

function fetchReducer(state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'success':
      return { patients: action.patients, isLoading: false, error: null }
    case 'error':
      return { ...state, isLoading: false, error: action.message }
  }
}

export function usePatientsPage() {
  const { showAlert } = useGlobalAlerts()
  const [fetchState, dispatch] = useReducer(fetchReducer, {
    patients: [],
    isLoading: true,
    error: null,
  })
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadPatients = useCallback(
    (searchTerm?: string) => {
      dispatch({ type: 'loading' })
      listPatients(searchTerm)
        .then((response) => {
          // listPatients already returns avatarUrl via a LEFT JOIN on patient_avatars.
          // Pre-warm the session cache so that opening a patient's detail panel or
          // clinical record serves the avatar instantly without a separate fetch.
          for (const patient of response.data) {
            // Keyed on identity, so two patients sharing an email address
            // pre-warm separate entries instead of overwriting each other.
            setCachedPatientAvatar(
              patientAvatarCacheKey(patient.identifier, patient.patientId) as string,
              patient.avatarUrl ?? null,
            )
          }
          dispatch({ type: 'success', patients: response.data })
        })
        .catch((requestError) => {
          const message =
            requestError instanceof ApiError ? requestError.message : 'Erro ao carregar pacientes.'
          dispatch({ type: 'error', message })
          showAlert({ title: 'Erro ao carregar pacientes', description: message, tone: 'error' })
        })
    },
    [showAlert],
  )

  const handleSearchChange = (value: string) => {
    setPage(1)
    setSearch(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 400)
  }

  useEffect(() => {
    loadPatients(debouncedSearch || undefined)
  }, [debouncedSearch, loadPatients])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const filteredPatients = useMemo(
    () =>
      fetchState.patients.filter((patient) => {
        if (dateFrom && patient.lastVisit && patient.lastVisit < dateFrom) return false
        if (dateTo && patient.lastVisit && patient.lastVisit > dateTo) return false
        return true
      }),
    [dateFrom, dateTo, fetchState.patients],
  )

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )
  const hasFilters = !!debouncedSearch || !!dateFrom || !!dateTo

  const handleDateFromChange = (value: string) => {
    setPage(1)
    setDateFrom(value)
  }

  const handleDateToChange = (value: string) => {
    setPage(1)
    setDateTo(value)
  }

  const handleRefresh = () => {
    loadPatients(debouncedSearch || undefined)
  }

  return {
    patients: fetchState.patients,
    filteredPatients,
    paginatedPatients,
    isLoading: fetchState.isLoading,
    error: fetchState.error,
    search,
    dateFrom,
    dateTo,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    selectedPatient,
    setSelectedPatient,
    hasFilters,
    handleSearchChange,
    handleDateFromChange,
    handleDateToChange,
    handleRefresh,
  }
}
