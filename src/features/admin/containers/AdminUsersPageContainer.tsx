import type { ComponentProps } from 'react'
import { KeyRound, Pencil, Plus, Trash2, Users } from 'lucide-react'

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

import { UserFormModal } from '../components/UserFormModal'
import { UserPasswordModal } from '../components/UserPasswordModal'
import { useAdminUsersPage } from '../hooks/useAdminUsersPage'
import type { AdminUser } from '../types/admin.types'

type AdminUserMobileCardProps = {
  user: AdminUser
  roleLabel: Record<AdminUser['role'], string>
  roleTone: Record<AdminUser['role'], ComponentProps<typeof StatusBadge>['tone']>
  formatDate: (value: string) => string
  onEdit: (user: AdminUser) => void
  onPassword: (target: { id: string; name: string }) => void
  onDeactivate: (target: { id: string; name: string }) => void
}

function AdminUserMobileCard({
  user,
  roleLabel,
  roleTone,
  formatDate,
  onEdit,
  onPassword,
  onDeactivate,
}: AdminUserMobileCardProps) {
  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-950">{fullName}</h3>
            <p className="mt-1 break-all text-xs text-slate-500">{user.email}</p>
          </div>
          <StatusBadge tone={user.isActive ? 'success' : 'muted'}>
            {user.isActive ? 'Ativo' : 'Inativo'}
          </StatusBadge>
        </div>

        <dl className="grid gap-2 text-xs text-slate-600">
          <div className="flex items-center justify-between gap-3">
            <dt className="font-medium text-slate-500">Papel</dt>
            <dd>
              <StatusBadge tone={roleTone[user.role]}>{roleLabel[user.role]}</StatusBadge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="font-medium text-slate-500">Clínica</dt>
            <dd className="min-w-0 truncate text-right text-slate-700">
              {user.clinic?.name ?? 'Sem clínica vinculada'}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="font-medium text-slate-500">Criado em</dt>
            <dd className="text-right text-slate-700">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>

        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
          <Button variant="outline" className="w-full" onClick={() => onEdit(user)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Editar
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onPassword({ id: user.id, name: fullName })}
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Senha
          </Button>
          <Button
            variant="ghost"
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onDeactivate({ id: user.id, name: fullName })}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Desativar
          </Button>
        </div>
      </div>
    </article>
  )
}

export function AdminUsersPageContainer() {
  const {
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
    filterDefs,
    roleLabel,
    roleTone,
    formatDate,
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
  } = useAdminUsersPage()

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Administração"
        title="Usuários da plataforma"
        description="Gerencie todos os usuários cadastrados, independentemente da clínica."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
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
                <Plus className="h-4 w-4" aria-hidden="true" />
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
            filterDefs={filterDefs}
            activeFilters={activeFilters}
            onFilterChange={setFilter}
            onClearAll={clearAll}
            filteredCount={filteredCount}
            totalCount={allUsers.length}
          />

          {filteredCount === 0 ? (
            <FilteredEmptyState icon={Users} onClear={clearAll} />
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="space-y-3 p-3 md:hidden">
                {users.map((user) => (
                  <AdminUserMobileCard
                    key={user.id}
                    user={user}
                    roleLabel={roleLabel}
                    roleTone={roleTone}
                    formatDate={formatDate}
                    onEdit={setEditTarget}
                    onPassword={setPasswordTarget}
                    onDeactivate={setDeleteTarget}
                  />
                ))}
              </div>

              <div className="hidden md:block">
                <table className="w-full text-sm" aria-label="Usuários da plataforma">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th scope="col" className="px-4 py-3">Usuário</th>
                      <th scope="col" className="px-4 py-3">Papel</th>
                      <th scope="col" className="hidden px-4 py-3 md:table-cell">Clínica</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="hidden px-4 py-3 lg:table-cell">Criado em</th>
                      <th scope="col" className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Editar ${user.firstName} ${user.lastName}`}
                        className="cursor-pointer transition-colors hover:bg-slate-50/60 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        onClick={() => setEditTarget(user)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setEditTarget(user)
                          }
                        }}
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={roleTone[user.role]}>
                            {roleLabel[user.role]}
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
                              aria-label={`Editar ${user.firstName} ${user.lastName}`}
                              title="Editar"
                              onClick={() => setEditTarget(user)}
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              aria-label={`Redefinir senha de ${user.firstName} ${user.lastName}`}
                              title="Redefinir senha"
                              onClick={() =>
                                setPasswordTarget({
                                  id: user.id,
                                  name: `${user.firstName} ${user.lastName}`,
                                })
                              }
                            >
                              <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              aria-label={`Desativar ${user.firstName} ${user.lastName}`}
                              title="Desativar"
                              className="text-red-500 hover:bg-red-50 hover:text-red-700"
                              onClick={() =>
                                setDeleteTarget({
                                  id: user.id,
                                  name: `${user.firstName} ${user.lastName}`,
                                })
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
