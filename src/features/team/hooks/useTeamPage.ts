import { useCallback, useEffect, useState } from 'react'

import type { FilterDef } from '@/components/common/ListToolbar'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useListFilter } from '@/hooks/useListFilter'

import { deleteClinicMember, listClinicMembers } from '../services/team.service'
import type { MemberListItem, UserLimitUsage } from '../types/team.types'

const PAGE_SIZE = 10

const TEAM_ROLE_LABEL: Record<string, string> = {
  DENTIST: 'Profissional',
  ASSISTANT: 'Assistente',
}

const FILTER_DEFS: FilterDef[] = [
  {
    key: 'role',
    label: 'Papel',
    options: [
      { value: 'DENTIST', label: 'Profissional' },
      { value: 'ASSISTANT', label: 'Assistente' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Ativo' },
      { value: 'inactive', label: 'Inativo' },
    ],
  },
]

const SEARCH_FN = (member: MemberListItem, query: string) =>
  `${member.firstName} ${member.lastName} ${member.email}`.toLowerCase().includes(query)

const FILTER_FNS = {
  role: (member: MemberListItem, value: string) => member.role === value,
  status: (member: MemberListItem, value: string) =>
    value === 'active' ? member.isActive : !member.isActive,
}

type DeleteTarget = { id: string; name: string }
type PasswordTarget = { id: string; name: string }

const DEFAULT_USAGE: UserLimitUsage = {
  limit: 0,
  used: 0,
  remaining: 0,
  planSlug: '',
  planName: null,
}

export function useTeamPage() {
  const { showAlert } = useGlobalAlerts()

  const [allMembers, setAllMembers] = useState<MemberListItem[]>([])
  const [usage, setUsage] = useState<UserLimitUsage>(DEFAULT_USAGE)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MemberListItem | null>(null)
  const [passwordTarget, setPasswordTarget] = useState<PasswordTarget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
    paginatedData: members,
  } = useListFilter<MemberListItem>(allMembers, {
    searchFn: SEARCH_FN,
    filterFns: FILTER_FNS,
    pageSize: PAGE_SIZE,
  })

  const hasReachedUserLimit = usage.remaining <= 0 && usage.limit > 0

  const load = useCallback(() => {
    setIsLoading(true)
    setError(null)
    listClinicMembers()
      .then(({ members: fetchedMembers, usage: fetchedUsage }) => {
        setAllMembers(fetchedMembers)
        setUsage(fetchedUsage)
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Não foi possível carregar a equipe.'
        setError(msg)
        showAlert({ title: 'Erro ao carregar equipe', description: msg, tone: 'error' })
      })
      .finally(() => setIsLoading(false))
  }, [showAlert])

  useEffect(() => {
    load()
  }, [load])

  function handleCreateClick() {
    if (hasReachedUserLimit) {
      showAlert({
        title: 'Limite de usuários atingido',
        description: `O plano atual permite até ${usage.limit} usuários ativos. Acesse Assinatura para fazer upgrade.`,
        tone: 'warning',
      })
      return
    }
    setCreateOpen(true)
  }

  function handleCreateSuccess(member: MemberListItem) {
    setCreateOpen(false)
    showAlert({
      title: 'Usuário criado',
      description: `${member.firstName} ${member.lastName} foi adicionado à clínica.`,
      tone: 'success',
    })
    load()
  }

  function handleEditSuccess(member: MemberListItem) {
    setEditTarget(null)
    showAlert({
      title: 'Usuário atualizado',
      description: `Dados de ${member.firstName} ${member.lastName} salvos.`,
      tone: 'success',
    })
    load()
  }

  function handlePasswordSuccess() {
    setPasswordTarget(null)
    showAlert({
      title: 'Senha redefinida',
      description: 'A nova senha foi salva para o usuário.',
      tone: 'success',
    })
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteClinicMember(deleteTarget.id)
      showAlert({
        title: 'Usuário desativado',
        description: `${deleteTarget.name} foi desativado.`,
        tone: 'success',
      })
      setDeleteTarget(null)
      load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao desativar usuário.'
      showAlert({ title: 'Erro ao desativar', description: msg, tone: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    members,
    allMembers,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setFilter,
    clearAll,
    page,
    setPage,
    totalPages,
    filteredCount,
    pageSize: PAGE_SIZE,
    filterDefs: FILTER_DEFS,
    roleLabel: TEAM_ROLE_LABEL,
    usage,
    hasReachedUserLimit,
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
    handleCreateClick,
    handleCreateSuccess,
    handleEditSuccess,
    handlePasswordSuccess,
    handleDeleteConfirm,
  }
}
