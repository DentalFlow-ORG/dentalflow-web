import { Check, CheckCircle2, UserX, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { Appointment, AppointmentStatus } from '../../types/scheduling.types'
import { getAvailableTransitions, isTerminalStatus } from '../../utils/appointment-state-machine'

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
          aria-label="Confirmar agendamento"
        >
          <Check className="h-3 w-3" aria-hidden="true" />
          <span className="hidden sm:inline">Confirmar</span>
        </Button>
      )}

      {can('COMPLETED') && (
        <Button
          type="button"
          size="xs"
          disabled={isLoading}
          onClick={() => onStatusChange(id, 'COMPLETED')}
          aria-label="Concluir consulta"
        >
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
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
          aria-label="Não compareceu"
          className="text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/40 dark:hover:text-orange-300"
        >
          <UserX className="h-3 w-3" aria-hidden="true" />
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
          aria-label="Cancelar agendamento"
        >
          <X className="h-3 w-3" aria-hidden="true" />
          <span className="hidden sm:inline">Cancelar</span>
        </Button>
      )}
    </div>
  )
}
