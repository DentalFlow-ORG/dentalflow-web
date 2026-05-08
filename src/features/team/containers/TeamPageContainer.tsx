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

import { ClinicMemberFormModal } from '../components/ClinicMemberFormModal'
import { ClinicMemberPasswordModal } from '../components/ClinicMemberPasswordModal'
import { useTeamPage } from '../hooks/useTeamPage'

export function TeamPageContainer() {
  const {
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
    pageSize,
    filterDefs,
    roleLabel,
    activeUserCount,
    hasReachedUserLimit,
    userLimit,
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
  } = useTeamPage()

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Equipe"
        title="Usuários da clínica"
        description={`Gerencie profissionais e assistentes da clínica. ${activeUserCount}/${userLimit} usuários ativos no plano atual.`}
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
            filterDefs={filterDefs}
            activeFilters={activeFilters}
            onFilterChange={setFilter}
            onClearAll={clearAll}
            filteredCount={filteredCount}
            totalCount={allMembers.length}
          />

          {filteredCount === 0 ? (
            <FilteredEmptyState icon={Users} onClear={clearAll} />
          ) : (
            <div className="space-y-4">
              {/* Mobile card list — hidden on sm+ */}
              <div className="space-y-3 sm:hidden">
                {members.map((member) => (
                  <div key={member.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="truncate text-xs text-slate-500">{member.email}</p>
                      </div>
                      <StatusBadge tone="muted">
                        {roleLabel[member.role] ?? member.role}
                      </StatusBadge>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge tone={member.isActive ? 'success' : 'muted'}>
                        {member.isActive ? 'Ativo' : 'Inativo'}
                      </StatusBadge>
                      {member.profile && (
                        <span className="truncate text-xs text-slate-500">
                          {member.profile.displayName}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditTarget(member)}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setPasswordTarget({
                            id: member.id,
                            name: `${member.firstName} ${member.lastName}`,
                          })
                        }
                      >
                        <KeyRound className="h-4 w-4" aria-hidden="true" />
                        Senha
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={() =>
                          setDeleteTarget({
                            id: member.id,
                            name: `${member.firstName} ${member.lastName}`,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Desativar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table — hidden below sm */}
              <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:block">
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
                            <p className="mt-0.5 text-xs text-slate-500">{member.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge tone="muted">
                              {roleLabel[member.role] ?? member.role}
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
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                title="Editar"
                                aria-label="Editar usuário"
                                onClick={() => setEditTarget(member)}
                              >
                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                title="Redefinir senha"
                                aria-label="Redefinir senha"
                                onClick={() =>
                                  setPasswordTarget({
                                    id: member.id,
                                    name: `${member.firstName} ${member.lastName}`,
                                  })
                                }
                              >
                                <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                title="Desativar"
                                aria-label="Desativar usuário"
                                className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                onClick={() =>
                                  setDeleteTarget({
                                    id: member.id,
                                    name: `${member.firstName} ${member.lastName}`,
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
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                filteredCount={filteredCount}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
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
