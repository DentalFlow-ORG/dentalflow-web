import { Ban, CheckCircle2, Clock } from 'lucide-react'
import { useRef, useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatDateBR, formatDateInputValue } from '@/lib/date-time-formatters'
import { centsToMoneyInput, formatMoneyInputFromDigits } from '@/lib/money-input'
import { formatCurrencyBRLCents } from '@/lib/number-formatters'

import { PAYMENT_METHOD_LABELS } from '../../constants/appointment-display'
import {
  CLEARING_PAYMENT_ACTION_COPY,
  CLEARING_PAYMENT_STATUSES,
  type ClearingPaymentStatus,
  NO_PAYMENT_METHOD,
  PAYMENT_NOTES_MAX_LENGTH,
} from '../../constants/appointment-form'
import { updateAppointmentPayment } from '../../services/scheduling.service'
import type {
  Appointment,
  AppointmentPaymentMethod,
  AppointmentPaymentStatus,
  UpdateAppointmentPaymentDto,
} from '../../types/scheduling.types'
import { moneyInputToOptionalCents } from '../../utils/appointment-form-utils'
import { AppointmentDetailsRow, AppointmentDetailsSection } from './AppointmentDetailsSection'
import { AppointmentPaymentBadge } from './AppointmentPaymentBadge'

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

  // Keyed by the record version so the form reseeds whenever the appointment
  // changes, instead of keeping values seeded from an older copy.
  return (
    <PaymentEditForm
      key={`${appointment.id}:${appointment.updatedAt}`}
      appointment={appointment}
      onUpdated={onUpdated}
      showAlert={showAlert}
    />
  )
}

function PaymentReadOnly({ appointment }: { appointment: Appointment }) {
  return (
    <AppointmentDetailsSection title="Pagamento">
      <AppointmentDetailsRow label="Status">
        <AppointmentPaymentBadge status={appointment.paymentStatus} />
      </AppointmentDetailsRow>
      {appointment.estimatedAmountCents != null && (
        <AppointmentDetailsRow label="Valor previsto">
          {formatCurrencyBRLCents(appointment.estimatedAmountCents)}
        </AppointmentDetailsRow>
      )}
      {appointment.paidAmountCents != null && (
        <AppointmentDetailsRow label="Valor pago">
          {formatCurrencyBRLCents(appointment.paidAmountCents)}
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
  const [estimated, setEstimated] = useState(centsToMoneyInput(appointment.estimatedAmountCents))
  const [paid, setPaid] = useState(centsToMoneyInput(appointment.paidAmountCents))
  const [method, setMethod] = useState<AppointmentPaymentMethod | ''>(
    appointment.paymentMethod ?? '',
  )
  const [paymentDate, setPaymentDate] = useState(() =>
    formatDateInputValue(appointment.paymentDate),
  )
  const [notes, setNotes] = useState(appointment.paymentNotes ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingClearing, setPendingClearing] = useState<ClearingPaymentStatus | null>(null)
  // Guards against a second submit fired before React re-renders the disabled
  // buttons (fast double click / Enter repeat).
  const submittingRef = useRef(false)

  const requiresPaid = status === 'PAID' || status === 'PARTIALLY_PAID'
  const fieldId = (name: string) => `payment-${appointment.id}-${name}`

  const isClearingTransition = (
    target: AppointmentPaymentStatus,
  ): target is ClearingPaymentStatus =>
    (CLEARING_PAYMENT_STATUSES as readonly AppointmentPaymentStatus[]).includes(target) &&
    target !== appointment.paymentStatus

  // Single entry point for every save path: a move into PENDING or CANCELED is
  // always confirmed, whichever button or select produced it.
  const requestSubmit = (overrideStatus?: AppointmentPaymentStatus) => {
    const finalStatus = overrideStatus ?? status
    if (isClearingTransition(finalStatus)) {
      setPendingClearing(finalStatus)
      return
    }
    void handleSubmit(finalStatus)
  }

  const handleSubmit = async (finalStatus: AppointmentPaymentStatus): Promise<boolean> => {
    if (submittingRef.current) return false
    const clearsSettlement = (
      CLEARING_PAYMENT_STATUSES as readonly AppointmentPaymentStatus[]
    ).includes(finalStatus)
    const settles = finalStatus === 'PAID' || finalStatus === 'PARTIALLY_PAID'
    const paidCents = settles ? (moneyInputToOptionalCents(paid) ?? undefined) : undefined

    if (settles && !paidCents) {
      showAlert({
        title: 'Valor obrigatório',
        description: 'Informe o valor pago para confirmar o pagamento.',
        tone: 'error',
      })
      return false
    }

    const dto: UpdateAppointmentPaymentDto = clearsSettlement
      ? {
          paymentStatus: finalStatus,
          estimatedAmountCents: moneyInputToOptionalCents(estimated),
          // Not settled: no paid amount, payment date or method is kept.
          paidAmountCents: null,
          paymentMethod: null,
          paymentDate: null,
          paymentNotes: notes.trim() || undefined,
        }
      : {
          paymentStatus: finalStatus,
          estimatedAmountCents: moneyInputToOptionalCents(estimated),
          paidAmountCents: paidCents,
          paymentMethod: method || null,
          paymentDate: paymentDate || undefined,
          paymentNotes: notes.trim() || undefined,
        }

    submittingRef.current = true
    setIsSubmitting(true)
    try {
      const updated = await updateAppointmentPayment(appointment.id, dto)
      onUpdated(updated)
      showAlert({
        title: 'Pagamento atualizado',
        description: 'As informações de pagamento foram salvas.',
        tone: 'success',
      })
      return true
    } catch (err) {
      showAlert({
        title: 'Erro ao atualizar pagamento',
        description:
          err instanceof Error && err.message
            ? err.message
            : 'Não foi possível atualizar o pagamento. Tente novamente.',
        tone: 'error',
      })
      return false
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  async function handleConfirmClearing() {
    if (!pendingClearing) return
    const succeeded = await handleSubmit(pendingClearing)
    if (succeeded) setPendingClearing(null)
  }

  const clearingCopy = pendingClearing ? CLEARING_PAYMENT_ACTION_COPY[pendingClearing] : null

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
          <FormField label="Status de pagamento" htmlFor={fieldId('status')}>
            <Select value={status} onValueChange={(v) => setStatus(v as AppointmentPaymentStatus)}>
              <SelectTrigger id={fieldId('status')} className="w-full">
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
          <FormField label="Valor previsto (R$)" htmlFor={fieldId('estimated')} optional>
            <TextInput
              id={fieldId('estimated')}
              inputMode="numeric"
              autoComplete="off"
              placeholder="0,00"
              value={estimated}
              onChange={(e) => setEstimated(formatMoneyInputFromDigits(e.target.value))}
            />
          </FormField>

          {/* Paid */}
          <FormField label="Valor pago (R$)" htmlFor={fieldId('paid')} optional={!requiresPaid}>
            <TextInput
              id={fieldId('paid')}
              inputMode="numeric"
              autoComplete="off"
              placeholder="0,00"
              value={paid}
              onChange={(e) => setPaid(formatMoneyInputFromDigits(e.target.value))}
            />
          </FormField>

          {/* Payment method */}
          <FormField label="Forma de pagamento" htmlFor={fieldId('method')} optional>
            <Select
              value={method}
              onValueChange={(v) =>
                setMethod(v === NO_PAYMENT_METHOD ? '' : (v as AppointmentPaymentMethod))
              }
            >
              <SelectTrigger id={fieldId('method')} className="w-full">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PAYMENT_METHOD}>Não informado</SelectItem>
                {(
                  Object.entries(PAYMENT_METHOD_LABELS) as [AppointmentPaymentMethod, string][]
                ).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {/* Payment date */}
          <FormField label="Data do pagamento" htmlFor={fieldId('date')} optional>
            <DatePickerInput
              id={fieldId('date')}
              value={paymentDate}
              onValueChange={setPaymentDate}
              placeholder="DD/MM/AAAA"
            />
          </FormField>

          {/* Notes */}
          <FormField
            label="Observação financeira"
            htmlFor={fieldId('notes')}
            optional
            hint={`Até ${PAYMENT_NOTES_MAX_LENGTH} caracteres.`}
          >
            <TextArea
              id={fieldId('notes')}
              maxLength={PAYMENT_NOTES_MAX_LENGTH}
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
              onClick={() =>
                requestSubmit(
                  status === 'PAYMENT_PENDING' && appointment.paymentStatus === 'PAYMENT_PENDING'
                    ? 'PAID'
                    : undefined,
                )
              }
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
                onClick={() => requestSubmit('PAYMENT_PENDING')}
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
                onClick={() => requestSubmit('CANCELED')}
              >
                <Ban />
                Cancelar cobrança
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={clearingCopy !== null}
        tone="warning"
        title={clearingCopy?.title ?? ''}
        subject={appointment.patientName}
        description={clearingCopy?.description ?? ''}
        confirmLabel={clearingCopy?.confirmLabel}
        cancelLabel="Voltar"
        isConfirming={isSubmitting}
        onConfirm={handleConfirmClearing}
        onCancel={() => setPendingClearing(null)}
      />
    </div>
  )
}
