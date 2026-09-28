import { Calendar, Clock, User } from 'lucide-react'

import { EmptyState } from '@/components/common/EmptyState'
import { cn } from '@/lib/utils'

import type { Appointment, AppointmentStatus } from '../../types/scheduling.types'
import { formatAppointmentDate, formatWallTime } from '../../utils/time'
import { AppointmentStatusBadge } from './AppointmentStatusBadge'
import { StatusActionMenu } from './StatusActionMenu'

type AppointmentTableProps = {
  appointments: Appointment[]
  isActionLoading: boolean
  allowedTransitions?: AppointmentStatus[]
  emptyDescription?: string
  onRowClick: (appointment: Appointment) => void
  /** Resolves to `false` when the change failed, so a confirmation can stay open. */
  onStatusChange: (id: string, status: AppointmentStatus) => unknown
  onCancelRequest: (appointment: Appointment) => void
}

export function AppointmentTable({
  appointments,
  isActionLoading,
  allowedTransitions,
  emptyDescription = 'Ajuste os filtros ou crie um novo agendamento para começar.',
  onRowClick,
  onStatusChange,
  onCancelRequest,
}: AppointmentTableProps) {
  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Nenhum agendamento encontrado"
        description={emptyDescription}
      />
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
        <table className="w-full text-sm" aria-label="Lista de agendamentos">
          <thead>
            <tr className="border-b border-border bg-muted text-left">
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Paciente
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Profissional
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Data
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Horário
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {appointments.map((appt) => (
              <tr
                key={appt.id}
                role="button"
                tabIndex={0}
                aria-label={`Abrir detalhes de ${appt.patientName}`}
                className="cursor-pointer transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                onClick={() => onRowClick(appt)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onRowClick(appt)
                  }
                }}
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-foreground">{appt.patientName}</p>
                  {appt.patientEmail && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{appt.patientEmail}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {appt.profile?.displayName ?? 'Profissional não informado'}
                  {appt.service && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{appt.service.name}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {formatAppointmentDate(appt.appointmentDate)}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {formatWallTime(appt.startTime)}
                  <span className="mx-1 text-muted-foreground">–</span>
                  {formatWallTime(appt.endTime)}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <AppointmentStatusBadge status={appt.status} />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <StatusActionMenu
                    appointment={appt}
                    isLoading={isActionLoading}
                    allowedTransitions={allowedTransitions}
                    onStatusChange={onStatusChange}
                    onCancelRequest={onCancelRequest}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="grid gap-3 md:hidden">
        {appointments.map((appt) => (
          <AppointmentCard
            key={appt.id}
            appointment={appt}
            isActionLoading={isActionLoading}
            allowedTransitions={allowedTransitions}
            onClick={() => onRowClick(appt)}
            onStatusChange={onStatusChange}
            onCancelRequest={onCancelRequest}
          />
        ))}
      </div>
    </>
  )
}

function AppointmentCard({
  appointment: appt,
  isActionLoading,
  allowedTransitions,
  onClick,
  onStatusChange,
  onCancelRequest,
}: {
  appointment: Appointment
  isActionLoading: boolean
  allowedTransitions?: AppointmentStatus[]
  onClick: () => void
  /** Resolves to `false` when the change failed, so a confirmation can stay open. */
  onStatusChange: (id: string, status: AppointmentStatus) => unknown
  onCancelRequest: (appointment: Appointment) => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Abrir detalhes de ${appt.patientName}`}
      className={cn(
        'cursor-pointer rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{appt.patientName}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {appt.profile?.displayName ?? 'Profissional não informado'}
          </p>
        </div>
        <AppointmentStatusBadge status={appt.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
          {formatAppointmentDate(appt.appointmentDate)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
          {formatWallTime(appt.startTime)}
          <span className="text-muted-foreground/60">–</span>
          {formatWallTime(appt.endTime)}
        </span>
        {appt.service && (
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
            {appt.service.name}
          </span>
        )}
      </div>

      <div className="mt-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
        <StatusActionMenu
          appointment={appt}
          isLoading={isActionLoading}
          allowedTransitions={allowedTransitions}
          onStatusChange={onStatusChange}
          onCancelRequest={onCancelRequest}
        />
      </div>
    </div>
  )
}
