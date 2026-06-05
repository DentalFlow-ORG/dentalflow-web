import { useState } from 'react'
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  Users2,
  X,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Dialog } from 'radix-ui'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { PatientAvatarWidget } from '../components/PatientAvatarWidget'
import { PatientIdentityBadge } from '../components/PatientIdentityBadge'
import { usePatientAvatar } from '../hooks/usePatientAvatar'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { ListPageShell } from '@/components/common/ListPageShell'
import { PanelCard } from '@/components/common/PanelCard'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPage } from '@/components/layout/AppPage'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ClinicalTimeline } from '@/features/clinical-records/components/ClinicalTimeline'
import { usePatientClinicalTimeline } from '@/features/clinical-records/hooks/usePatientClinicalTimeline'

import { HomeActionGrid } from '@/features/home/components/HomeActionGrid'
import { HomeDashboardHeader } from '@/features/home/components/HomeDashboardHeader'
import { HomeEmptyState } from '@/features/home/components/HomeEmptyState'
import { HomeKpiCard } from '@/features/home/components/HomeKpiCard'
import { HomeQuickActionCard } from '@/features/home/components/HomeQuickActionCard'
import { HomeSection } from '@/features/home/components/HomeSection'

import { formatDateBR, safeFormatTimeBR } from '@/lib/date-time-formatters'

import { usePatientHistory } from '../hooks/usePatientHistory'
import { usePatientsPage } from '../hooks/usePatientsPage'
import type { PatientAppointment, PatientSummary } from '../types/patients.types'
import { type BadgeTone, STATUS_LABEL, STATUS_TONE } from '../constants/appointment-display'

const formatDate = formatDateBR
const formatTime = (t: string | null | undefined) => safeFormatTimeBR(t)

// ── KPI section ───────────────────────────────────────────────────────────────

function PatientKpiRow({ patients }: { patients: PatientSummary[] }) {
  const totalPatients = patients.length
  const totalAppointments = patients.reduce(
    (sum, p) => sum + p.totalAppointments,
    0,
  )
  const totalCompleted = patients.reduce(
    (sum, p) => sum + p.completedAppointments,
    0,
  )
  const completionRate =
    totalAppointments > 0
      ? `${((totalCompleted / totalAppointments) * 100).toFixed(1)}%`
      : '0.0%'
  const avgPerPatient =
    totalPatients > 0 ? (totalAppointments / totalPatients).toFixed(1) : '0.0'

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <HomeKpiCard
        label="Pacientes cadastrados"
        value={String(totalPatients)}
        icon={Users2}
        tone="primary"
      />
      <HomeKpiCard
        label="Consultas no total"
        value={String(totalAppointments)}
        icon={CalendarDays}
        tone="neutral"
      />
      <HomeKpiCard
        label="Taxa de conclusão"
        value={completionRate}
        icon={CheckCircle2}
        tone={totalCompleted > 0 ? 'success' : 'neutral'}
      />
      <HomeKpiCard
        label="Média por paciente"
        value={avgPerPatient}
        icon={BarChart3}
        tone="neutral"
      />
    </div>
  )
}

// ── Appointment row (used inside detail panel – P3 scope) ─────────────────────

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

// ── Mobile card ───────────────────────────────────────────────────────────────

function PatientMobileCard({
  patient,
  onOpenDetails,
}: {
  patient: PatientSummary
  onOpenDetails: (patient: PatientSummary) => void
}) {
  const completionSummary =
    patient.totalAppointments > 0
      ? `${patient.completedAppointments} de ${patient.totalAppointments} consultas concluídas`
      : 'Nenhuma consulta registrada'

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <PatientIdentityBadge
          name={patient.patientName}
          email={patient.patientEmail}
          phone={patient.patientPhone}
          avatarUrl={patient.avatarUrl}
          size="md"
          className="flex-1 min-w-0"
        />
        <StatusBadge tone={patient.totalAppointments > 0 ? 'success' : 'muted'}>
          {patient.totalAppointments} consulta{patient.totalAppointments !== 1 ? 's' : ''}
        </StatusBadge>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>
          {patient.lastVisit
            ? `Última visita em ${formatDate(patient.lastVisit)}`
            : 'Sem visita registrada'}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <StatusBadge tone="muted">{completionSummary}</StatusBadge>
        {patient.canceledAppointments > 0 && (
          <StatusBadge tone="warning">
            {patient.canceledAppointments} cancelada
            {patient.canceledAppointments !== 1 ? 's' : ''}
          </StatusBadge>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 w-full"
        onClick={() => onOpenDetails(patient)}
      >
        Ver detalhes
      </Button>
    </article>
  )
}

// ── Detail panel (P3 – kept as-is with PatientAvatarWidget for upload) ────────

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
  const { showAlert } = useGlobalAlerts()
  const canViewClinicalTimeline = user?.role === 'OWNER' || user?.role === 'DENTIST'
  const { appointments, isLoading } = usePatientHistory(patient)
  const { records: clinicalRecords, isLoading: isLoadingTimeline } = usePatientClinicalTimeline(
    canViewClinicalTimeline ? patient?.identifier ?? null : null,
  )

  const identifier = patient?.patientEmail ?? patient?.patientName ?? null
  const { avatarUrl, isSaving, update } = usePatientAvatar(identifier)

  const handleAvatarChange = async (base64: string | null) => {
    try {
      await update(base64)
      showAlert({
        title: base64 ? 'Foto atualizada.' : 'Foto removida.',
        description: base64 ? 'A foto do paciente foi salva.' : 'A foto do paciente foi removida.',
        tone: 'success',
      })
    } catch {
      showAlert({ title: 'Erro', description: 'Não foi possível salvar a foto.', tone: 'error' })
    }
  }

  return (
    <Dialog.Root open={!!patient} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-card shadow-xl focus:outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-4">
              <PatientAvatarWidget
                name={patient?.patientName ?? ''}
                avatarUrl={avatarUrl}
                isSaving={isSaving}
                onUpload={handleAvatarChange}
                onError={(msg) => showAlert({ title: 'Foto inválida', description: msg, tone: 'error' })}
                size="lg"
              />
              <div>
                <Dialog.Title className="text-base font-semibold text-foreground">
                  {patient?.patientName}
                </Dialog.Title>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {patient?.patientEmail ?? patient?.patientPhone ?? 'Sem contato'}
                </p>
              </div>
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

// ── Skeleton loaders ──────────────────────────────────────────────────────────

function PatientSkeletonRow() {
  return (
    <tr aria-hidden="true">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <div className="mx-auto h-4 w-12 animate-pulse rounded bg-muted" />
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </td>
      <td className="px-4 py-3" />
    </tr>
  )
}

function PatientMobileCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm" aria-hidden="true">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mt-3 h-3 w-36 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-9 w-full animate-pulse rounded-md bg-muted" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
    <AppPage spacing="loose">
      <HomeDashboardHeader
        eyebrow="Pacientes"
        title="Base de pacientes"
        description="Acompanhe histórico, contatos e recorrência dos pacientes da clínica."
        actions={
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

      {/* Filter controls */}
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

      {/* Error state */}
      {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

      {/* No patients at all */}
      {!isLoading && !error && patients.length === 0 && (
        <HomeEmptyState
          icon={Users2}
          title="Nenhum paciente registrado"
          description="Os pacientes aparecem aqui a partir dos agendamentos registrados na clínica."
        />
      )}

      {/* Main content — KPIs + list */}
      {(isLoading || patients.length > 0) && (
        <>
          {/* KPI row — computed from filtered patients */}
          {!isLoading && <PatientKpiRow patients={filteredPatients} />}

          {/* Patient list section */}
          <HomeSection
            title="Pacientes cadastrados"
            description="Ordenado pela consulta mais recente."
          >
            {/* Mobile cards */}
            <div className="mt-4 space-y-3 lg:hidden">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <PatientMobileCardSkeleton key={i} />)
              ) : filteredPatients.length === 0 ? (
                <HomeEmptyState
                  compact
                  icon={Users2}
                  title={hasFilters ? 'Nenhum resultado para sua busca' : 'Nenhum paciente encontrado.'}
                  description={hasFilters ? 'Tente ajustar os filtros ou pesquisar por outro contato.' : undefined}
                />
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

            {/* Desktop table */}
            <div className="mt-4 hidden overflow-hidden rounded-lg border border-border lg:block">
              <table className="w-full text-sm" aria-label="Lista de pacientes">
                <thead>
                  <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="px-4 py-3">Paciente</th>
                    <th scope="col" className="px-4 py-3 text-center">Consultas</th>
                    <th scope="col" className="hidden px-4 py-3 md:table-cell">Última visita</th>
                    <th scope="col" className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => <PatientSkeletonRow key={i} />)
                  ) : filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10">
                        <HomeEmptyState
                          compact
                          icon={Users2}
                          title={hasFilters ? 'Nenhum resultado para sua busca' : 'Nenhum paciente encontrado.'}
                          description={hasFilters ? 'Tente ajustar os filtros ou pesquisar por outro contato.' : undefined}
                        />
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
                          <PatientIdentityBadge
                            name={patient.patientName}
                            email={patient.patientEmail}
                            phone={patient.patientPhone}
                            avatarUrl={patient.avatarUrl}
                            size="md"
                          />
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
                          <RefreshCw className="ml-auto h-4 w-4 rotate-0 scale-0 text-muted-foreground opacity-0 group-hover:opacity-100" aria-hidden="true" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(isLoading || filteredPatients.length > 0) && (
              <div className="mt-4 border-t border-border pt-3">
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
            )}
          </HomeSection>

          {/* Quick access */}
          <HomeActionGrid columns={2}>
            <HomeQuickActionCard
              title="Pacientes em atenção"
              description="Inativos, sem consulta futura ou pagamentos pendentes"
              icon={AlertCircle}
              to="/app/pacientes/atencao"
              tone="warning"
            />
            <HomeQuickActionCard
              title="Agendamentos"
              description="Consulte e gerencie todos os agendamentos da clínica"
              icon={CalendarDays}
              to="/app/agendamentos"
            />
          </HomeActionGrid>
        </>
      )}

      <PatientDetailPanel
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </AppPage>
  )
}
