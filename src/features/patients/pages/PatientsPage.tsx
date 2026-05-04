import { CalendarDays, ChevronRight, RefreshCw, Users2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useRef, useState } from 'react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextInput } from '@/components/common/FormField'
import { ListPageShell } from '@/components/common/ListPageShell'
import { MetricCard } from '@/components/common/MetricCard'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/services/http'

import { getPatientHistory, listPatients } from '../services/patients.service'
import type { PatientAppointment, PatientSummary } from '../types/patients.types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

function formatTime(time: string) {
  return time.slice(0, 5)
}

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

// ---------------------------------------------------------------------------
// KPI grid
// ---------------------------------------------------------------------------

function KpiGrid({ patients }: { patients: PatientSummary[] }) {
  const totalPatients = patients.length
  const totalAppointments = patients.reduce((s, p) => s + p.totalAppointments, 0)
  const totalCompleted = patients.reduce((s, p) => s + p.completedAppointments, 0)
  const completionRate =
    totalAppointments > 0 ? ((totalCompleted / totalAppointments) * 100).toFixed(1) : '0.0'
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

// ---------------------------------------------------------------------------
// Patient history slide-over
// ---------------------------------------------------------------------------

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

function PatientDetailPanel({
  patient,
  onClose,
}: {
  patient: PatientSummary | null
  onClose: () => void
}) {
  const { showAlert } = useGlobalAlerts()
  const [history, setHistory] = useState<{
    identifier: string
    appointments: PatientAppointment[]
  } | null>(null)
  const appointments =
    patient && history?.identifier === patient.identifier ? history.appointments : []
  const isLoading = !!patient && history?.identifier !== patient.identifier

  useEffect(() => {
    if (!patient) return
    const identifier = patient.identifier
    let isCurrent = true

    getPatientHistory(identifier)
      .then((res) => {
        if (isCurrent) {
          setHistory({ identifier, appointments: res.appointments })
        }
      })
      .catch((err) => {
        if (!isCurrent) return
        const msg = err instanceof ApiError ? err.message : 'Erro ao carregar histórico.'
        showAlert({ title: 'Erro', description: msg, tone: 'error' })
        setHistory({ identifier, appointments: [] })
      })

    return () => {
      isCurrent = false
    }
  }, [patient, showAlert])

  return (
    <Dialog.Root open={!!patient} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-xl focus:outline-none"
          aria-describedby={undefined}
        >
          {/* Header */}
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

          {/* Stats strip */}
          {patient && (
            <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50">
              <div className="px-4 py-3 text-center">
                <p className="text-xl font-bold text-slate-950">{patient.totalAppointments}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-xl font-bold text-emerald-600">
                  {patient.completedAppointments}
                </p>
                <p className="text-xs text-slate-500">Concluídas</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-xl font-bold text-red-500">{patient.canceledAppointments}</p>
                <p className="text-xs text-slate-500">Canceladas</p>
              </div>
            </div>
          )}

          {/* Appointment list */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Histórico de consultas
            </h2>

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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function PatientsPage() {
  const { showAlert } = useGlobalAlerts()
  const [patients, setPatients] = useState<PatientSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = (value: string) => {
    setPage(1)
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 400)
  }

  const load = (searchTerm?: string) => {
    setIsLoading(true)
    setError(null)
    listPatients(searchTerm)
      .then((res) => setPatients(res.data))
      .catch((err) => {
        const msg = err instanceof ApiError ? err.message : 'Erro ao carregar pacientes.'
        setError(msg)
        showAlert({ title: 'Erro ao carregar pacientes', description: msg, tone: 'error' })
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    load(debouncedSearch || undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const filteredPatients = patients.filter((p) => {
    if (dateFrom && p.lastVisit && p.lastVisit < dateFrom) return false
    if (dateTo && p.lastVisit && p.lastVisit > dateTo) return false
    return true
  })
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  const hasFilters = !!debouncedSearch || !!dateFrom || !!dateTo

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Clínica"
        title="Pacientes"
        description="Lista de pacientes com base no histórico de consultas."
        action={
          <Button variant="outline" onClick={() => load(debouncedSearch || undefined)}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        }
      />

      {/* Filters */}
      <PanelCard className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Buscar paciente" htmlFor="patientSearch" className="lg:col-span-2">
            <TextInput
              id="patientSearch"
              placeholder="Nome ou e-mail…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </FormField>
          <FormField label="Última visita — de" htmlFor="patientFrom">
            <DatePickerInput
              id="patientFrom"
              value={dateFrom}
              placeholder="DD/MM/AAAA"
              onValueChange={(value) => {
                setPage(1)
                setDateFrom(value)
              }}
            />
          </FormField>
          <FormField label="Última visita — até" htmlFor="patientTo">
            <DatePickerInput
              id="patientTo"
              value={dateTo}
              placeholder="DD/MM/AAAA"
              minValue={dateFrom}
              onValueChange={(value) => {
                setPage(1)
                setDateTo(value)
              }}
            />
          </FormField>
        </div>
      </PanelCard>

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando pacientes…"
        error={error}
        onRetry={() => load(debouncedSearch || undefined)}
        isEmpty={patients.length === 0}
        emptyState={
          <PanelCard>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Users2 className="h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500">
                Nenhum paciente registrado ainda.
              </p>
            </div>
          </PanelCard>
        }
      >
        <>
          <KpiGrid patients={filteredPatients} />

          <PanelCard>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Lista de pacientes</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ordenado pela consulta mais recente.
                </p>
              </div>
              <Users2 className="h-5 w-5 text-primary" />
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
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
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
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
                            <p className="font-medium text-slate-900">{patient.patientName}</p>
                            {patient.patientEmail && (
                              <p className="text-xs text-slate-500">{patient.patientEmail}</p>
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
                  page={currentPage}
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
