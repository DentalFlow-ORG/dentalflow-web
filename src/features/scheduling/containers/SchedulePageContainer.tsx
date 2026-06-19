import { useEffect, useState } from 'react'

import { AlertCircle } from 'lucide-react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { PanelCard } from '@/components/common/PanelCard'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { brazilTodayIso } from '@/lib/brazil-timezone'
import { cn } from '@/lib/utils'

import { AppointmentDrawer } from '../components/appointments/AppointmentDrawer'
import { AppointmentTable } from '../components/appointments/AppointmentTable'
import { AvailabilityManager } from '../components/availability/AvailabilityManager'
import { ExceptionManager } from '../components/availability/ExceptionManager'
import { WeekCalendar } from '../components/calendar/WeekCalendar'
import { MobileAgendaList } from '../components/mobile/MobileAgendaList'
import { MobileAgendaTimeline } from '../components/mobile/MobileAgendaTimeline'
import { ViewToggle } from '../components/shared/ViewToggle'
import { TABS } from '../constants/schedule-tabs'
import { DENTIST_ALLOWED_TRANSITIONS, useSchedulePage } from '../hooks/useSchedulePage'
import { getWeekDates, toDateInputValue } from '../utils/time'

export function SchedulePageContainer() {
  const {
    ownProfile,
    appointments,
    availability,
    setAvailability,
    exceptions,
    setExceptions,
    isBootstrapping,
    error,
    activeTab,
    setActiveTab,
    view,
    setView,
    weekStart,
    setWeekStart,
    drawerAppointment,
    setDrawerAppointment,
    isActionLoading,
    handleStatusChange,
  } = useSchedulePage()

  // Shared mobile selected date — persists across Agenda/Lista view switches
  const [mobileSelectedDate, setMobileSelectedDate] = useState<string>(() => {
    const dates = getWeekDates(weekStart).map(toDateInputValue)
    const today = brazilTodayIso()
    return dates.includes(today) ? today : dates[0]
  })

  useEffect(() => {
    const dates = getWeekDates(weekStart).map(toDateInputValue)
    const today = brazilTodayIso()
    setMobileSelectedDate((prev) =>
      dates.includes(prev) ? prev : dates.includes(today) ? today : dates[0],
    )
  }, [weekStart])

  return (
    <AppPage spacing="loose">
      <AppPageHeader
        eyebrow="Profissional"
        title="Minha agenda"
        description="Visualize seus agendamentos e gerencie sua disponibilidade semanal."
      />

      {error && <InlineFeedback>{error}</InlineFeedback>}

      {isBootstrapping ? (
        <LoadingCard message="Carregando agenda..." />
      ) : !ownProfile ? (
        <InlineFeedback tone="warning">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Perfil não encontrado</p>
              <p className="mt-1">
                Seu usuário não está associado a um perfil profissional nesta clínica. Solicite ao
                responsável pela clínica que vincule seu perfil.
              </p>
            </div>
          </div>
        </InlineFeedback>
      ) : (
        <>
          <div className="border-b border-border">
            <nav
              role="tablist"
              aria-label="Seções da minha agenda"
              className="flex gap-0 overflow-x-auto"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-schedule-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-schedule-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'shrink-0 border-b-2 px-5 py-3 text-sm font-semibold transition-colors',
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'agenda' && (
            <div
              id="panel-schedule-agenda"
              role="tabpanel"
              aria-labelledby="tab-schedule-agenda"
              className="space-y-4"
            >
              {/* Desktop agenda */}
              <div className="hidden md:block">
                {view === 'calendar' ? (
                  <WeekCalendar
                    appointments={appointments}
                    weekStart={weekStart}
                    profileAvailability={availability}
                    profileExceptions={exceptions}
                    toolbarAction={<ViewToggle view={view} onChange={setView} />}
                    onWeekChange={setWeekStart}
                    onAppointmentClick={setDrawerAppointment}
                  />
                ) : (
                  <>
                    <div className="flex justify-end">
                      <ViewToggle view={view} onChange={setView} />
                    </div>
                    <AppointmentTable
                      appointments={appointments}
                      isActionLoading={isActionLoading}
                      allowedTransitions={DENTIST_ALLOWED_TRANSITIONS}
                      emptyDescription="Nenhuma consulta vinculada ao seu perfil."
                      onRowClick={setDrawerAppointment}
                      onStatusChange={handleStatusChange}
                      onCancelRequest={() => {}}
                    />
                  </>
                )}
              </div>

              {/* Mobile agenda — view toggle + timeline or list */}
              <div className="md:hidden space-y-3">
                <div className="flex justify-end">
                  <ViewToggle view={view} onChange={setView} />
                </div>
                {view === 'calendar' ? (
                  <MobileAgendaTimeline
                    appointments={appointments}
                    weekStart={weekStart}
                    isLoading={isBootstrapping}
                    onAppointmentClick={setDrawerAppointment}
                    selectedDate={mobileSelectedDate}
                    onSelectedDateChange={setMobileSelectedDate}
                  />
                ) : (
                  <MobileAgendaList
                    appointments={appointments}
                    weekStart={weekStart}
                    isLoading={isBootstrapping}
                    onAppointmentClick={setDrawerAppointment}
                    selectedDate={mobileSelectedDate}
                    onSelectedDateChange={setMobileSelectedDate}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'disponibilidade' && (
            <div
              id="panel-schedule-disponibilidade"
              role="tabpanel"
              aria-labelledby="tab-schedule-disponibilidade"
              className="space-y-4"
            >
              <div>
                <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Horários de atendimento
                </h3>
                <PanelCard>
                  <AvailabilityManager
                    profileId={ownProfile.id}
                    slots={availability}
                    onSlotsChange={setAvailability}
                  />
                </PanelCard>
              </div>
            </div>
          )}

          {activeTab === 'excecoes' && (
            <div
              id="panel-schedule-excecoes"
              role="tabpanel"
              aria-labelledby="tab-schedule-excecoes"
              className="space-y-4"
            >
              <div>
                <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Exceções de agenda
                </h3>
                <PanelCard>
                  <ExceptionManager
                    profileId={ownProfile.id}
                    exceptions={exceptions}
                    onExceptionsChange={setExceptions}
                  />
                </PanelCard>
              </div>
            </div>
          )}
        </>
      )}

      <AppointmentDrawer
        appointment={drawerAppointment}
        isActionLoading={isActionLoading}
        allowedTransitions={DENTIST_ALLOWED_TRANSITIONS}
        onClose={() => setDrawerAppointment(null)}
        onStatusChange={handleStatusChange}
        onCancelRequest={() => {}}
      />
    </AppPage>
  )
}
