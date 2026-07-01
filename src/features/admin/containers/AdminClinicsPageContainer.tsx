import { Building2, CheckCircle2, Pencil, Plus, Trash2, XCircle } from 'lucide-react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FilteredEmptyState } from '@/components/common/FilteredEmptyState'
import { ListPageShell } from '@/components/common/ListPageShell'
import { ListToolbar } from '@/components/common/ListToolbar'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPage } from '@/components/layout/AppPage'
import { Button } from '@/components/ui/button'
import { HomeDashboardHeader } from '@/features/home/components/HomeDashboardHeader'
import { HomeEmptyState } from '@/features/home/components/HomeEmptyState'
import { HomeKpiCard } from '@/features/home/components/HomeKpiCard'
import { HomeSection } from '@/features/home/components/HomeSection'

import { ClinicFormModal } from '../components/ClinicFormModal'
import { ClinicHealthSection } from '../components/ClinicHealthSection'
import { useAdminClinicsPage } from '../hooks/useAdminClinicsPage'
import { useClinicsHealth } from '../hooks/useClinicsHealth'
import type { AdminClinic } from '../types/admin.types'

type AdminClinicMobileCardProps = {
  clinic: AdminClinic
  formatDate: (value?: string) => string
  onEdit: (clinic: AdminClinic) => void
  onDelete: (target: { id: string; name: string }) => void
}

function AdminClinicMobileCard({
  clinic,
  formatDate,
  onEdit,
  onDelete,
}: AdminClinicMobileCardProps) {
  const isActive = clinic.isActive !== false

  return (
    <PanelCard className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">{clinic.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Clínica da plataforma</p>
          </div>
          <StatusBadge tone={isActive ? 'success' : 'muted'}>
            {isActive ? 'Ativa' : 'Inativa'}
          </StatusBadge>
        </div>

        <dl className="grid gap-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between gap-3">
            <dt className="font-medium text-muted-foreground">Status</dt>
            <dd className="text-right text-foreground">{isActive ? 'Ativa' : 'Inativa'}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="font-medium text-muted-foreground">Criada em</dt>
            <dd className="text-right text-foreground">{formatDate(clinic.createdAt)}</dd>
          </div>
        </dl>

        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
          <Button variant="outline" className="w-full" onClick={() => onEdit(clinic)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Editar
          </Button>
          <Button
            variant="ghost"
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
            onClick={() => onDelete({ id: clinic.id, name: clinic.name })}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Excluir
          </Button>
        </div>
      </div>
    </PanelCard>
  )
}

export function AdminClinicsPageContainer() {
  const {
    clinics,
    allClinics,
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
    formatDate,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    load,
    handleCreateSuccess,
    handleEditSuccess,
    handleDeleteConfirm,
  } = useAdminClinicsPage()

  const {
    rows: healthRows,
    isLoading: isHealthLoading,
    loadError: healthLoadError,
    load: reloadHealth,
  } = useClinicsHealth()

  return (
    <AppPage spacing="loose">
      <HomeDashboardHeader
        eyebrow="Administração"
        title="Clínicas da plataforma"
        description="Gerencie os tenants da plataforma e mantenha a base de clínicas organizada."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova clínica
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <HomeKpiCard
          label="Total clínicas"
          value={String(allClinics.length)}
          icon={Building2}
          tone="primary"
          isLoading={isLoading}
        />
        <HomeKpiCard
          label="Ativas"
          value={String(allClinics.filter((clinic) => clinic.isActive !== false).length)}
          icon={CheckCircle2}
          tone="success"
          isLoading={isLoading}
        />
        <HomeKpiCard
          label="Inativas"
          value={String(allClinics.filter((clinic) => clinic.isActive === false).length)}
          icon={XCircle}
          tone="warning"
          isLoading={isLoading}
        />
      </div>

      <HomeSection
        title="Clínicas cadastradas"
        description="Pesquise e filtre as clínicas da plataforma."
      >
        <ListPageShell
          isLoading={isLoading}
          loadingMessage="Carregando clínicas..."
          error={loadError}
          onRetry={load}
          isEmpty={allClinics.length === 0}
          emptyState={
            <HomeEmptyState
              icon={Building2}
              title="Nenhuma clínica encontrada"
              description="Adicione a primeira clínica da plataforma."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Nova clínica
                </Button>
              }
            />
          }
        >
          <div className="space-y-4">
            <ListToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Pesquisar por nome da clínica..."
              filterDefs={filterDefs}
              activeFilters={activeFilters}
              onFilterChange={setFilter}
              onClearAll={clearAll}
              filteredCount={filteredCount}
              totalCount={allClinics.length}
            />

            {filteredCount === 0 ? (
              <FilteredEmptyState icon={Building2} onClear={clearAll} />
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                  <div className="space-y-3 p-3 md:hidden">
                    {clinics.map((clinic) => (
                      <AdminClinicMobileCard
                        key={clinic.id}
                        clinic={clinic}
                        formatDate={formatDate}
                        onEdit={setEditTarget}
                        onDelete={setDeleteTarget}
                      />
                    ))}
                  </div>

                  <div className="hidden md:block">
                    <table className="w-full text-sm" aria-label="Clínicas da plataforma">
                      <thead>
                        <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <th scope="col" className="px-4 py-3">
                            Clínica
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Status
                          </th>
                          <th scope="col" className="hidden px-4 py-3 lg:table-cell">
                            Criada em
                          </th>
                          <th scope="col" className="px-4 py-3 text-right">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {clinics.map((clinic) => {
                          const isActive = clinic.isActive !== false

                          return (
                            <tr
                              key={clinic.id}
                              role="button"
                              tabIndex={0}
                              aria-label={`Editar ${clinic.name}`}
                              className="cursor-pointer transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                              onClick={() => setEditTarget(clinic)}
                              onKeyDown={(event) => {
                                if (event.target !== event.currentTarget) return
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault()
                                  setEditTarget(clinic)
                                }
                              }}
                            >
                              <td className="px-4 py-3">
                                <p className="font-semibold text-foreground">{clinic.name}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  Criada em {formatDate(clinic.createdAt)}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge tone={isActive ? 'success' : 'muted'}>
                                  {isActive ? 'Ativa' : 'Inativa'}
                                </StatusBadge>
                              </td>
                              <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                                {formatDate(clinic.createdAt)}
                              </td>
                              <td className="px-4 py-3">
                                <div
                                  className="flex items-center justify-end gap-1"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    aria-label={`Editar ${clinic.name}`}
                                    title="Editar"
                                    onClick={() => setEditTarget(clinic)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                  </Button>
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    aria-label={`Excluir ${clinic.name}`}
                                    title="Excluir"
                                    className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
                                    onClick={() =>
                                      setDeleteTarget({ id: clinic.id, name: clinic.name })
                                    }
                                  >
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
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
                  onPageSizeChange={setPageSize}
                />
              </div>
            )}
          </div>
        </ListPageShell>
      </HomeSection>

      <ClinicHealthSection
        rows={healthRows}
        isLoading={isHealthLoading}
        loadError={healthLoadError}
        onRetry={reloadHealth}
      />

      <ClinicFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <ClinicFormModal
        open={Boolean(editTarget)}
        initialData={editTarget ?? undefined}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEditSuccess}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        tone="destructive"
        title="Excluir clínica?"
        subject={deleteTarget?.name}
        description="A clínica será removida da área administrativa. Esta ação pode afetar usuários, perfis e agendamentos vinculados, conforme as regras do backend."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isConfirming={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppPage>
  )
}
