import { Link } from '@tanstack/react-router'
import { ClipboardList, Plus, Stethoscope, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { FilteredEmptyState } from '@/components/common/FilteredEmptyState'
import type { FilterDef } from '@/components/common/ListToolbar'
import { ListToolbar } from '@/components/common/ListToolbar'
import { ListPageShell } from '@/components/common/ListPageShell'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useListFilter } from '@/hooks/useListFilter'

import { listClinicMembers } from '../services/team.service'
import type { MemberListItem } from '../types/team.types'

const PAGE_SIZE = 10

const ROLE_LABEL: Record<string, string> = {
  DENTIST: 'Profissional',
  ASSISTANT: 'Assistente',
}

const ROLE_ICON: Record<string, React.ElementType> = {
  DENTIST: Stethoscope,
  ASSISTANT: ClipboardList,
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

const SEARCH_FN = (m: MemberListItem, q: string) =>
  `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(q)

const FILTER_FNS = {
  role: (m: MemberListItem, v: string) => m.role === v,
  status: (m: MemberListItem, v: string) => (v === 'active' ? m.isActive : !m.isActive),
}

export function TeamPage() {
  const { showAlert } = useGlobalAlerts()
  const [allMembers, setAllMembers] = useState<MemberListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    searchQuery, setSearchQuery,
    activeFilters, setFilter, clearAll,
    page, setPage,
    totalPages,
    filteredCount,
    paginatedData: members,
  } = useListFilter<MemberListItem>(allMembers, {
    searchFn: SEARCH_FN,
    filterFns: FILTER_FNS,
    pageSize: PAGE_SIZE,
  })

  useEffect(() => {
    listClinicMembers()
      .then(setAllMembers)
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Não foi possível carregar a equipe.'
        setError(msg)
        showAlert({ title: 'Erro ao carregar equipe', description: msg, tone: 'error' })
      })
      .finally(() => setIsLoading(false))
  }, [showAlert])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AppPageHeader
        eyebrow="Equipe"
        title="Membros da clínica"
        description="Gerencie profissionais e assistentes cadastrados na sua clínica."
        action={
          <Button asChild>
            <Link to="/app/equipe/novo">
              <Plus className="h-4 w-4" />
              Adicionar membro
            </Link>
          </Button>
        }
      />

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando membros..."
        error={error}
        isEmpty={allMembers.length === 0}
        emptyState={
          <EmptyState
            icon={Users}
            title="Nenhum membro cadastrado"
            description="Adicione profissionais e assistentes para gerenciar a equipe da clínica."
            action={
              <Button asChild>
                <Link to="/app/equipe/novo">
                  <Plus className="h-4 w-4" />
                  Adicionar membro
                </Link>
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
              <div className="grid gap-3">
                {members.map((member) => {
                  const RoleIcon = ROLE_ICON[member.role] ?? Users
                  return (
                    <PanelCard key={member.id}>
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <RoleIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">
                              {member.firstName} {member.lastName}
                            </p>
                            <StatusBadge tone={member.isActive ? 'success' : 'muted'}>
                              {member.isActive ? 'Ativo' : 'Inativo'}
                            </StatusBadge>
                            <StatusBadge tone="muted">
                              {ROLE_LABEL[member.role] ?? member.role}
                            </StatusBadge>
                          </div>
                          <p className="mt-0.5 truncate text-sm text-slate-500">{member.email}</p>
                          {member.profile && (
                            <p className="mt-0.5 text-xs text-slate-400">
                              {member.profile.displayName}
                              {member.profile.slug ? ` · /${member.profile.slug}` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </PanelCard>
                  )
                })}
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
    </div>
  )
}