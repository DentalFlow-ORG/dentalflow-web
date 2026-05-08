import { KeyRound, Pencil, Plus, Trash2, Users } from 'lucide-react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { FilteredEmptyState } from '@/components/common/FilteredEmptyState'
import { ListPageShell } from '@/components/common/ListPageShell'
import { ListToolbar } from '@/components/common/ListToolbar'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
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

  const availableUserSlots = Math.max(userLimit - activeUserCount, 0)
  const userLimitUsagePercent =
    userLimit > 0 ? Math.min(100, Math.round((activeUserCount / userLimit) * 100)) : 0

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Equipe"
        title="Usuários da clínica"
        description={`Gerencie profissionais e assistentes da clínica. ${activeUserCount}/${userLimit} usuários ativos no plano atual.`}
        action={
          <Button onClick={handleCreateClick} disabled={hasReachedUserLimit}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo usuário
          </Button>
        }
      />

      <PanelCard className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-950">Uso de usuários do plano</p>
              <StatusBadge tone={hasReachedUserLimit ? 'warning' : 'success'}>
                {activeUserCount}/{userLimit} ativos
              </StatusBadge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {hasReachedUserLimit
                ? 'Limite de usuários ativos atingido para o plano atual.'
                : `${availableUserSlots} ${availableUserSlots === 1 ? 'vaga disponível' : 'vagas disponíveis'} para novos usuários ativos.`}
            </p>
          </div>
          <div className="w-full sm:max-w-56">
            <div
              className="h-2 overflow-hidden rounded-full bg-slate-100"
              aria-label={`Uso de usuários do plano: ${activeUserCount} de ${userLimit}`}
              role="img"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${userLimitUsagePercent}%` }}
              />
            </div>
          </div>
        </div>
      </PanelCard>

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
            totalCount={allMembers.length}
          />

          {filteredCount === 0 ? (
            <FilteredEmptyState icon={Users} onClear={clearAll} />
          ) : (
            <div className="space-y-4">
              {/* Mobile card list — hidden on sm+ */}
              <div className="space-y-3 md:hidden">
                {members.map((member) => (
                  <PanelCard key={member.id} className="p-4">
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
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => setEditTarget(member)}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full"
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
                        className="col-span-2 w-full text-red-700 hover:bg-red-50 hover:text-red-700"
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
                  </PanelCard>
                ))}
              </div>

              {/* Desktop table — hidden below sm */}
              <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-label="Usuários da clínica">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th scope="col" className="px-4 py-3">Usuário</th>
                        <th scope="col" className="px-4 py-3">Papel</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                        <th scope="col" className="hidden px-4 py-3 md:table-cell">Perfil</th>
                        <th scope="col" className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.map((member) => (
                        <tr
                          key={member.id}
                          role="button"
                          tabIndex={0}
                          aria-label={`Editar ${member.firstName} ${member.lastName}`}
                          className="cursor-pointer transition-colors hover:bg-slate-50/60 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          onClick={() => setEditTarget(member)}
                          onKeyDown={(event) => {
                            if (event.target !== event.currentTarget) return
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              setEditTarget(member)
                            }
                          }}
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
