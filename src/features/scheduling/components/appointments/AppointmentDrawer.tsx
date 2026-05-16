import { useState } from 'react'
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Loader2,
  Pencil,
  Plus,
  UserX,
  X,
} from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useNavigate } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useClinicalRecordByAppointment } from '@/features/clinical-records/hooks/useClinicalRecord'
import { createClinicalRecord } from '@/features/clinical-records/services/clinical-records.service'

import {
  formatAppointmentDate,
  formatAppointmentDateLong,
  formatWallTime,
} from '../../utils/time'
import type { Appointment, AppointmentStatus } from '../../types/scheduling.types'
import {
  getAvailableTransitions,
  isTerminalStatus,
} from '../../utils/appointment-state-machine'
import { AppointmentStatusBadge } from './AppointmentStatusBadge'
import { AppointmentPaymentSection } from './AppointmentPaymentSection'

type AppointmentDrawerProps = {
  appointment: Appointment | null
  readOnly?: boolean
  allowedTransitions?: AppointmentStatus[]
  isActionLoading: boolean
  onClose: () => void
  onEdit?: (appointment: Appointment) => void
  onStatusChange: (id: string, status: AppointmentStatus) => void
  onCancelRequest: (appointment: Appointment) => void
  onPaymentUpdated?: (updated: Appointment) => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function AppointmentDrawer({
  appointment,
  readOnly = false,
  allowedTransitions,
  isActionLoading,
  onClose,
  onEdit,
  onStatusChange,
  onCancelRequest,
  onPaymentUpdated,
}: AppointmentDrawerProps) {
  const [localAppointment, setLocalAppointment] = useState<Appointment | null>(appointment)

  // Sync when parent passes a new appointment (e.g. after status change)
  if (appointment?.id !== localAppointment?.id) {
    setLocalAppointment(appointment)
  } else if (appointment && localAppointment && appointment.updatedAt !== localAppointment.updatedAt) {
    setLocalAppointment(appointment)
  }

  const handlePaymentUpdated = (updated: Appointment) => {
    setLocalAppointment(updated)
    onPaymentUpdated?.(updated)
  }

  const active = localAppointment ?? appointment

  return (
    <Dialog.Root open={!!appointment} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in-0 duration-200" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl shadow-black/15',
            'animate-in slide-in-from-right duration-200',
          )}
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          {active && (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                    aria-hidden="true"
                  >
                    {getInitials(active.patientName)}
                  </div>
                  <div className="min-w-0">
                    <Dialog.Title className="truncate text-lg font-semibold text-foreground">
                      {active.patientName}
                    </Dialog.Title>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {formatAppointmentDateLong(active.appointmentDate)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {onEdit &&
                    (active.status === 'PENDING' || active.status === 'CONFIRMED') && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(active)}
                        aria-label="Editar agendamento"
                      >
                        <Pencil />
                      </Button>
                    )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClose}
                    aria-label="Fechar detalhes"
                  >
                    <X />
                  </Button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                {/* Status */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <AppointmentStatusBadge status={active.status} />
                </div>

                {/* Actions */}
                {!readOnly && (
                  <DrawerActions
                    appointment={active}
                    isLoading={isActionLoading}
                    allowedTransitions={allowedTransitions}
                    onStatusChange={onStatusChange}
                    onCancelRequest={onCancelRequest}
                  />
                )}

                {/* Appointment details */}
                <DrawerSection title="Consulta">
                  <DrawerRow label="Data">
                    {formatAppointmentDate(active.appointmentDate)}
                  </DrawerRow>
                  <DrawerRow label="Horário">
                    {formatWallTime(active.startTime)}
                    <span className="mx-1 text-muted-foreground/60">–</span>
                    {formatWallTime(active.endTime)}
                  </DrawerRow>
                  <DrawerRow label="Duração">{active.durationMinutes} min</DrawerRow>
                  <DrawerRow label="Profissional">{active.profile.displayName}</DrawerRow>
                  {active.service && (
                    <DrawerRow label="Serviço">{active.service.name}</DrawerRow>
                  )}
                </DrawerSection>

                {/* Patient details */}
                <DrawerSection title="Paciente">
                  <DrawerRow label="Nome">{active.patientName}</DrawerRow>
                  {active.patientEmail && (
                    <DrawerRow label="E-mail">{active.patientEmail}</DrawerRow>
                  )}
                  {active.patientPhone && (
                    <DrawerRow label="Telefone">{active.patientPhone}</DrawerRow>
                  )}
                </DrawerSection>

                {/* Notes */}
                {active.notes && (
                  <DrawerSection title="Observações">
                    <p className="px-4 py-3 text-sm leading-6 text-foreground">
                      {active.notes}
                    </p>
                  </DrawerSection>
                )}

                {/* Payment */}
                <AppointmentPaymentSection
                  appointment={active}
                  onUpdated={handlePaymentUpdated}
                />

                {/* Clinical record */}
                <ClinicalRecordSection appointment={active} onClose={onClose} />

                {/* Cancellation info */}
                {active.status === 'CANCELED' &&
                  (active.cancellationReason || active.canceledAt) && (
                    <DrawerSection title="Cancelamento">
                      {active.cancellationReason && (
                        <DrawerRow label="Motivo">{active.cancellationReason}</DrawerRow>
                      )}
                      {active.canceledAt && (
                        <DrawerRow label="Cancelado em">
                          {formatAppointmentDate(active.canceledAt)}
                        </DrawerRow>
                      )}
                    </DrawerSection>
                  )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function DrawerActions({
  appointment,
  isLoading,
  allowedTransitions,
  onStatusChange,
  onCancelRequest,
}: {
  appointment: Appointment
  isLoading: boolean
  allowedTransitions?: AppointmentStatus[]
  onStatusChange: (id: string, status: AppointmentStatus) => void
  onCancelRequest: (appointment: Appointment) => void
}) {
  const { id, status } = appointment

  const available = getAvailableTransitions(appointment, {
    roleAllowedTargets: allowedTransitions,
  })
  const can = (target: AppointmentStatus) => available.includes(target)

  if (isTerminalStatus(status) || available.length === 0) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <p className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Ações
      </p>
      <div className="flex flex-col gap-1.5 p-3">
        {can('CONFIRMED') && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            disabled={isLoading}
            onClick={() => onStatusChange(id, 'CONFIRMED')}
          >
            <Check />
            Confirmar agendamento
          </Button>
        )}
        {can('COMPLETED') && (
          <Button
            type="button"
            size="sm"
            className="w-full justify-start"
            disabled={isLoading}
            onClick={() => onStatusChange(id, 'COMPLETED')}
          >
            <CheckCircle2 />
            Concluir consulta
          </Button>
        )}
        {can('NO_SHOW') && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/40 dark:hover:text-orange-300"
            disabled={isLoading}
            onClick={() => onStatusChange(id, 'NO_SHOW')}
          >
            <UserX />
            Não compareceu
          </Button>
        )}
        {can('CANCELED') && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="w-full justify-start"
            disabled={isLoading}
            onClick={() => onCancelRequest(appointment)}
          >
            <X />
            Cancelar agendamento
          </Button>
        )}
      </div>
    </div>
  )
}

function ClinicalRecordSection({
  appointment,
  onClose,
}: {
  appointment: Appointment
  onClose: () => void
}) {
  const { user } = useAuth()
  const canManage = user?.role === 'OWNER' || user?.role === 'DENTIST'
  if (!canManage) return null

  return <ClinicalRecordManagerSection appointment={appointment} onClose={onClose} />
}

function ClinicalRecordManagerSection({
  appointment,
  onClose,
}: {
  appointment: Appointment
  onClose: () => void
}) {
  const navigate = useNavigate()
  const { showAlert } = useGlobalAlerts()
  const { record, isLoading } = useClinicalRecordByAppointment(appointment.id)
  const [isCreating, setIsCreating] = useState(false)

  const handleOpen = () => {
    if (!record) return
    onClose()
    void navigate({
      to: '/app/prontuario/$clinicalRecordId',
      params: { clinicalRecordId: record.id },
    })
  }

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      const created = await createClinicalRecord({
        appointmentId: appointment.id,
        profileId: appointment.profile.id,
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail ?? undefined,
        patientPhone: appointment.patientPhone ?? undefined,
      })
      onClose()
      void navigate({
        to: '/app/prontuario/$clinicalRecordId',
        params: { clinicalRecordId: created.id },
      })
    } catch {
      showAlert({
        title: 'Erro',
        description: 'Não foi possível criar o prontuário.',
        tone: 'error',
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <DrawerSection title="Prontuário">
      {isLoading ? (
        <div className="flex items-center gap-2.5 px-4 py-3.5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
          Verificando prontuário...
        </div>
      ) : record ? (
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          onClick={handleOpen}
          aria-label="Abrir prontuário clínico"
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <ClipboardList className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground">Abrir prontuário</p>
            <p className="text-xs text-muted-foreground">Visualizar ficha clínica do paciente</p>
          </div>
          <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50"
          onClick={handleCreate}
          disabled={isCreating}
          aria-label={isCreating ? 'Criando prontuário' : 'Criar prontuário clínico'}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
            aria-hidden="true"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ClipboardList className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground">
              {isCreating ? 'Criando prontuário...' : 'Criar prontuário'}
            </p>
            <p className="text-xs text-muted-foreground">Iniciar ficha clínica para este paciente</p>
          </div>
          {!isCreating && (
            <Plus className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
        </button>
      )}
    </DrawerSection>
  )
}

function DrawerSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="divide-y divide-border">{children}</div>
      </div>
    </div>
  )
}

function DrawerRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  )
}
