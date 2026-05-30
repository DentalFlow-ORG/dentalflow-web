import { useCallback, useEffect, useRef, useState } from 'react'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { ApiError } from '@/services/http'
import { listClinicMembers } from '@/features/team/services/team.service'
import type { MemberListItem } from '@/features/team/types/team.types'
import {
  addLeadActivity,
  archiveLead,
  convertLead,
  createLead,
  getLeadSummary,
  listLeadActivities,
  listLeads,
  updateLead,
  updateLeadStatus,
} from '../services/leads.service'
import type {
  Lead,
  LeadActivity,
  LeadFilters,
  LeadSource,
  LeadStatus,
  LeadSummary,
} from '../types/leads.types'

type DrawerMode = 'view' | 'edit' | 'create' | null

const DEFAULT_FILTERS: LeadFilters = {
  search: '',
  status: '',
  source: '',
  assignedToUserId: '',
  hasFollowUp: false,
  page: 1,
  limit: 30,
}

export function useLeadsPage() {
  const { showAlert } = useGlobalAlerts()

  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState<LeadSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS)

  const [members, setMembers] = useState<MemberListItem[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)

  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const loadLeads = useCallback(
    (f: LeadFilters, searchOverride?: string) => {
      setIsLoading(true)
      listLeads({
        search: searchOverride ?? f.search,
        status: f.status,
        source: f.source,
        assignedToUserId: f.assignedToUserId || undefined,
        hasFollowUp: f.hasFollowUp || undefined,
        page: f.page,
        limit: f.limit,
      })
        .then((res) => {
          setLeads(res.data)
          setTotal(res.total)
        })
        .catch((err) => {
          const message = err instanceof ApiError ? err.message : 'Erro ao carregar leads.'
          showAlert({ title: 'Erro', description: message, tone: 'error' })
        })
        .finally(() => setIsLoading(false))
    },
    [showAlert],
  )

  const loadSummary = useCallback(() => {
    setIsLoadingSummary(true)
    getLeadSummary()
      .then(setSummary)
      .catch(() => {})
      .finally(() => setIsLoadingSummary(false))
  }, [])

  const loadMembers = useCallback(() => {
    setIsLoadingMembers(true)
    listClinicMembers()
      .then(({ members: fetched }) => setMembers(fetched))
      .catch(() => {})
      .finally(() => setIsLoadingMembers(false))
  }, [])

  useEffect(() => {
    loadLeads(filters, debouncedSearch || undefined)
  }, [filters.status, filters.source, filters.assignedToUserId, filters.hasFollowUp, filters.page, debouncedSearch, loadLeads])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  function handleFiltersChange(partial: Partial<LeadFilters>) {
    const updated = { ...filters, ...partial }

    if ('search' in partial) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => setDebouncedSearch(partial.search ?? ''), 400)
      setFilters(updated)
      return
    }

    setFilters(updated)
  }

  function clearFilters() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setDebouncedSearch('')
    setFilters(DEFAULT_FILTERS)
  }

  const hasActiveFilters =
    !!filters.search || !!filters.status || !!filters.source || !!filters.assignedToUserId || filters.hasFollowUp

  // Drawer actions
  function openCreate() {
    setSelectedLead(null)
    setActivities([])
    setDrawerMode('create')
  }

  function openView(lead: Lead) {
    setSelectedLead(lead)
    setDrawerMode('view')
    loadActivities(lead.id)
  }

  function openEdit(lead: Lead) {
    setSelectedLead(lead)
    setDrawerMode('edit')
  }

  function closeDrawer() {
    setDrawerMode(null)
    setSelectedLead(null)
    setActivities([])
  }

  async function loadActivities(leadId: string) {
    setIsLoadingActivities(true)
    try {
      const data = await listLeadActivities(leadId)
      setActivities(data)
    } catch {
      // non-critical
    } finally {
      setIsLoadingActivities(false)
    }
  }

  async function handleSave(payload: {
    name: string
    phone?: string
    email?: string
    source?: LeadSource
    message?: string
    nextFollowUpAt?: string | null
    assignedToUserId?: string | null
    status?: LeadStatus
  }) {
    setIsSaving(true)
    try {
      if (drawerMode === 'create') {
        await createLead(payload)
        showAlert({ title: 'Lead criado', description: 'O lead foi cadastrado com sucesso.', tone: 'success' })
      } else if (drawerMode === 'edit' && selectedLead) {
        await updateLead(selectedLead.id, payload)
        showAlert({ title: 'Lead atualizado', description: 'As informações foram salvas.', tone: 'success' })
      }
      closeDrawer()
      loadLeads(filters, debouncedSearch || undefined)
      loadSummary()
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        showAlert({
          title: 'Limite de leads atingido',
          description: `${err.message} Faça upgrade para continuar cadastrando leads.`,
          tone: 'warning',
        })
      } else {
        const message = err instanceof ApiError ? err.message : 'Erro ao salvar lead.'
        showAlert({ title: 'Erro', description: message, tone: 'error' })
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStatusChange(status: LeadStatus) {
    if (!selectedLead) return
    try {
      const updated = await updateLeadStatus(selectedLead.id, status)
      setSelectedLead(updated)
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      loadSummary()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao alterar status.'
      showAlert({ title: 'Erro', description: message, tone: 'error' })
      throw err
    }
  }

  async function handleConvert() {
    if (!selectedLead) return
    try {
      const updated = await convertLead(selectedLead.id)
      setSelectedLead(updated)
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      await loadActivities(selectedLead.id)
      loadSummary()
      showAlert({ title: 'Lead convertido', description: 'O lead foi marcado como convertido.', tone: 'success' })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao converter lead.'
      showAlert({ title: 'Erro', description: message, tone: 'error' })
      throw err
    }
  }

  async function handleAddNote(note: string) {
    if (!selectedLead) return
    try {
      await addLeadActivity(selectedLead.id, { action: 'NOTE_ADDED', note })
      await loadActivities(selectedLead.id)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao salvar nota.'
      showAlert({ title: 'Erro', description: message, tone: 'error' })
      throw err
    }
  }

  async function handleAddContact() {
    if (!selectedLead) return
    try {
      await addLeadActivity(selectedLead.id, { action: 'CONTACTED' })
      await loadActivities(selectedLead.id)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao registrar contato.'
      showAlert({ title: 'Erro', description: message, tone: 'error' })
      throw err
    }
  }

  async function handleArchive(lead: Lead) {
    try {
      await archiveLead(lead.id)
      showAlert({ title: 'Lead arquivado', description: 'O lead foi arquivado.', tone: 'success' })
      loadLeads(filters, debouncedSearch || undefined)
      loadSummary()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao arquivar lead.'
      showAlert({ title: 'Erro', description: message, tone: 'error' })
    }
  }

  return {
    leads,
    total,
    summary,
    isLoading,
    isLoadingSummary,
    filters,
    hasActiveFilters,
    members,
    isLoadingMembers,
    drawerMode,
    selectedLead,
    activities,
    isLoadingActivities,
    isSaving,
    handleFiltersChange,
    clearFilters,
    openCreate,
    openView,
    openEdit,
    closeDrawer,
    handleSave,
    handleStatusChange,
    handleConvert,
    handleAddNote,
    handleAddContact,
    handleArchive,
  }
}
