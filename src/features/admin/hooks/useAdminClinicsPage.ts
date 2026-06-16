import { useCallback, useEffect, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useListFilter } from '@/hooks/useListFilter'

import { CLINIC_FILTER_DEFS } from '../constants/admin-display'
import { deleteAdminClinic, listAdminClinicsPage } from '../services/admin-clinics.service'
import type { AdminClinic } from '../types/admin.types'

const DEFAULT_PAGE_SIZE = 10

type DeleteTarget = { id: string; name: string }

const SEARCH_FN = (clinic: AdminClinic, query: string) => clinic.name.toLowerCase().includes(query)

const FILTER_FNS = {
  status: (clinic: AdminClinic, value: string) => {
    const isActive = clinic.isActive !== false
    return value === 'active' ? isActive : !isActive
  },
}

function formatClinicDate(iso?: string) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))
}

export function useAdminClinicsPage() {
  const { showAlert } = useGlobalAlerts()

  const [allClinics, setAllClinics] = useState<AdminClinic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminClinic | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const {
    searchQuery,
    setSearchQuery,
    activeFilters,
    setFilter,
    clearAll,
    page,
    setPage,
    totalPages,
    filteredCount,
    paginatedData: clinics,
  } = useListFilter<AdminClinic>(allClinics, {
    searchFn: SEARCH_FN,
    filterFns: FILTER_FNS,
    pageSize,
  })

  const load = useCallback(() => {
    setIsLoading(true)
    setLoadError(null)
    listAdminClinicsPage(1, 500)
      .then((response) => setAllClinics(response.data))
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Não foi possível carregar as clínicas.'
        setLoadError(msg)
        showAlert({ title: 'Erro ao carregar clínicas', description: msg, tone: 'error' })
      })
      .finally(() => setIsLoading(false))
  }, [showAlert])

  useEffect(() => {
    load()
  }, [load])

  function handleCreateSuccess(clinic: AdminClinic) {
    setCreateOpen(false)
    showAlert({
      title: 'Clínica criada',
      description: `${clinic.name} foi adicionada com sucesso.`,
      tone: 'success',
    })
    load()
  }

  function handleEditSuccess(clinic: AdminClinic) {
    setEditTarget(null)
    showAlert({
      title: 'Clínica atualizada',
      description: `Dados de ${clinic.name} salvos.`,
      tone: 'success',
    })
    setAllClinics((prev) => prev.map((item) => (item.id === clinic.id ? clinic : item)))
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteAdminClinic(deleteTarget.id)
      showAlert({
        title: 'Clínica removida',
        description: `${deleteTarget.name} foi removida da listagem administrativa.`,
        tone: 'success',
      })
      setDeleteTarget(null)
      setAllClinics((prev) => prev.filter((clinic) => clinic.id !== deleteTarget.id))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir clínica.'
      showAlert({ title: 'Erro ao excluir', description: msg, tone: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    clinics,
    allClinics,
    isLoading,
    loadError,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setFilter,
    clearAll,
    page,
    setPage,
    totalPages,
    filteredCount,
    pageSize,
    setPageSize,
    filterDefs: CLINIC_FILTER_DEFS,
    formatDate: formatClinicDate,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    load,
    handleCreateSuccess,
    handleEditSuccess,
    handleDeleteConfirm,
  }
}
