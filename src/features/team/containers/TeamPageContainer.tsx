import { useState } from 'react'
import { KeyRound, MoreHorizontal, Pencil, Plus, Trash2, User, Users } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { FilteredEmptyState } from '@/components/common/FilteredEmptyState'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { ListPageShell } from '@/components/common/ListPageShell'
import { ListToolbar } from '@/components/common/ListToolbar'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { ClinicMemberFormModal } from '../components/ClinicMemberFormModal'
import { ClinicMemberPasswordModal } from '../components/ClinicMemberPasswordModal'
import { useTeamPage } from '../hooks/useTeamPage'
import type { MemberListItem } from '../types/team.types'

type MemberRowActionsProps = {
  member: MemberListItem
  onEdit: () => void
  onPassword: () => void
  onDelete: () => void
}

function MemberRowActions({ member, onEdit, onPassword, onDelete }: MemberRowActionsProps) {
  const [open, setOpen] = useState(false)
  const fullName = `${member.firstName} ${member.lastName}`

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button size="xs" variant="outline" onClick={onEdit}>
        <Pencil aria-hidden="true" />
        Editar
      </Button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label={`Mais ações para ${fullName}`}
            aria-haspopup="menu"
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 overflow-hidden py-1">
          {member.profile && (
            <>
              <Link
                to="/app/equipe/$profileId"
                params={{ profileId: member.profile.id }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                onClick={() => setOpen(false)}
              >
                <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Ver perfil
              </Link>
              <div className="mx-1 my-0.5 h-px bg-border" role="separator" />
            </>
          )}
          <button
            type="button"
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
            onClick={() => {
              setOpen(false)
              onPassword()
            }}
          >
            <KeyRound className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Alterar senha
          </button>
          <div className="mx-1 my-0.5 h-px bg-border" role="separator" />
          <button
            type="button"
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none dark:hover:bg-destructive/35 dark:focus:bg-destructive/35"
            onClick={() => {
              setOpen(false)
              onDelete()
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Desativar
          </button>
        </PopoverContent>
      </Popover>
    </div>
  )
}

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
  } = useTeamPage()

  const { used: activeUserCount, limit: userLimit, remaining: availableUserSlots } = usage
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
              <p className="text-sm font-semibold text-foreground">Uso de usuários do plano</p>
              <StatusBadge tone={hasReachedUserLimit ? 'warning' : 'success'}>
                {activeUserCount}/{userLimit} ativos
              </StatusBadge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasReachedUserLimit
                ? 'Limite de usuários ativos atingido para o plano atual.'
                : `${availableUserSlots} ${availableUserSlots === 1 ? 'vaga disponível' : 'vagas disponíveis'} para novos usuários ativos.`}
            </p>
          </div>
          <div className="w-full sm:max-w-56">
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
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

      {hasReachedUserLimit && (
        <InlineFeedback tone="warning">
          Limite de {userLimit} usuários ativos atingido para o plano{' '}
          {usage.planName ?? usage.planSlug}.{' '}
          <Link to="/app/assinatura" className="font-semibold underline underline-offset-2">
            Faça upgrade do plano
          </Link>{' '}
          para adicionar mais membros.
        </InlineFeedback>
      )}

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
                        <p className="truncate font-semibold text-foreground">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
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
                        <span className="truncate text-xs text-muted-foreground">
                          {member.profile.displayName}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      {member.profile && (
                        <Button size="sm" variant="outline" className="w-full" asChild>
                          <Link
                            to="/app/equipe/$profileId"
                            params={{ profileId: member.profile.id }}
                          >
                            <User className="h-4 w-4" aria-hidden="true" />
                            Ver perfil
                          </Link>
                        </Button>
                      )}
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
                        Alterar senha
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full"
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
              <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-label="Usuários da clínica">
                    <thead>
                      <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <th scope="col" className="px-4 py-3">Usuário</th>
                        <th scope="col" className="px-4 py-3">Papel</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                        <th scope="col" className="hidden px-4 py-3 md:table-cell">Perfil</th>
                        <th scope="col" className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {members.map((member) => (
                        <tr
                          key={member.id}
                          role="button"
                          tabIndex={0}
                          aria-label={`Editar ${member.firstName} ${member.lastName}`}
                          className="cursor-pointer transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
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
                            <p className="font-semibold text-foreground">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{member.email}</p>
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
                          <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                            {member.profile ? (
                              <span>{member.profile.displayName}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <MemberRowActions
                              member={member}
                              onEdit={() => setEditTarget(member)}
                              onPassword={() =>
                                setPasswordTarget({
                                  id: member.id,
                                  name: `${member.firstName} ${member.lastName}`,
                                })
                              }
                              onDelete={() =>
                                setDeleteTarget({
                                  id: member.id,
                                  name: `${member.firstName} ${member.lastName}`,
                                })
                              }
                            />
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
