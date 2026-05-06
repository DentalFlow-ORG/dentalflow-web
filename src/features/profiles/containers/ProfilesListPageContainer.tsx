import { Link } from '@tanstack/react-router'
import { ExternalLink, Plus, Stethoscope } from 'lucide-react'

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

import { useProfilesList } from '../hooks/useProfilesList'

export function ProfilesListPageContainer() {
  const {
    profiles,
    allProfiles,
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
  } = useProfilesList()

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Perfis profissionais"
        title="Páginas públicas da clínica"
        description="Cadastre profissionais, organize dados de contato e publique páginas com serviços para captação de pacientes."
        action={
          <Button asChild>
            <Link to="/app/perfis/novo">
              <Plus className="h-4 w-4" />
              Novo perfil
            </Link>
          </Button>
        }
      />

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando perfis..."
        error={error}
        isEmpty={allProfiles.length === 0}
        emptyState={
          <EmptyState
            icon={Stethoscope}
            title="Nenhum perfil criado"
            description="Crie o primeiro perfil profissional para começar a montar a presença pública da clínica."
            action={
              <Button asChild>
                <Link to="/app/perfis/novo">
                  <Plus className="h-4 w-4" />
                  Criar perfil
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
            searchPlaceholder="Pesquisar por nome, slug ou cidade..."
            filterDefs={filterDefs}
            activeFilters={activeFilters}
            onFilterChange={setFilter}
            onClearAll={clearAll}
            filteredCount={filteredCount}
            totalCount={allProfiles.length}
          />

          {filteredCount === 0 ? (
            <FilteredEmptyState icon={Stethoscope} onClear={clearAll} />
          ) : (
            <>
              <div className="grid gap-4">
                {profiles.map((profile) => (
                  <PanelCard key={profile.id}>
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-semibold text-slate-950">
                            {profile.displayName}
                          </h2>
                          <StatusBadge tone={profile.isPublished ? 'success' : 'muted'}>
                            {profile.isPublished ? 'Publicado' : 'Rascunho'}
                          </StatusBadge>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          /p/{profile.slug}
                          {profile.city || profile.state
                            ? ` - ${[profile.city, profile.state].filter(Boolean).join(' - ')}`
                            : ''}
                        </p>
                        <p className="mt-3 text-sm font-medium text-slate-600">
                          {profile.viewsCount} visualizações
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {profile.isPublished && (
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/p/$slug" params={{ slug: profile.slug }}>
                              <ExternalLink className="h-4 w-4" />
                              Ver público
                            </Link>
                          </Button>
                        )}
                        <Button size="sm" asChild>
                          <Link
                            to="/app/perfis/$profileId"
                            params={{ profileId: profile.id }}
                          >
                            Gerenciar
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </PanelCard>
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                filteredCount={filteredCount}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </ListPageShell>
    </AppPage>
  )
}
