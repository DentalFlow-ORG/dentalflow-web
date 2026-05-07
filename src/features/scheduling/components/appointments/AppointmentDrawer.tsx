import { useState } from 'react'
import { Loader2, Pencil, X, ClipboardList } from 'lucide-react'
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
import { AppointmentStatusBadge } from './AppointmentStatusBadge'
import { StatusActionMenu } from './StatusActionMenu'

type AppointmentDrawerProps = {
  appointment: Appointment | null
  readOnly?: boolean
  allowedTransitions?: AppointmentStatus[]
  isActionLoading: boolean
  onClose: () => void
  onEdit?: (appointment: Appointment) => void
  onStatusChange: (id: string, status: AppointmentStatus) => void
  onCancelRequest: (appointment: Appointment) => void
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
}: AppointmentDrawerProps) {
  return (
    <Dialog.Root open={!!appointment} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in-0 duration-200" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl shadow-slate-950/15',
            'animate-in slide-in-from-right duration-200',
          )}
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          <Dialog.Title className="sr-only">
            {appointment?.patientName ?? 'Detalhes do agendamento'}
          </Dialog.Title>
          {appointment && (
            <>
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-lg font-semibold text-slate-950">
                    {appointment.patientName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatAppointmentDateLong(appointment.appointmentDate)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {onEdit && (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(appointment)}
                      aria-label="Editar agendamento"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClose}
                    aria-label="Fechar"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Status + actions */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <AppointmentStatusBadge status={appointment.status} />
                  {!readOnly && (
                    <StatusActionMenu
                      appointment={appointment}
                      isLoading={isActionLoading}
                      allowedTransitions={allowedTransitions}
                      onStatusChange={onStatusChange}
                      onCancelRequest={onCancelRequest}
                    />
                  )}
                </div>

                {/* Appointment details */}
                <DrawerSection title="Consulta">
                  <DrawerRow label="Data">
                    {formatAppointmentDate(appointment.appointmentDate)}
                  </DrawerRow>
                  <DrawerRow label="Horário">
                    {formatWallTime(appointment.startTime)}
                    <span className="mx-1 text-slate-400">–</span>
                    {formatWallTime(appointment.endTime)}
                  </DrawerRow>
                  <DrawerRow label="Duração">
                    {appointment.durationMinutes} min
                  </DrawerRow>
                  <DrawerRow label="Profissional">
                    {appointment.profile.displayName}
                  </DrawerRow>
                  {appointment.service && (
                    <DrawerRow label="Serviço">
                      {appointment.service.name}
                    </DrawerRow>
                  )}
                </DrawerSection>

                {/* Patient details */}
                <DrawerSection title="Paciente">
                  <DrawerRow label="Nome">{appointment.patientName}</DrawerRow>
                  {appointment.patientEmail && (
                    <DrawerRow label="E-mail">{appointment.patientEmail}</DrawerRow>
                  )}
                  {appointment.patientPhone && (
                    <DrawerRow label="Telefone">{appointment.patientPhone}</DrawerRow>
                  )}
                </DrawerSection>

                {/* Notes */}
                {appointment.notes && (
                  <DrawerSection title="Observações">
                    <p className="text-sm leading-6 text-slate-600">{appointment.notes}</p>
                  </DrawerSection>
                )}

                {/* Clinical record section — role-aware, dynamic */}
                <ClinicalRecordSection appointment={appointment} onClose={onClose} />

                {/* Cancellation info */}
                {appointment.status === 'CANCELED' && (
                  <DrawerSection title="Cancelamento">
                    {appointment.cancellationReason && (
                      <DrawerRow label="Motivo">
                        {appointment.cancellationReason}
                      </DrawerRow>
                    )}
                    {appointment.canceledAt && (
                      <DrawerRow label="Cancelado em">
                        {formatAppointmentDate(appointment.canceledAt)}
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

function ClinicalRecordSection({
  appointment,
  onClose,
}: {
  appointment: Appointment
  onClose: () => void
}) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showAlert } = useGlobalAlerts()
  const { record, isLoading } = useClinicalRecordByAppointment(appointment.id)
  const [isCreating, setIsCreating] = useState(false)

  const canManage = user?.role === 'OWNER' || user?.role === 'DENTIST'
  if (!canManage) return null

  const handleOpen = () => {
    if (!record) return
    onClose()
    void navigate({ to: '/app/prontuario/$clinicalRecordId', params: { clinicalRecordId: record.id } })
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
      void navigate({ to: '/app/prontuario/$clinicalRecordId', params: { clinicalRecordId: created.id } })
    } catch {
      showAlert({ title: 'Erro', description: 'Não foi possível criar o prontuário.', tone: 'error' })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <DrawerSection title="Prontuário">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verificando prontuário...
        </div>
      ) : record ? (
        <Button
          size="sm"
          onClick={handleOpen}
          className="w-full justify-start"
        >
          <ClipboardList className="h-4 w-4" />
          Abrir prontuário
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={isCreating}
          className="w-full justify-start"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ClipboardList className="h-4 w-4" />
          )}
          {isCreating ? 'Criando prontuário...' : 'Criar prontuário'}
        </Button>
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
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        {children}
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
    <div className="flex justify-between gap-4 text-sm">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{children}</span>
    </div>
  )
}
