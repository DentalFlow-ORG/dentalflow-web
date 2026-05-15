import { Check, CheckCircle2, UserX, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { Appointment, AppointmentStatus } from '../../types/scheduling.types'
import {
  getAvailableTransitions,
  isTerminalStatus,
} from '../../utils/appointment-state-machine'

type StatusActionMenuProps = {
  appointment: Appointment
  isLoading: boolean
  allowedTransitions?: AppointmentStatus[]
  onStatusChange: (id: string, status: AppointmentStatus) => void
  onCancelRequest: (appointment: Appointment) => void
}

export function StatusActionMenu({
  appointment,
  isLoading,
  allowedTransitions,
  onStatusChange,
  onCancelRequest,
}: StatusActionMenuProps) {
  const { id, status } = appointment

  const available = getAvailableTransitions(appointment, {
    roleAllowedTargets: allowedTransitions,
  })
  const can = (target: AppointmentStatus) => available.includes(target)

  if (isTerminalStatus(status)) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <div className="flex items-center gap-1.5">
      {can('CONFIRMED') && (
        <Button
          type="button"
          size="xs"
          variant="secondary"
          disabled={isLoading}
          onClick={() => onStatusChange(id, 'CONFIRMED')}
          title="Confirmar agendamento"
        >
          <Check className="h-3 w-3" />
          <span className="hidden sm:inline">Confirmar</span>
        </Button>
      )}

      {can('COMPLETED') && (
        <Button
          type="button"
          size="xs"
          disabled={isLoading}
          onClick={() => onStatusChange(id, 'COMPLETED')}
          title="Concluir consulta"
        >
          <CheckCircle2 className="h-3 w-3" />
          <span className="hidden sm:inline">Concluir</span>
        </Button>
      )}

      {can('NO_SHOW') && (
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={isLoading}
          onClick={() => onStatusChange(id, 'NO_SHOW')}
          title="Não compareceu"
          className="text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/30 dark:hover:text-orange-400"
        >
          <UserX className="h-3 w-3" />
          <span className="hidden lg:inline">Não veio</span>
        </Button>
      )}

      {can('CANCELED') && (
        <Button
          type="button"
          size="xs"
          variant="destructive"
          disabled={isLoading}
          onClick={() => onCancelRequest(appointment)}
          title="Cancelar agendamento"
        >
          <X className="h-3 w-3" />
          <span className="hidden sm:inline">Cancelar</span>
        </Button>
      )}
    </div>
  )
}
