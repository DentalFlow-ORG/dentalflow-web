import { useCallback, useEffect, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useListFilter } from '@/hooks/useListFilter'

import { ADMIN_ROLE_LABEL, ADMIN_ROLE_TONE, USER_FILTER_DEFS } from '../constants/admin-display'
import { deleteAdminUser, listAdminUsers } from '../services/admin-users.service'
import type { AdminUser } from '../types/admin.types'

const DEFAULT_PAGE_SIZE = 10

function formatUserDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))
}

const SEARCH_FN = (user: AdminUser, q: string) =>
  `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(q)

const FILTER_FNS = {
  role: (user: AdminUser, v: string) => user.role === v,
  status: (user: AdminUser, v: string) => (v === 'active' ? user.isActive : !user.isActive),
}

type DeleteTarget = { id: string; name: string }
type PasswordTarget = { id: string; name: string }

export function useAdminUsersPage() {
  const { showAlert } = useGlobalAlerts()
  const { user: currentUser } = useAuth()

  const [allUsers, setAllUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null)
  const [passwordTarget, setPasswordTarget] = useState<PasswordTarget | null>(null)
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
    paginatedData: users,
  } = useListFilter<AdminUser>(allUsers, {
    searchFn: SEARCH_FN,
    filterFns: FILTER_FNS,
    pageSize,
  })

  const load = useCallback(() => {
    setIsLoading(true)
    setLoadError(null)
    listAdminUsers(1, 500)
      .then((res) => setAllUsers(res.data))
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Não foi possível carregar os usuários.'
        setLoadError(msg)
        showAlert({ title: 'Erro ao carregar usuários', description: msg, tone: 'error' })
      })
      .finally(() => setIsLoading(false))
  }, [showAlert])

  useEffect(() => {
    load()
  }, [load])

  function handleCreateSuccess(user: AdminUser) {
    setCreateOpen(false)
    showAlert({
      title: 'Usuário criado',
      description: `${user.firstName} ${user.lastName} foi adicionado com sucesso.`,
      tone: 'success',
    })
    load()
  }

  function handleEditSuccess(user: AdminUser) {
    setEditTarget(null)
    showAlert({
      title: 'Usuário atualizado',
      description: `Dados de ${user.firstName} ${user.lastName} salvos.`,
      tone: 'success',
    })
    setAllUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)))
  }

  function handlePasswordSuccess() {
    setPasswordTarget(null)
    showAlert({
      title: 'Senha redefinida',
      description: 'A nova senha foi salva e todas as sessões ativas foram encerradas.',
      tone: 'success',
    })
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteAdminUser(deleteTarget.id)
      showAlert({
        title: 'Usuário desativado',
        description: `${deleteTarget.name} foi desativado. Acesso encerrado imediatamente.`,
        tone: 'success',
      })
      setDeleteTarget(null)
      setAllUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao desativar usuário.'
      showAlert({ title: 'Erro ao desativar', description: msg, tone: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    currentUserId: currentUser?.id,
    users,
    allUsers,
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
    filterDefs: USER_FILTER_DEFS,
    roleLabel: ADMIN_ROLE_LABEL,
    roleTone: ADMIN_ROLE_TONE,
    formatDate: formatUserDate,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    passwordTarget,
    setPasswordTarget,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    load,
    handleCreateSuccess,
    handleEditSuccess,
    handlePasswordSuccess,
    handleDeleteConfirm,
  }
}
