import { ConfirmDialog } from '@/components/common/ConfirmDialog'

import type { Appointment } from '../../types/scheduling.types'

type NoShowConfirmDialogProps = {
  appointment: Appointment | null
  isConfirming: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function NoShowConfirmDialog({
  appointment,
  isConfirming,
  onConfirm,
  onCancel,
}: NoShowConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={appointment !== null}
      tone="warning"
      title="Registrar falta?"
      subject={appointment?.patientName}
      description="O agendamento será marcado como “Não compareceu”. Esta alteração não pode ser desfeita."
      confirmLabel="Registrar falta"
      cancelLabel="Voltar"
      isConfirming={isConfirming}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
