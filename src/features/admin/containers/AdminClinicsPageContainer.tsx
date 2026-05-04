import { Building2, Pencil, Plus, Trash2 } from 'lucide-react'

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

import { ClinicFormModal } from '../components/ClinicFormModal'
import { useAdminClinicsPage } from '../hooks/useAdminClinicsPage'

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

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Administração"
        title="Clínicas da plataforma"
        description="Gerencie os tenants da plataforma e mantenha a base de clínicas organizada."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova clínica
          </Button>
        }
      />

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando clínicas..."
        error={loadError}
        onRetry={load}
        isEmpty={allClinics.length === 0}
        emptyState={
          <EmptyState
            icon={Building2}
            title="Nenhuma clínica encontrada"
            description="Adicione a primeira clínica da plataforma."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
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
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">Clínica</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Criada em</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clinics.map((clinic) => {
                      const isActive = clinic.isActive !== false

                      return (
                        <tr
                          key={clinic.id}
                          className="cursor-pointer transition-colors hover:bg-slate-50/60"
                          onClick={() => setEditTarget(clinic)}
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{clinic.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{clinic.id}</p>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge tone={isActive ? 'success' : 'muted'}>
                              {isActive ? 'Ativa' : 'Inativa'}
                            </StatusBadge>
                          </td>
                          <td className="hidden px-4 py-3 text-xs text-slate-500 lg:table-cell">
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
                                title="Editar"
                                onClick={() => setEditTarget(clinic)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                title="Excluir"
                                className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                onClick={() =>
                                  setDeleteTarget({ id: clinic.id, name: clinic.name })
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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
