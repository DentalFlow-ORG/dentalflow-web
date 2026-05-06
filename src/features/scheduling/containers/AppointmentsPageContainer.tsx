import { CalendarCheck, Link2Off, Loader2, Plus, RefreshCw } from 'lucide-react'

import { ListPageShell } from '@/components/common/ListPageShell'
import { ListToolbar } from '@/components/common/ListToolbar'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'

import { AppointmentDrawer } from '../components/appointments/AppointmentDrawer'
import { AppointmentTable } from '../components/appointments/AppointmentTable'
import { CancelAppointmentDialog } from '../components/appointments/CancelAppointmentDialog'
import { CreateAppointmentModal } from '../components/appointments/CreateAppointmentModal'
import { EditAppointmentModal } from '../components/appointments/EditAppointmentModal'
import { WeekCalendar } from '../components/calendar/WeekCalendar'
import { ViewToggle } from '../components/shared/ViewToggle'
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
        action={
          <div className="flex flex-wrap justify-end gap-2">
            {canManageGoogleCalendar && googleCalendar?.connected ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSyncGoogleCalendar}
                  disabled={isCalendarActionLoading}
                  title={googleCalendar.calendarSummary ?? 'Google Agenda conectado'}
                >
                  {isCalendarActionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Sincronizar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDisconnectGoogleCalendar}
                  disabled={isCalendarActionLoading}
                >
                  <Link2Off className="h-4 w-4" />
                  Desconectar
                </Button>
              </>
            ) : canManageGoogleCalendar ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleConnectGoogleCalendar}
                disabled={isCalendarActionLoading}
              >
                {isCalendarActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CalendarCheck className="h-4 w-4" />
                )}
                Google Agenda
              </Button>
            ) : null}
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4" />
              Novo agendamento
            </Button>
          </div>
        }
      />

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando agendamentos..."
        error={error}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <ListToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Pesquisar por paciente, e-mail ou telefone..."
                filterDefs={filterDefs}
                activeFilters={activeFilters}
                onFilterChange={setFilter}
                onClearAll={clearAll}
                filteredCount={filteredCount}
                totalCount={allAppointments.length}
              />
            </div>
            <ViewToggle view={view} onChange={setView} />
          </div>

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
