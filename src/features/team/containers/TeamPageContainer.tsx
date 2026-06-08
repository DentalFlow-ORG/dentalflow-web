import {
  ClipboardList,
  Plus,
  Stethoscope,
  Users,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FilteredEmptyState } from '@/components/common/FilteredEmptyState'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { ListPageShell } from '@/components/common/ListPageShell'
import { ListToolbar } from '@/components/common/ListToolbar'
import { Pagination } from '@/components/common/Pagination'
import { AppPage } from '@/components/layout/AppPage'
import { Button } from '@/components/ui/button'
import { HomeDashboardHeader } from '@/features/home/components/HomeDashboardHeader'
import { HomeEmptyState } from '@/features/home/components/HomeEmptyState'
import { HomeKpiCard } from '@/features/home/components/HomeKpiCard'
import { HomeSection } from '@/features/home/components/HomeSection'

import { ClinicMemberFormModal } from '../components/ClinicMemberFormModal'
import { ClinicMemberPasswordModal } from '../components/ClinicMemberPasswordModal'
import { TeamMemberCards } from '../components/TeamMemberCards'
import { TeamMembersTable } from '../components/TeamMembersTable'
import { useTeamPage } from '../hooks/useTeamPage'
import type { MemberListItem, UserLimitUsage } from '../types/team.types'

export type TeamKpis = {
  usageValue: string
  dentistCount: number
  assistantCount: number
  isAtLimit: boolean
}

export function computeTeamKpis(
  members: MemberListItem[],
  usage: UserLimitUsage,
): TeamKpis {
  return {
    usageValue: usage.limit > 0 ? `${usage.used}/${usage.limit}` : String(usage.used),
    dentistCount: members.filter((m) => m.role === 'DENTIST').length,
    assistantCount: members.filter((m) => m.role === 'ASSISTANT').length,
    isAtLimit: usage.remaining <= 0 && usage.limit > 0,
  }
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

  const kpis = computeTeamKpis(allMembers, usage)

  return (
    <AppPage>
      <HomeDashboardHeader
        eyebrow="Gestão"
        title="Equipe"
        description="Gerencie profissionais, assistentes e a capacidade operacional da clínica."
        actions={
          <Button onClick={handleCreateClick} disabled={hasReachedUserLimit}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo usuário
          </Button>
        }
      />

      {hasReachedUserLimit && (
        <InlineFeedback tone="warning">
          Limite de {usage.limit} usuários ativos atingido para o plano{' '}
          {usage.planName ?? usage.planSlug}.{' '}
          <Link to="/app/assinatura" className="font-semibold underline underline-offset-2">
            Faça upgrade do plano
          </Link>{' '}
          para adicionar mais membros.
        </InlineFeedback>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <HomeKpiCard
          label="Usuários ativos"
          value={kpis.usageValue}
          description="Limite do plano"
          icon={Users}
          tone={kpis.isAtLimit ? 'warning' : 'primary'}
          isLoading={isLoading}
        />
        <HomeKpiCard
          label="Profissionais"
          value={String(kpis.dentistCount)}
          icon={Stethoscope}
          tone="info"
          isLoading={isLoading}
        />
        <HomeKpiCard
          label="Assistentes"
          value={String(kpis.assistantCount)}
          icon={ClipboardList}
          tone="neutral"
          isLoading={isLoading}
        />
      </div>

      <HomeSection
        title="Pessoas da equipe"
        description="Acompanhe acessos e status dos membros da clínica."
      >
        <div className="mt-4">
          <ListPageShell
            isLoading={isLoading}
            loadingMessage="Carregando usuários..."
            error={error}
            onRetry={load}
            isEmpty={allMembers.length === 0}
            emptyState={
              <HomeEmptyState
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
                  <TeamMemberCards
                    members={members}
                    onEdit={setEditTarget}
                    onPassword={(member) =>
                      setPasswordTarget({
                        id: member.id,
                        name: `${member.firstName} ${member.lastName}`,
                      })
                    }
                    onDelete={(member) =>
                      setDeleteTarget({
                        id: member.id,
                        name: `${member.firstName} ${member.lastName}`,
                      })
                    }
                  />

                  <TeamMembersTable
                    members={members}
                    onEdit={setEditTarget}
                    onPassword={(member) =>
                      setPasswordTarget({
                        id: member.id,
                        name: `${member.firstName} ${member.lastName}`,
                      })
                    }
                    onDelete={(member) =>
                      setDeleteTarget({
                        id: member.id,
                        name: `${member.firstName} ${member.lastName}`,
                      })
                    }
                  />

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
        </div>
      </HomeSection>

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
