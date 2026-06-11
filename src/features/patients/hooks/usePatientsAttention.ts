import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { ApiError } from '@/services/http'

import { getPatientsAttention } from '../services/attention.service'
import { batchGetPatientAvatars } from '../services/patients.service'
import type {
  AttentionPriority,
  AttentionReason,
  AttentionResponse,
  PatientAttentionItem,
} from '../types/attention.types'
import {
  getCachedPatientAvatar,
  getMissingPatientAvatarIdentifiers,
  setCachedPatientAvatar,
} from './usePatientAvatar'

type FetchState = {
  data: AttentionResponse | null
  isLoading: boolean
  error: string | null
}

type FetchAction =
  | { type: 'loading' }
  | { type: 'success'; data: AttentionResponse }
  | { type: 'error'; message: string }

function fetchReducer(state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'success':
      return { data: action.data, isLoading: false, error: null }
    case 'error':
      return { ...state, isLoading: false, error: action.message }
  }
}

export type AttentionReasonFilter = AttentionReason | 'ALL'
export type AttentionPriorityFilter = AttentionPriority | 'ALL'
export type WhatsAppFilter = 'ALL' | 'HAS_CONSENT'

export function usePatientsAttention() {
  const { showAlert } = useGlobalAlerts()
  const [fetchState, dispatch] = useReducer(fetchReducer, {
    data: null,
    isLoading: true,
    error: null,
  })
  const [avatarsByIdentifier, setAvatarsByIdentifier] = useState<Record<string, string | null>>({})
  const [search, setSearch] = useState('')
  const [reasonFilter, setReasonFilter] = useState<AttentionReasonFilter>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<AttentionPriorityFilter>('ALL')
  const [whatsappFilter, setWhatsappFilter] = useState<WhatsAppFilter>('ALL')

  const load = useCallback(() => {
    dispatch({ type: 'loading' })
    getPatientsAttention()
      .then((data) => {
        dispatch({ type: 'success', data })

        const identifiers = [...new Set(data.items.map((item) => item.identifier))]

        // Populate immediately from the session cache (warmed by the patient list).
        const fromCache: Record<string, string | null> = {}
        for (const id of identifiers) {
          const cached = getCachedPatientAvatar(id)
          if (cached !== undefined) fromCache[id] = cached
        }
        setAvatarsByIdentifier(fromCache)

        // Fetch only identifiers the cache does not already hold.
        const missing = getMissingPatientAvatarIdentifiers(identifiers)
        if (missing.length === 0) return

        batchGetPatientAvatars(missing)
          .then((res) => {
            for (const [id, url] of Object.entries(res.avatars)) {
              setCachedPatientAvatar(id, url)
            }
            setAvatarsByIdentifier((prev) => ({ ...prev, ...res.avatars }))
          })
          .catch(() => {
            // Batch failed — page keeps cached avatars/initials, no crash.
          })
      })
      .catch((err) => {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Erro ao carregar pacientes que precisam de atenção.'
        dispatch({ type: 'error', message })
        showAlert({ title: 'Erro ao carregar atenção', description: message, tone: 'error' })
      })
  }, [showAlert])

  useEffect(() => {
    load()
  }, [load])

  const filteredItems = useMemo<PatientAttentionItem[]>(() => {
    const items = fetchState.data?.items ?? []
    return items.filter((item) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const nameMatch = item.patientName.toLowerCase().includes(q)
        const emailMatch = item.patientEmail?.toLowerCase().includes(q) ?? false
        if (!nameMatch && !emailMatch) return false
      }
      if (reasonFilter !== 'ALL' && !item.allReasons.includes(reasonFilter)) return false
      if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false
      if (whatsappFilter === 'HAS_CONSENT' && !item.hasWhatsappConsent) return false
      return true
    })
  }, [fetchState.data, search, reasonFilter, priorityFilter, whatsappFilter])

  const hasFilters =
    !!search.trim() ||
    reasonFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    whatsappFilter !== 'ALL'

  const clearFilters = () => {
    setSearch('')
    setReasonFilter('ALL')
    setPriorityFilter('ALL')
    setWhatsappFilter('ALL')
  }

  return {
    summary: fetchState.data?.summary ?? null,
    allItems: fetchState.data?.items ?? [],
    filteredItems,
    avatarsByIdentifier,
    isLoading: fetchState.isLoading,
    error: fetchState.error,
    search,
    setSearch,
    reasonFilter,
    setReasonFilter,
    priorityFilter,
    setPriorityFilter,
    whatsappFilter,
    setWhatsappFilter,
    hasFilters,
    clearFilters,
    refresh: load,
  }
}
