import { KeyRound, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { FilteredEmptyState } from '@/components/common/FilteredEmptyState'
import type { FilterDef } from '@/components/common/ListToolbar'
import { ListToolbar } from '@/components/common/ListToolbar'
import { ListPageShell } from '@/components/common/ListPageShell'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useListFilter } from '@/hooks/useListFilter'

import { ClinicMemberFormModal } from '../components/ClinicMemberFormModal'
import { ClinicMemberPasswordModal } from '../components/ClinicMemberPasswordModal'
import { deleteClinicMember, listClinicMembers } from '../services/team.service'
import type { MemberListItem } from '../types/team.types'

const PAGE_SIZE = 10
const DEFAULT_USER_LIMIT = 8

const ROLE_LABEL: Record<string, string> = {
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
  `${member.firstName} ${member.lastName} ${member.email}`
    .toLowerCase()
    .includes(query)

const FILTER_FNS = {
  role: (member: MemberListItem, value: string) => member.role === value,
  status: (member: MemberListItem, value: string) =>
    value === 'active' ? member.isActive : !member.isActive,
}

type DeleteTarget = { id: string; name: string }
type PasswordTarget = { id: string; name: string }

export function TeamPage() {
  const { showAlert } = useGlobalAlerts()

  const [allMembers, setAllMembers] = useState<MemberListItem[]>([])
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

  const activeUserCount =
    allMembers.filter((member) => member.isActive).length + 1
  const hasReachedUserLimit = activeUserCount >= DEFAULT_USER_LIMIT

  function load() {
    setIsLoading(true)
    setError(null)
    listClinicMembers()
      .then(setAllMembers)
      .catch((err) => {
        const msg =
          err instanceof Error ? err.message : 'Não foi possível carregar a equipe.'
        setError(msg)
        showAlert({ title: 'Erro ao carregar equipe', description: msg, tone: 'error' })
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleCreateClick() {
    if (hasReachedUserLimit) {
      showAlert({
        title: 'Limite de usuários atingido',
        description: `O plano atual permite até ${DEFAULT_USER_LIMIT} usuários ativos.`,
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
    setAllMembers((prev) =>
      prev.map((existing) => (existing.id === member.id ? member : existing)),
    )
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
      setAllMembers((prev) =>
        prev.filter((member) => member.id !== deleteTarget.id),
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao desativar usuário.'
      showAlert({ title: 'Erro ao desativar', description: msg, tone: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Equipe"
        title="Usuários da clínica"
        description={`Gerencie profissionais e assistentes da clínica. ${activeUserCount}/${DEFAULT_USER_LIMIT} usuários ativos no plano atual.`}
        action={
          <Button onClick={handleCreateClick} disabled={hasReachedUserLimit}>
            <Plus className="h-4 w-4" />
            Novo usuário
          </Button>
        }
      />

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando usuários..."
        error={error}
        onRetry={load}
        isEmpty={allMembers.length === 0}
        emptyState={
          <EmptyState
            icon={Users}
            title="Nenhum usuário cadastrado"
            description="Adicione profissionais e assistentes para gerenciar a equipe da clínica."
            action={
              <Button onClick={handleCreateClick} disabled={hasReachedUserLimit}>
                <Plus className="h-4 w-4" />
                Novo usuário
              </Button>
            }
          />
        }
      >
        <div className="space-y-4">
          <ListToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Pesquisar por nome ou e-mail..."
            filterDefs={FILTER_DEFS}
            activeFilters={activeFilters}
            onFilterChange={setFilter}
            onClearAll={clearAll}
            filteredCount={filteredCount}
            totalCount={allMembers.length}
          />

          {filteredCount === 0 ? (
            <FilteredEmptyState icon={Users} onClear={clearAll} />
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">Usuário</th>
                        <th className="px-4 py-3">Papel</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="hidden px-4 py-3 md:table-cell">Perfil</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.map((member) => (
                        <tr
                          key={member.id}
                          className="cursor-pointer transition-colors hover:bg-slate-50/60"
                          onClick={() => setEditTarget(member)}
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {member.email}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge tone="muted">
                              {ROLE_LABEL[member.role] ?? member.role}
                            </StatusBadge>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge tone={member.isActive ? 'success' : 'muted'}>
                              {member.isActive ? 'Ativo' : 'Inativo'}
                            </StatusBadge>
                          </td>
                          <td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell">
                            {member.profile ? (
                              <span>
                                {member.profile.displayName}
                                {member.profile.slug ? ` · /${member.profile.slug}` : ''}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className="flex items-center justify-end gap-1"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                title="Editar"
                                onClick={() => setEditTarget(member)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                title="Redefinir senha"
                                onClick={() =>
                                  setPasswordTarget({
                                    id: member.id,
                                    name: `${member.firstName} ${member.lastName}`,
                                  })
                                }
                              >
                                <KeyRound className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                title="Desativar"
                                className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                onClick={() =>
                                  setDeleteTarget({
                                    id: member.id,
                                    name: `${member.firstName} ${member.lastName}`,
                                  })
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                filteredCount={filteredCount}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </ListPageShell>

      <ClinicMemberFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <ClinicMemberFormModal
        open={!!editTarget}
        initialData={editTarget ?? undefined}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEditSuccess}
      />

      {passwordTarget && (
        <ClinicMemberPasswordModal
          open={!!passwordTarget}
          memberId={passwordTarget.id}
          memberName={passwordTarget.name}
          onClose={() => setPasswordTarget(null)}
          onSuccess={handlePasswordSuccess}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        tone="destructive"
        title="Desativar usuário?"
        subject={deleteTarget?.name}
        description="O acesso do usuário será encerrado imediatamente. Esta operação não exclui os dados permanentemente."
        confirmLabel="Desativar"
        cancelLabel="Cancelar"
        isConfirming={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppPage>
  )
}
