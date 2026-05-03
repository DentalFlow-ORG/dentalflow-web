import {
  KeyRound,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { FilteredEmptyState } from '@/components/common/FilteredEmptyState'
import { ListPageShell } from '@/components/common/ListPageShell'
import { ListToolbar } from '@/components/common/ListToolbar'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useListFilter } from '@/hooks/useListFilter'

import { deleteAdminUser, listAdminUsers } from '../services/admin-users.service'
import type { AdminUser, UserRole } from '../types/admin.types'
import { UserFormModal } from '../components/UserFormModal'
import { UserPasswordModal } from '../components/UserPasswordModal'
import type { FilterDef } from '@/components/common/ListToolbar'

const DEFAULT_PAGE_SIZE = 10

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Admin',
  OWNER: 'Proprietário',
  DENTIST: 'Profissional',
  ASSISTANT: 'Assistente',
  PATIENT: 'Paciente',
}

type RoleBadgeTone = 'success' | 'muted' | 'warning'

const ROLE_TONE: Record<UserRole, RoleBadgeTone> = {
  ADMIN: 'warning',
  OWNER: 'success',
  DENTIST: 'muted',
  ASSISTANT: 'muted',
  PATIENT: 'muted',
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))
}

const SEARCH_FN = (user: AdminUser, q: string) =>
  `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(q)

const FILTER_FNS = {
  role: (user: AdminUser, v: string) => user.role === v,
  status: (user: AdminUser, v: string) =>
    v === 'active' ? user.isActive : !user.isActive,
}

const FILTER_DEFS: FilterDef[] = [
  {
    key: 'role',
    label: 'Papel',
    options: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })),
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

type DeleteTarget = { id: string; name: string }
type PasswordTarget = { id: string; name: string }

export function AdminUsersPage() {
  const { showAlert } = useGlobalAlerts()

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
    searchQuery, setSearchQuery,
    activeFilters, setFilter, clearAll,
    page, setPage,
    totalPages,
    filteredCount,
    paginatedData: users,
  } = useListFilter<AdminUser>(allUsers, {
    searchFn: SEARCH_FN,
    filterFns: FILTER_FNS,
    pageSize,
  })

  function load() {
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
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      const msg = err instanceof Error ? err.message : 'Erro ao excluir usuário.'
      showAlert({ title: 'Erro ao excluir', description: msg, tone: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Administração"
        title="Usuários da plataforma"
        description="Gerencie todos os usuários cadastrados, independentemente da clínica."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo usuário
          </Button>
        }
      />

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando usuários..."
        error={loadError}
        onRetry={load}
        isEmpty={allUsers.length === 0}
        emptyState={
          <EmptyState
            icon={Users}
            title="Nenhum usuário encontrado"
            description="Adicione o primeiro usuário à plataforma."
            action={
              <Button onClick={() => setCreateOpen(true)}>
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
            totalCount={allUsers.length}
          />

          {filteredCount === 0 ? (
            <FilteredEmptyState icon={Users} onClear={clearAll} />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">Usuário</th>
                      <th className="px-4 py-3">Papel</th>
                      <th className="hidden px-4 py-3 md:table-cell">Clínica</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Criado em</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="cursor-pointer transition-colors hover:bg-slate-50/60"
                        onClick={() => setEditTarget(user)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={ROLE_TONE[user.role]}>
                            {ROLE_LABEL[user.role]}
                          </StatusBadge>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          {user.clinic ? (
                            <span className="text-sm text-slate-700">{user.clinic.name}</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={user.isActive ? 'success' : 'muted'}>
                            {user.isActive ? 'Ativo' : 'Inativo'}
                          </StatusBadge>
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-slate-500 lg:table-cell">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              title="Editar"
                              onClick={() => setEditTarget(user)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              title="Redefinir senha"
                              onClick={() =>
                                setPasswordTarget({
                                  id: user.id,
                                  name: `${user.firstName} ${user.lastName}`,
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
                                  id: user.id,
                                  name: `${user.firstName} ${user.lastName}`,
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

              <div className="border-t border-slate-100 px-4 py-3">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  filteredCount={filteredCount}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}
        </div>
      </ListPageShell>

      <UserFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <UserFormModal
        open={!!editTarget}
        initialData={editTarget ?? undefined}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEditSuccess}
      />

      {passwordTarget && (
        <UserPasswordModal
          open={!!passwordTarget}
          userId={passwordTarget.id}
          userName={passwordTarget.name}
          onClose={() => setPasswordTarget(null)}
          onSuccess={handlePasswordSuccess}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        tone="destructive"
        title="Desativar usuário?"
        subject={deleteTarget?.name}
        description="O acesso do usuário será encerrado imediatamente e todas as sessões ativas revogadas. Esta operação não exclui os dados permanentemente."
        confirmLabel="Desativar"
        cancelLabel="Cancelar"
        isConfirming={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppPage>
  )
}
