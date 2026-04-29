import { Check, CheckCircle2, UserX, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { Appointment, AppointmentStatus } from '../../types/scheduling.types'

type StatusActionMenuProps = {
  appointment: Appointment
  isLoading: boolean
  onStatusChange: (id: string, status: AppointmentStatus) => void
  onCancelRequest: (appointment: Appointment) => void
}

export function StatusActionMenu({
  appointment,
  isLoading,
  onStatusChange,
  onCancelRequest,
}: StatusActionMenuProps) {
  const { id, status } = appointment

  if (status === 'COMPLETED' || status === 'CANCELED' || status === 'NO_SHOW') {
    return <span className="text-xs text-slate-400">—</span>
  }

  return (
    <div className="flex items-center gap-1.5">
      {status === 'PENDING' && (
        <Button
          type="button"
          size="xs"
          variant="secondary"
          disabled={isLoading}
          onClick={() => onStatusChange(id, 'CONFIRMED')}
          title="Confirmar"
        >
          <Check className="h-3 w-3" />
          <span className="hidden sm:inline">Confirmar</span>
        </Button>
      )}

      {status === 'CONFIRMED' && (
        <Button
          type="button"
          size="xs"
          disabled={isLoading}
          onClick={() => onStatusChange(id, 'COMPLETED')}
          title="Concluir"
        >
          <CheckCircle2 className="h-3 w-3" />
          <span className="hidden sm:inline">Concluir</span>
        </Button>
      )}

      <Button
        type="button"
        size="xs"
        variant="ghost"
        disabled={isLoading}
        onClick={() => onStatusChange(id, 'NO_SHOW')}
        title="Não compareceu"
        className="text-orange-600 hover:bg-orange-50 hover:text-orange-700"
      >
        <UserX className="h-3 w-3" />
        <span className="hidden lg:inline">Não veio</span>
      </Button>

      <Button
        type="button"
        size="xs"
        variant="destructive"
        disabled={isLoading}
        onClick={() => onCancelRequest(appointment)}
        title="Cancelar"
      >
        <X className="h-3 w-3" />
        <span className="hidden sm:inline">Cancelar</span>
      </Button>
    </div>
  )
}
