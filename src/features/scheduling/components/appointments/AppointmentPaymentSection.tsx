import { useState } from 'react'
import { Ban, CheckCircle2, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { formatDateBR, formatDateInputValue } from '@/lib/date-time-formatters'

import { updateAppointmentPayment } from '../../services/scheduling.service'
import type {
  Appointment,
  AppointmentPaymentMethod,
  AppointmentPaymentStatus,
  UpdateAppointmentPaymentDto,
} from '../../types/scheduling.types'
import { centsToReais, reaisToCents } from '../../utils/appointment-form-utils'
import { PAYMENT_METHOD_LABELS } from '../../constants/appointment-display'
import { AppointmentPaymentBadge } from './AppointmentPaymentBadge'
import { AppointmentDetailsSection, AppointmentDetailsRow } from './AppointmentDetailsSection'

type AppointmentPaymentSectionProps = {
  appointment: Appointment
  onUpdated: (updated: Appointment) => void
}

export function AppointmentPaymentSection({
  appointment,
  onUpdated,
}: AppointmentPaymentSectionProps) {
  const { user } = useAuth()
  const { showAlert } = useGlobalAlerts()

  const canEdit = user?.role === 'OWNER' || user?.role === 'ASSISTANT'

  if (!canEdit) {
    return <PaymentReadOnly appointment={appointment} />
  }

  return <PaymentEditForm appointment={appointment} onUpdated={onUpdated} showAlert={showAlert} />
}

function PaymentReadOnly({ appointment }: { appointment: Appointment }) {
  return (
    <AppointmentDetailsSection title="Pagamento">
      <AppointmentDetailsRow label="Status">
        <AppointmentPaymentBadge status={appointment.paymentStatus} />
      </AppointmentDetailsRow>
      {appointment.estimatedAmountCents != null && (
        <AppointmentDetailsRow label="Valor previsto">
          R$ {centsToReais(appointment.estimatedAmountCents)}
        </AppointmentDetailsRow>
      )}
      {appointment.paidAmountCents != null && (
        <AppointmentDetailsRow label="Valor pago">
          R$ {centsToReais(appointment.paidAmountCents)}
        </AppointmentDetailsRow>
      )}
      {appointment.paymentMethod && (
        <AppointmentDetailsRow label="Forma de pagamento">
          {PAYMENT_METHOD_LABELS[appointment.paymentMethod]}
        </AppointmentDetailsRow>
      )}
      {appointment.paymentDate && (
        <AppointmentDetailsRow label="Data do pagamento">
          {formatDateBR(formatDateInputValue(appointment.paymentDate))}
        </AppointmentDetailsRow>
      )}
      {appointment.paymentNotes && (
        <AppointmentDetailsRow label="Observação">{appointment.paymentNotes}</AppointmentDetailsRow>
      )}
    </AppointmentDetailsSection>
  )
}

type ShowAlert = ReturnType<typeof useGlobalAlerts>['showAlert']

function PaymentEditForm({
  appointment,
  onUpdated,
  showAlert,
}: {
  appointment: Appointment
  onUpdated: (updated: Appointment) => void
  showAlert: ShowAlert
}) {
  const [status, setStatus] = useState<AppointmentPaymentStatus>(appointment.paymentStatus)
  const [estimated, setEstimated] = useState(centsToReais(appointment.estimatedAmountCents))
  const [paid, setPaid] = useState(centsToReais(appointment.paidAmountCents))
  const [method, setMethod] = useState<AppointmentPaymentMethod | ''>(
    appointment.paymentMethod ?? '',
  )
  const [paymentDate, setPaymentDate] = useState(
    () => formatDateInputValue(appointment.paymentDate),
  )
  const [notes, setNotes] = useState(appointment.paymentNotes ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requiresPaid = status === 'PAID' || status === 'PARTIALLY_PAID'

  const handleSubmit = async (overrideStatus?: AppointmentPaymentStatus) => {
    const finalStatus = overrideStatus ?? status
    const paidCents = requiresPaid || overrideStatus ? reaisToCents(paid) : undefined
    const estimatedCents = reaisToCents(estimated)

    if ((finalStatus === 'PAID' || finalStatus === 'PARTIALLY_PAID') && !paidCents) {
      showAlert({
        title: 'Valor obrigatório',
        description: 'Informe o valor pago para confirmar o pagamento.',
        tone: 'error',
      })
      return
    }

    const dto: UpdateAppointmentPaymentDto = {
      paymentStatus: finalStatus,
      estimatedAmountCents: estimatedCents,
      paidAmountCents: paidCents,
      paymentMethod: method || undefined,
      paymentDate: paymentDate || undefined,
      paymentNotes: notes.trim() || undefined,
    }

    setIsSubmitting(true)
    try {
      const updated = await updateAppointmentPayment(appointment.id, dto)
      onUpdated(updated)
      showAlert({
        title: 'Pagamento atualizado',
        description: 'As informações de pagamento foram salvas.',
        tone: 'success',
      })
    } catch {
      showAlert({
        title: 'Erro',
        description: 'Não foi possível atualizar o pagamento. Tente novamente.',
        tone: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Pagamento
      </p>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {/* Status badge display */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">Status atual</span>
          <AppointmentPaymentBadge status={appointment.paymentStatus} />
        </div>

        {/* Form fields */}
        <div className="space-y-4 border-t border-border p-4">
          {/* Status select */}
          <FormField label="Status de pagamento">
            <Select value={status} onValueChange={(v) => setStatus(v as AppointmentPaymentStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAYMENT_PENDING">Pagamento pendente</SelectItem>
                <SelectItem value="PAID">Pago</SelectItem>
                <SelectItem value="PARTIALLY_PAID">Pago parcialmente</SelectItem>
                <SelectItem value="REFUNDED">Reembolsado</SelectItem>
                <SelectItem value="CANCELED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {/* Estimated */}
          <FormField label="Valor previsto (R$)" optional>
            <TextInput
              placeholder="Ex: 250,00"
              value={estimated}
              onChange={(e) => setEstimated(e.target.value)}
            />
          </FormField>

          {/* Paid */}
          <FormField label={requiresPaid ? 'Valor pago (R$)' : 'Valor pago (R$)'} optional={!requiresPaid}>
            <TextInput
              placeholder="Ex: 250,00"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
            />
          </FormField>

          {/* Payment method */}
          <FormField label="Forma de pagamento" optional>
            <Select value={method} onValueChange={(v) => setMethod(v as AppointmentPaymentMethod)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PAYMENT_METHOD_LABELS) as [AppointmentPaymentMethod, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </FormField>

          {/* Payment date */}
          <FormField label="Data do pagamento" optional>
            <DatePickerInput
              value={paymentDate}
              onValueChange={setPaymentDate}
              placeholder="DD/MM/AAAA"
            />
          </FormField>

          {/* Notes */}
          <FormField label="Observação financeira" optional>
            <TextArea
              placeholder="Observações sobre o pagamento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="min-h-0"
            />
          </FormField>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              className="w-full justify-start"
              disabled={isSubmitting}
              onClick={() => handleSubmit(status === 'PAYMENT_PENDING' ? 'PAID' : undefined)}
            >
              <CheckCircle2 />
              {status === 'PARTIALLY_PAID' ? 'Salvar pagamento parcial' : 'Confirmar pagamento'}
            </Button>
            {appointment.paymentStatus !== 'PAYMENT_PENDING' && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                disabled={isSubmitting}
                onClick={() => handleSubmit('PAYMENT_PENDING')}
              >
                <Clock />
                Marcar como pendente
              </Button>
            )}
            {appointment.paymentStatus !== 'CANCELED' && appointment.status === 'CANCELED' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                disabled={isSubmitting}
                onClick={() => handleSubmit('CANCELED')}
              >
                <Ban />
                Cancelar cobrança
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
