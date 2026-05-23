import { useState } from 'react'
import { AlertCircle, CalendarDays, ChevronRight, RefreshCw, Users2, X } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Dialog } from 'radix-ui'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { EmptyState } from '@/components/common/EmptyState'
import { FormField, TextInput } from '@/components/common/FormField'
import { ListPageShell } from '@/components/common/ListPageShell'
import { MetricCard } from '@/components/common/MetricCard'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ClinicalTimeline } from '@/features/clinical-records/components/ClinicalTimeline'
import { usePatientClinicalTimeline } from '@/features/clinical-records/hooks/usePatientClinicalTimeline'

import { formatDateBR, safeFormatTimeBR } from '@/lib/date-time-formatters'

import { usePatientHistory } from '../hooks/usePatientHistory'
import { usePatientsPage } from '../hooks/usePatientsPage'
import type { PatientAppointment, PatientSummary } from '../types/patients.types'

const formatDate = formatDateBR
const formatTime = (t: string | null | undefined) => safeFormatTimeBR(t)

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
}

type BadgeTone = 'success' | 'warning' | 'muted'

const STATUS_TONE: Record<string, BadgeTone> = {
  COMPLETED: 'success',
  PENDING: 'warning',
  CONFIRMED: 'warning',
  CANCELED: 'muted',
  NO_SHOW: 'muted',
}

function KpiGrid({ patients }: { patients: PatientSummary[] }) {
  const totalPatients = patients.length
  const totalAppointments = patients.reduce(
    (total, patient) => total + patient.totalAppointments,
    0,
  )
  const totalCompleted = patients.reduce(
    (total, patient) => total + patient.completedAppointments,
    0,
  )
  const completionRate =
    totalAppointments > 0
      ? ((totalCompleted / totalAppointments) * 100).toFixed(1)
      : '0.0'
  const avgPerPatient =
    totalPatients > 0 ? (totalAppointments / totalPatients).toFixed(1) : '0.0'

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard value={String(totalPatients)} label="Pacientes cadastrados" />
      <MetricCard value={String(totalAppointments)} label="Consultas no total" />
      <MetricCard value={`${completionRate}%`} label="Taxa de conclusão" />
      <MetricCard value={avgPerPatient} label="Consultas por paciente" />
    </div>
  )
}

function AppointmentRow({ appt }: { appt: PatientAppointment }) {
  const tone: BadgeTone = STATUS_TONE[appt.status] ?? 'muted'

  return (
    <div className="rounded-lg border border-border bg-muted px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {appt.service?.name ?? 'Consulta'}
          </p>
          {appt.profile && (
            <p className="mt-0.5 text-xs text-muted-foreground">{appt.profile.displayName}</p>
          )}
        </div>
        <StatusBadge tone={tone}>{STATUS_LABEL[appt.status] ?? appt.status}</StatusBadge>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          {formatDate(appt.appointmentDate)} · {formatTime(appt.startTime)}–
          {formatTime(appt.endTime)}
        </span>
      </div>
      {appt.notes && (
        <p className="mt-1.5 text-xs italic text-muted-foreground/70">{appt.notes}</p>
      )}
    </div>
  )
}

function PatientMobileCard({
  patient,
  onOpenDetails,
}: {
  patient: PatientSummary
  onOpenDetails: (patient: PatientSummary) => void
}) {
  const hasContact = Boolean(patient.patientPhone || patient.patientEmail)
  const completionSummary =
    patient.totalAppointments > 0
      ? `${patient.completedAppointments} de ${patient.totalAppointments} consultas concluídas`
      : 'Nenhuma consulta registrada'

  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {patient.patientName}
          </h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {patient.lastVisit
              ? `Última visita em ${formatDate(patient.lastVisit)}`
              : 'Sem visita registrada'}
          </p>
        </div>
        <StatusBadge tone={patient.totalAppointments > 0 ? 'success' : 'muted'}>
          {patient.totalAppointments} consulta{patient.totalAppointments !== 1 ? 's' : ''}
        </StatusBadge>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-foreground">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contato</p>
          {hasContact ? (
            <div className="mt-1 space-y-0.5">
              {patient.patientPhone && <p>{patient.patientPhone}</p>}
              {patient.patientEmail && <p className="break-words">{patient.patientEmail}</p>}
            </div>
          ) : (
            <p className="mt-1 text-muted-foreground">Sem contato cadastrado</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="muted">{completionSummary}</StatusBadge>
          {patient.canceledAppointments > 0 && (
            <StatusBadge tone="warning">
              {patient.canceledAppointments} cancelada
              {patient.canceledAppointments !== 1 ? 's' : ''}
            </StatusBadge>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 w-full"
        onClick={() => onOpenDetails(patient)}
      >
        Ver detalhes do paciente
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </article>
  )
}

type PanelTab = 'consultas' | 'prontuarios'

function PatientDetailPanel({
  patient,
  onClose,
}: {
  patient: PatientSummary | null
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<PanelTab>('consultas')
  const { user } = useAuth()
  const canViewClinicalTimeline = user?.role === 'OWNER' || user?.role === 'DENTIST'
  const { appointments, isLoading } = usePatientHistory(patient)
  const { records: clinicalRecords, isLoading: isLoadingTimeline } = usePatientClinicalTimeline(
    canViewClinicalTimeline ? patient?.identifier ?? null : null,
  )

  return (
    <Dialog.Root open={!!patient} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-card shadow-xl focus:outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between border-b border-border px-6 py-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-foreground">
                {patient?.patientName}
              </Dialog.Title>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {patient?.patientEmail ?? patient?.patientPhone ?? 'Sem contato'}
              </p>
            </div>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Fechar painel do paciente"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          {patient && (
            <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-muted">
              <div className="px-4 py-3 text-center">
                <p className="text-xl font-bold text-foreground">
                  {patient.totalAppointments}
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-xl font-bold text-emerald-600">
                  {patient.completedAppointments}
                </p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-xl font-bold text-red-500">
                  {patient.canceledAppointments}
                </p>
                <p className="text-xs text-muted-foreground">Canceladas</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div role="tablist" aria-label="Informações do paciente" className="flex border-b border-border">
            {([
              { id: 'consultas', label: 'Consultas' },
              { id: 'prontuarios', label: 'Prontuários' },
            ] as { id: PanelTab; label: string }[]).map((tab) => (
              <button
                key={tab.id}
                id={`tab-patient-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-patient-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {activeTab === 'consultas' && (
              <div id="panel-patient-consultas" role="tabpanel" aria-labelledby="tab-patient-consultas">
                <ListPageShell
                  isLoading={isLoading}
                  loadingMessage="Carregando histórico…"
                  isEmpty={!isLoading && appointments.length === 0}
                  emptyState={
                    <p className="text-sm text-muted-foreground">Nenhuma consulta encontrada.</p>
                  }
                >
                  <div className="space-y-3">
                    {appointments.map((appt) => (
                      <AppointmentRow key={appt.id} appt={appt} />
                    ))}
                  </div>
                </ListPageShell>
              </div>
            )}

            {activeTab === 'prontuarios' && (
              <div id="panel-patient-prontuarios" role="tabpanel" aria-labelledby="tab-patient-prontuarios">
                {canViewClinicalTimeline ? (
                  <ListPageShell
                    isLoading={isLoadingTimeline}
                    loadingMessage="Carregando prontuários…"
                    isEmpty={!isLoadingTimeline && clinicalRecords.length === 0}
                    emptyState={
                      <p className="text-sm text-muted-foreground">Nenhum prontuário encontrado.</p>
                    }
                  >
                    <ClinicalTimeline records={clinicalRecords} />
                  </ListPageShell>
                ) : (
                  <div className="rounded-lg border border-border bg-muted px-4 py-5">
                    <p className="text-sm font-medium text-foreground">
                      Informações clínicas restritas ao proprietário e dentistas.
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      O histórico administrativo de consultas continua disponível nesta tela.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function PatientsPageContainer() {
  const {
    patients,
    filteredPatients,
    paginatedPatients,
    isLoading,
    error,
    search,
    dateFrom,
    dateTo,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    selectedPatient,
    setSelectedPatient,
    hasFilters,
    handleSearchChange,
    handleDateFromChange,
    handleDateToChange,
    handleRefresh,
  } = usePatientsPage()

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Clínica"
        title="Pacientes"
        description="Lista de pacientes com base no histórico de consultas."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/app/pacientes/atencao">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                Atenção
              </Link>
            </Button>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Atualizar
            </Button>
          </div>
        }
      />

      <PanelCard className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Buscar paciente" htmlFor="patientSearch" className="lg:col-span-2">
            <TextInput
              id="patientSearch"
              placeholder="Nome ou e-mail…"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </FormField>
          <FormField label="Última visita — de" htmlFor="patientFrom">
            <DatePickerInput
              id="patientFrom"
              value={dateFrom}
              placeholder="DD/MM/AAAA"
              onValueChange={handleDateFromChange}
            />
          </FormField>
          <FormField label="Última visita — até" htmlFor="patientTo">
            <DatePickerInput
              id="patientTo"
              value={dateTo}
              placeholder="DD/MM/AAAA"
              minValue={dateFrom}
              onValueChange={handleDateToChange}
            />
          </FormField>
        </div>
      </PanelCard>

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando pacientes…"
        error={error}
        onRetry={handleRefresh}
        isEmpty={patients.length === 0}
        emptyState={
          <EmptyState
            icon={Users2}
            title="Nenhum paciente registrado"
            description="Os pacientes aparecem aqui a partir dos agendamentos registrados na clínica."
          />
        }
      >
        <>
          <KpiGrid patients={filteredPatients} />

          <PanelCard>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Lista de pacientes
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ordenado pela consulta mais recente.
                </p>
              </div>
              <Users2 className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <div className="space-y-3 bg-muted p-3 lg:hidden">
                {filteredPatients.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                    {hasFilters
                      ? 'Nenhum paciente encontrado para os filtros aplicados.'
                      : 'Nenhum paciente encontrado.'}
                  </div>
                ) : (
                  paginatedPatients.map((patient) => (
                    <PatientMobileCard
                      key={patient.identifier}
                      patient={patient}
                      onOpenDetails={setSelectedPatient}
                    />
                  ))
                )}
              </div>

              <div className="hidden lg:block">
                <table className="w-full text-sm" aria-label="Lista de pacientes">
                  <thead>
                    <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th scope="col" className="px-4 py-3">Paciente</th>
                      <th scope="col" className="hidden px-4 py-3 sm:table-cell">Contato</th>
                      <th scope="col" className="px-4 py-3 text-center">Consultas</th>
                      <th scope="col" className="hidden px-4 py-3 md:table-cell">Última visita</th>
                      <th scope="col" className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-sm text-muted-foreground"
                        >
                          {hasFilters
                            ? 'Nenhum paciente encontrado para os filtros aplicados.'
                            : 'Nenhum paciente encontrado.'}
                        </td>
                      </tr>
                    ) : (
                      paginatedPatients.map((patient) => (
                        <tr
                          key={patient.identifier}
                          role="button"
                          tabIndex={0}
                          aria-label={`Ver detalhes de ${patient.patientName}`}
                          className="cursor-pointer hover:bg-muted/50 focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          onClick={() => setSelectedPatient(patient)}
                          onKeyDown={(event) => {
                            if (event.target !== event.currentTarget) return
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              setSelectedPatient(patient)
                            }
                          }}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">
                              {patient.patientName}
                            </p>
                            {patient.patientEmail && (
                              <p className="text-xs text-muted-foreground">
                                {patient.patientEmail}
                              </p>
                            )}
                          </td>
                          <td className="hidden px-4 py-3 text-foreground sm:table-cell">
                            {patient.patientPhone ?? (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-semibold text-foreground">
                              {patient.totalAppointments}
                            </span>
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({patient.completedAppointments} ✓)
                            </span>
                          </td>
                          <td className="hidden px-4 py-3 text-foreground md:table-cell">
                            {patient.lastVisit ? (
                              formatDate(patient.lastVisit)
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-border px-4 py-3">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  filteredCount={filteredPatients.length}
                  pageSize={pageSize}
                  pageSizeOptions={[10, 25, 50, 100]}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          </PanelCard>
        </>
      </ListPageShell>

      <PatientDetailPanel
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </AppPage>
  )
}
