import { ListPageShell } from '@/components/common/ListPageShell'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'

import { AppointmentDrawer } from '../components/appointments/AppointmentDrawer'
import { AppointmentTable } from '../components/appointments/AppointmentTable'
import { CancelAppointmentDialog } from '../components/appointments/CancelAppointmentDialog'
import { CreateAppointmentModal } from '../components/appointments/CreateAppointmentModal'
import { EditAppointmentModal } from '../components/appointments/EditAppointmentModal'
import { WeekCalendar } from '../components/calendar/WeekCalendar'
import { SchedulingKpiCards } from '../components/SchedulingKpiCards'
import { SchedulingToolbar } from '../components/SchedulingToolbar'
import { MobileAgendaList } from '../components/mobile/MobileAgendaList'
import { useAppointmentsPage } from '../hooks/useAppointmentsPage'

export function AppointmentsPageContainer() {
  const {
    allAppointments,
    appointments,
    isLoading,
    error,
    view,
    setView,
    drawerAppointment,
    setDrawerAppointment,
    editTarget,
    setEditTarget,
    cancelTarget,
    setCancelTarget,
    isActionLoading,
    isCreating,
    setIsCreating,
    weekStart,
    setWeekStart,
    calendarAvailability,
    googleCalendar,
    isCalendarActionLoading,
    canManageGoogleCalendar,
    isDentistGoogleCalendarLocked,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setFilter,
    clearAll,
    filteredCount,
    filterDefs,
    handleCreated,
    handleUpdated,
    handleStatusChange,
    handleCancelRequest,
    handleCancelConfirm,
    handleEdit,
    handleConnectGoogleCalendar,
    handleSyncGoogleCalendar,
    handleDisconnectGoogleCalendar,
  } = useAppointmentsPage()

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Agenda"
        title="Agendamentos"
        description="Gerencie as consultas da clínica, acompanhe status e registre novos atendimentos."
      />

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando agendamentos..."
        error={error}
      >
        <div className="space-y-4">
          {/* KPI cards — today at a glance */}
          <SchedulingKpiCards appointments={allAppointments} />

          {/* Toolbar — search, filters, view toggle, actions */}
          <SchedulingToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilters={activeFilters}
            filterDefs={filterDefs}
            onFilterChange={setFilter}
            onClearAll={clearAll}
            filteredCount={filteredCount}
            totalCount={allAppointments.length}
            view={view}
            onViewChange={setView}
            onNewAppointment={() => setIsCreating(true)}
            googleCalendar={googleCalendar}
            canManageGoogleCalendar={canManageGoogleCalendar}
            isDentistGoogleCalendarLocked={isDentistGoogleCalendarLocked}
            isCalendarActionLoading={isCalendarActionLoading}
            onConnectGoogleCalendar={handleConnectGoogleCalendar}
            onSyncGoogleCalendar={handleSyncGoogleCalendar}
            onDisconnectGoogleCalendar={handleDisconnectGoogleCalendar}
          />

          {/* Desktop workspace */}
          <div className="hidden md:block">
            {view === 'calendar' ? (
              <WeekCalendar
                appointments={appointments}
                weekStart={weekStart}
                profileAvailability={calendarAvailability}
                onWeekChange={setWeekStart}
                onAppointmentClick={setDrawerAppointment}
              />
            ) : (
              <AppointmentTable
                appointments={appointments}
                isActionLoading={isActionLoading}
                onRowClick={setDrawerAppointment}
                onStatusChange={handleStatusChange}
                onCancelRequest={handleCancelRequest}
              />
            )}
          </div>

          {/* Mobile workspace — intentionally designed day-list view */}
          <div className="md:hidden">
            <MobileAgendaList
              appointments={appointments}
              weekStart={weekStart}
              onAppointmentClick={setDrawerAppointment}
              canCreate
              onCreateAppointment={() => setIsCreating(true)}
            />
          </div>
        </div>
      </ListPageShell>

      <AppointmentDrawer
        appointment={drawerAppointment}
        isActionLoading={isActionLoading}
        onClose={() => setDrawerAppointment(null)}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
        onCancelRequest={handleCancelRequest}
      />

      <CancelAppointmentDialog
        open={!!cancelTarget}
        patientName={cancelTarget?.patientName ?? ''}
        isCanceling={isActionLoading}
        onCancel={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
      />

      <EditAppointmentModal
        appointment={editTarget}
        onClose={() => setEditTarget(null)}
        onUpdated={handleUpdated}
      />

      <CreateAppointmentModal
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onCreated={handleCreated}
      />
    </AppPage>
  )
}
