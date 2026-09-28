import { Check, CheckCircle2, UserX, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import type { Appointment, AppointmentStatus } from '../../types/scheduling.types'
import { getAvailableTransitions, isTerminalStatus } from '../../utils/appointment-state-machine'
import { NoShowConfirmDialog } from './NoShowConfirmDialog'

type AppointmentStatusActionsProps = {
  appointment: Appointment
  isLoading: boolean
  allowedTransitions?: AppointmentStatus[]
  /** Resolves to `false` when the change failed, so a confirmation can stay open. */
  onStatusChange: (id: string, status: AppointmentStatus) => unknown
  onCancelRequest: (appointment: Appointment) => void
}

/**
 * Drawer-context appointment status actions.
 * Renders full-width vertical buttons inside a labelled card.
 * Role filtering is enforced by the `allowedTransitions` prop — callers
 * derive this from the user role; this component only renders what it receives.
 */
export function AppointmentStatusActions({
  appointment,
  isLoading,
  allowedTransitions,
  onStatusChange,
  onCancelRequest,
}: AppointmentStatusActionsProps) {
  const { id, status } = appointment

  const available = getAvailableTransitions(appointment, {
    roleAllowedTargets: allowedTransitions,
  })
  const can = (target: AppointmentStatus) => available.includes(target)
  // NO_SHOW is terminal, so it is confirmed before the status changes.
  const [isConfirmingNoShow, setIsConfirmingNoShow] = useState(false)

  async function handleNoShowConfirm() {
    const saved = await onStatusChange(id, 'NO_SHOW')
    if (saved !== false) setIsConfirmingNoShow(false)
  }

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
            <Check aria-hidden="true" />
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
            <CheckCircle2 aria-hidden="true" />
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
            onClick={() => setIsConfirmingNoShow(true)}
          >
            <UserX aria-hidden="true" />
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
            <X aria-hidden="true" />
            Cancelar agendamento
          </Button>
        )}
      </div>

      <NoShowConfirmDialog
        appointment={isConfirmingNoShow ? appointment : null}
        isConfirming={isLoading}
        onConfirm={handleNoShowConfirm}
        onCancel={() => setIsConfirmingNoShow(false)}
      />
    </div>
  )
}
