import { useEffect, useState } from 'react'
import { CalendarDays, Pencil, X } from 'lucide-react'
import { Dialog } from 'radix-ui'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  formatAppointmentDate,
  formatAppointmentDateLong,
  formatWallTime,
} from '../../utils/time'
import type { Appointment, AppointmentStatus } from '../../types/scheduling.types'
import { getInitials } from '../../utils/appointment-form-utils'
import { AppointmentStatusBadge } from './AppointmentStatusBadge'
import { AppointmentPaymentBadge } from './AppointmentPaymentBadge'
import { AppointmentPaymentSection } from './AppointmentPaymentSection'
import { AppointmentStatusActions } from './AppointmentStatusActions'
import { AppointmentClinicalSection } from './AppointmentClinicalSection'
import { AppointmentNotificationSection } from './AppointmentNotificationSection'
import { AppointmentDetailsSection, AppointmentDetailsRow } from './AppointmentDetailsSection'

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

  useEffect(() => {
    setLocalAppointment(appointment)
  }, [appointment])

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
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl shadow-black/15',
            'animate-in slide-in-from-right duration-200',
          )}
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          {active && (
            <>
              {/* Accessible title and description for screen readers */}
              <Dialog.Title className="sr-only">{active.patientName}</Dialog.Title>
              <Dialog.Description className="sr-only">
                Detalhes do agendamento — {formatAppointmentDateLong(active.appointmentDate)}
              </Dialog.Description>

              {/* Header — patient summary with status and payment at a glance */}
              <div className="flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                    aria-hidden="true"
                  >
                    {getInitials(active.patientName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-foreground">
                      {active.patientName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {formatAppointmentDateLong(active.appointmentDate)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <AppointmentStatusBadge status={active.status} />
                      <AppointmentPaymentBadge status={active.paymentStatus} />
                    </div>
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
                        <Pencil aria-hidden="true" />
                      </Button>
                    )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClose}
                    aria-label="Fechar detalhes"
                  >
                    <X aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* Body */}
              <div className="app-scrollbar flex-1 space-y-5 overflow-y-auto px-5 py-5">
                {/* Status actions */}
                {!readOnly && (
                  <AppointmentStatusActions
                    appointment={active}
                    isLoading={isActionLoading}
                    allowedTransitions={allowedTransitions}
                    onStatusChange={onStatusChange}
                    onCancelRequest={onCancelRequest}
                  />
                )}

                {/* Consulta */}
                <AppointmentDetailsSection title="Consulta">
                  <AppointmentDetailsRow label="Data">
                    {formatAppointmentDate(active.appointmentDate)}
                  </AppointmentDetailsRow>
                  <AppointmentDetailsRow label="Horário">
                    {formatWallTime(active.startTime)}
                    <span className="mx-1 text-muted-foreground/60">–</span>
                    {formatWallTime(active.endTime)}
                  </AppointmentDetailsRow>
                  <AppointmentDetailsRow label="Duração">
                    {active.durationMinutes} min
                  </AppointmentDetailsRow>
                  <AppointmentDetailsRow label="Profissional">
                    {active.profile?.displayName ?? 'Profissional não informado'}
                  </AppointmentDetailsRow>
                  {active.service && (
                    <AppointmentDetailsRow label="Serviço">
                      {active.service.name}
                    </AppointmentDetailsRow>
                  )}
                </AppointmentDetailsSection>

                {/* Paciente */}
                <AppointmentDetailsSection title="Paciente">
                  <AppointmentDetailsRow label="Nome">{active.patientName}</AppointmentDetailsRow>
                  {active.patientEmail && (
                    <AppointmentDetailsRow label="E-mail">
                      {active.patientEmail}
                    </AppointmentDetailsRow>
                  )}
                  {active.patientPhone && (
                    <AppointmentDetailsRow label="Telefone">
                      {active.patientPhone}
                    </AppointmentDetailsRow>
                  )}
                </AppointmentDetailsSection>

                {/* Observações */}
                {active.notes && (
                  <AppointmentDetailsSection title="Observações">
                    <p className="px-4 py-3 text-sm leading-6 text-foreground">{active.notes}</p>
                  </AppointmentDetailsSection>
                )}

                {/* Pagamento */}
                <AppointmentPaymentSection
                  appointment={active}
                  onUpdated={handlePaymentUpdated}
                />

                {/* Prontuário */}
                <AppointmentClinicalSection appointment={active} onClose={onClose} />

                {/* WhatsApp */}
                <AppointmentNotificationSection appointment={active} />

                {/* Cancelamento */}
                {active.status === 'CANCELED' &&
                  (active.cancellationReason || active.canceledAt) && (
                    <AppointmentDetailsSection title="Cancelamento">
                      {active.cancellationReason && (
                        <AppointmentDetailsRow label="Motivo">
                          {active.cancellationReason}
                        </AppointmentDetailsRow>
                      )}
                      {active.canceledAt && (
                        <AppointmentDetailsRow label="Cancelado em">
                          {formatAppointmentDate(active.canceledAt)}
                        </AppointmentDetailsRow>
                      )}
                    </AppointmentDetailsSection>
                  )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
