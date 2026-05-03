import { Building2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { FilteredEmptyState } from '@/components/common/FilteredEmptyState'
import { ListPageShell } from '@/components/common/ListPageShell'
import { ListToolbar, type FilterDef } from '@/components/common/ListToolbar'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useListFilter } from '@/hooks/useListFilter'

import { ClinicFormModal } from '../components/ClinicFormModal'
import {
  deleteAdminClinic,
  listAdminClinicsPage,
} from '../services/admin-clinics.service'
import type { AdminClinic } from '../types/admin.types'

const DEFAULT_PAGE_SIZE = 10

type DeleteTarget = {
  id: string
  name: string
}

const SEARCH_FN = (clinic: AdminClinic, query: string) =>
  clinic.name.toLowerCase().includes(query)

const FILTER_FNS = {
  status: (clinic: AdminClinic, value: string) => {
    const isActive = clinic.isActive !== false
    return value === 'active' ? isActive : !isActive
  },
}

const FILTER_DEFS: FilterDef[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Ativa' },
      { value: 'inactive', label: 'Inativa' },
    ],
  },
]

function formatDate(iso?: string) {
  if (!iso) return '—'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))
}

export function AdminClinicsPage() {
  const { showAlert } = useGlobalAlerts()
  const [allClinics, setAllClinics] = useState<AdminClinic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminClinic | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const {
    searchQuery,
    setSearchQuery,
    activeFilters,
    setFilter,
    clearAll,
    page,
    setPage,
    totalPages,
    filteredCount,
    paginatedData: clinics,
  } = useListFilter<AdminClinic>(allClinics, {
    searchFn: SEARCH_FN,
    filterFns: FILTER_FNS,
    pageSize,
  })

  function load() {
    setIsLoading(true)
    setLoadError(null)
    listAdminClinicsPage(1, 500)
      .then((response) => setAllClinics(response.data))
      .catch((err) => {
        const msg =
          err instanceof Error ? err.message : 'Não foi possível carregar as clínicas.'
        setLoadError(msg)
        showAlert({ title: 'Erro ao carregar clínicas', description: msg, tone: 'error' })
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleCreateSuccess(clinic: AdminClinic) {
    setCreateOpen(false)
    showAlert({
      title: 'Clínica criada',
      description: `${clinic.name} foi adicionada com sucesso.`,
      tone: 'success',
    })
    load()
  }

  function handleEditSuccess(clinic: AdminClinic) {
    setEditTarget(null)
    showAlert({
      title: 'Clínica atualizada',
      description: `Dados de ${clinic.name} salvos.`,
      tone: 'success',
    })
    setAllClinics((prev) => prev.map((item) => (item.id === clinic.id ? clinic : item)))
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteAdminClinic(deleteTarget.id)
      showAlert({
        title: 'Clínica removida',
        description: `${deleteTarget.name} foi removida da listagem administrativa.`,
        tone: 'success',
      })
      setDeleteTarget(null)
      setAllClinics((prev) => prev.filter((clinic) => clinic.id !== deleteTarget.id))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir clínica.'
      showAlert({ title: 'Erro ao excluir', description: msg, tone: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

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
            filterDefs={FILTER_DEFS}
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
                                  setDeleteTarget({
                                    id: clinic.id,
                                    name: clinic.name,
                                  })
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
