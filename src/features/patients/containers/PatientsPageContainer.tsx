import { useState } from 'react'
import { CalendarDays, ChevronRight, RefreshCw, Users2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextInput } from '@/components/common/FormField'
import { ListPageShell } from '@/components/common/ListPageShell'
import { MetricCard } from '@/components/common/MetricCard'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { ClinicalTimeline } from '@/features/clinical-records/components/ClinicalTimeline'
import { usePatientClinicalTimeline } from '@/features/clinical-records/hooks/usePatientClinicalTimeline'

import { formatDateBR, formatTimeInputValue } from '@/lib/date-time-formatters'

import { usePatientHistory } from '../hooks/usePatientHistory'
import { usePatientsPage } from '../hooks/usePatientsPage'
import type { PatientAppointment, PatientSummary } from '../types/patients.types'

const formatDate = formatDateBR
const formatTime = (t: string) => formatTimeInputValue(t).slice(0, 5)

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
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">
            {appt.service?.name ?? 'Consulta'}
          </p>
          {appt.profile && (
            <p className="mt-0.5 text-xs text-slate-500">{appt.profile.displayName}</p>
          )}
        </div>
        <StatusBadge tone={tone}>{STATUS_LABEL[appt.status] ?? appt.status}</StatusBadge>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
        <span>
          {formatDate(appt.appointmentDate)} · {formatTime(appt.startTime)}–
          {formatTime(appt.endTime)}
        </span>
      </div>
      {appt.notes && (
        <p className="mt-1.5 text-xs italic text-slate-400">{appt.notes}</p>
      )}
    </div>
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
  const { appointments, isLoading } = usePatientHistory(patient)
  const { records: clinicalRecords, isLoading: isLoadingTimeline } = usePatientClinicalTimeline(
    patient?.identifier ?? null,
  )

  return (
    <Dialog.Root open={!!patient} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-xl focus:outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-slate-950">
                {patient?.patientName}
              </Dialog.Title>
              <p className="mt-0.5 text-sm text-slate-500">
                {patient?.patientEmail ?? patient?.patientPhone ?? 'Sem contato'}
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded p-1 text-slate-400 hover:text-slate-700 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {patient && (
            <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50">
              <div className="px-4 py-3 text-center">
                <p className="text-xl font-bold text-slate-950">
                  {patient.totalAppointments}
                </p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-xl font-bold text-emerald-600">
                  {patient.completedAppointments}
                </p>
                <p className="text-xs text-slate-500">Concluídas</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-xl font-bold text-red-500">
                  {patient.canceledAppointments}
                </p>
                <p className="text-xs text-slate-500">Canceladas</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {([
              { id: 'consultas', label: 'Consultas' },
              { id: 'prontuarios', label: 'Prontuários' },
            ] as { id: PanelTab; label: string }[]).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {activeTab === 'consultas' && (
              <ListPageShell
                isLoading={isLoading}
                loadingMessage="Carregando histórico…"
                isEmpty={!isLoading && appointments.length === 0}
                emptyState={
                  <p className="text-sm text-slate-500">Nenhuma consulta encontrada.</p>
                }
              >
                <div className="space-y-3">
                  {appointments.map((appt) => (
                    <AppointmentRow key={appt.id} appt={appt} />
                  ))}
                </div>
              </ListPageShell>
            )}

            {activeTab === 'prontuarios' && (
              <ListPageShell
                isLoading={isLoadingTimeline}
                loadingMessage="Carregando prontuários…"
                isEmpty={!isLoadingTimeline && clinicalRecords.length === 0}
                emptyState={
                  <p className="text-sm text-slate-500">Nenhum prontuário encontrado.</p>
                }
              >
                <ClinicalTimeline records={clinicalRecords} />
              </ListPageShell>
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
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
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
          <PanelCard>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Users2 className="h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500">Nenhum paciente registrado ainda.</p>
            </div>
          </PanelCard>
        }
      >
        <>
          <KpiGrid patients={filteredPatients} />

          <PanelCard>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Lista de pacientes
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ordenado pela consulta mais recente.
                </p>
              </div>
              <Users2 className="h-5 w-5 text-primary" />
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-160 text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">Paciente</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Contato</th>
                      <th className="px-4 py-3 text-center">Consultas</th>
                      <th className="hidden px-4 py-3 md:table-cell">Última visita</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-sm text-slate-500"
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
                          className="cursor-pointer hover:bg-slate-50/70"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900">
                              {patient.patientName}
                            </p>
                            {patient.patientEmail && (
                              <p className="text-xs text-slate-500">
                                {patient.patientEmail}
                              </p>
                            )}
                          </td>
                          <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                            {patient.patientPhone ?? (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-semibold text-slate-900">
                              {patient.totalAppointments}
                            </span>
                            <span className="ml-1 text-xs text-slate-400">
                              ({patient.completedAppointments} ✓)
                            </span>
                          </td>
                          <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                            {patient.lastVisit ? (
                              formatDate(patient.lastVisit)
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-100 px-4 py-3">
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
