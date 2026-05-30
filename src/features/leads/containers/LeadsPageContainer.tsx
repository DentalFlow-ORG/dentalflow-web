import { Plus, Search, UserPlus } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { FilteredEmptyState } from '@/components/common/FilteredEmptyState'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useLeadsPage } from '../hooks/useLeadsPage'
import { LeadDrawer } from '../components/LeadDrawer'
import { LeadFunnelPanel } from '../components/LeadFunnelPanel'
import { LeadsFilters } from '../components/LeadsFilters'
import { LeadSummaryCards } from '../components/LeadSummaryCards'
import { LeadsTable } from '../components/LeadsTable'
import type { LeadStatus } from '../types/leads.types'

export function LeadsPageContainer() {
  const {
    leads,
    total,
    summary,
    isLoading,
    isLoadingSummary,
    filters,
    hasActiveFilters,
    members,
    isLoadingMembers,
    drawerMode,
    selectedLead,
    activities,
    isLoadingActivities,
    isSaving,
    handleFiltersChange,
    clearFilters,
    openCreate,
    openView,
    openEdit,
    closeDrawer,
    handleSave,
    handleStatusChange,
    handleConvert,
    handleAddNote,
    handleAddContact,
    handleArchive,
  } = useLeadsPage()

  const isEmpty = !isLoading && leads.length === 0 && !hasActiveFilters

  return (
    <AppPage>
      <AppPageHeader
        title="Leads"
        description="Acompanhe oportunidades e transforme contatos em consultas."
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Novo lead
          </Button>
        }
      />

      <div className="mt-6 space-y-5">
        <LeadSummaryCards
          summary={summary}
          isLoading={isLoadingSummary}
          activeStatus={filters.status || undefined}
          onCardClick={(status?: LeadStatus) =>
            handleFiltersChange({ status: status ?? '', page: 1 })
          }
        />

        <LeadFunnelPanel summary={summary} />

        <LeadsFilters
          filters={filters}
          onChange={handleFiltersChange}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
          members={members}
          isLoadingMembers={isLoadingMembers}
        />

        {isEmpty ? (
          <EmptyState
            icon={UserPlus}
            title="Nenhum lead cadastrado"
            description="Comece adicionando o primeiro lead para acompanhar oportunidades."
            action={
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Novo lead
              </Button>
            }
          />
        ) : !isLoading && leads.length === 0 && hasActiveFilters ? (
          <FilteredEmptyState icon={Search} onClear={clearFilters} />
        ) : (
          <LeadsTable
            leads={leads}
            total={total}
            isLoading={isLoading}
            page={filters.page}
            limit={filters.limit}
            onPageChange={(page) => handleFiltersChange({ page })}
            onView={openView}
            onEdit={openEdit}
            onArchive={handleArchive}
          />
        )}
      </div>

      {drawerMode && (
        <LeadDrawer
          mode={drawerMode}
          lead={selectedLead}
          activities={activities}
          isLoadingActivities={isLoadingActivities}
          isSaving={isSaving}
          members={members}
          isLoadingMembers={isLoadingMembers}
          onClose={closeDrawer}
          onSave={handleSave}
          onEdit={openEdit}
          onStatusChange={handleStatusChange}
          onConvert={handleConvert}
          onAddNote={handleAddNote}
          onAddContact={handleAddContact}
        />
      )}
    </AppPage>
  )
}
