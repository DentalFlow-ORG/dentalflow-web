import { useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField, TextArea } from '@/components/common/FormField'

import { CANCELLATION_REASON_MAX_LENGTH } from '../../constants/appointment-form'

type CancelAppointmentDialogProps = {
  open: boolean
  patientName: string
  isCanceling: boolean
  onCancel: () => void
  onConfirm: (reason: string) => void
}

export function CancelAppointmentDialog({
  open,
  patientName,
  isCanceling,
  onCancel,
  onConfirm,
}: CancelAppointmentDialogProps) {
  const [reason, setReason] = useState('')
  const [wasOpen, setWasOpen] = useState(open)

  // A new cancellation starts with an empty reason. The text is kept while the
  // dialog stays open, so a failed request does not lose what was typed.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setReason('')
  }

  return (
    <ConfirmDialog
      open={open}
      title="Cancelar agendamento"
      subject={patientName}
      description="O agendamento deste paciente será cancelado e o horário ficará livre na agenda."
      confirmLabel="Confirmar cancelamento"
      cancelLabel="Voltar"
      isConfirming={isCanceling}
      onConfirm={() => onConfirm(reason.trim())}
      onCancel={onCancel}
    >
      <FormField
        label="Motivo do cancelamento"
        htmlFor="cancellationReason"
        optional
        hint={`Até ${CANCELLATION_REASON_MAX_LENGTH} caracteres.`}
      >
        <TextArea
          id="cancellationReason"
          placeholder="Informe o motivo (opcional)"
          maxLength={CANCELLATION_REASON_MAX_LENGTH}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="min-h-0"
          disabled={isCanceling}
        />
      </FormField>
    </ConfirmDialog>
  )
}
