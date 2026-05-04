import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { ApiError } from '@/services/http'

import { listPatients } from '../services/patients.service'
import type { PatientSummary } from '../types/patients.types'

export function usePatientsPage() {
  const { showAlert } = useGlobalAlerts()
  const [patients, setPatients] = useState<PatientSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      setIsLoading(true)
      setError(null)
      listPatients(searchTerm)
        .then((response) => setPatients(response.data))
        .catch((requestError) => {
          const message =
            requestError instanceof ApiError
              ? requestError.message
              : 'Erro ao carregar pacientes.'
          setError(message)
          showAlert({
            title: 'Erro ao carregar pacientes',
            description: message,
            tone: 'error',
          })
        })
        .finally(() => setIsLoading(false))
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
      patients.filter((patient) => {
        if (dateFrom && patient.lastVisit && patient.lastVisit < dateFrom) return false
        if (dateTo && patient.lastVisit && patient.lastVisit > dateTo) return false
        return true
      }),
    [dateFrom, dateTo, patients],
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
    patients,
    filteredPatients,
    paginatedPatients,
    isLoading,
    error,
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
