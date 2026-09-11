import { AlertTriangle, CalendarDays, Loader2, Search, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'

import { FormField, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import { listAppointmentsForInvoice } from '../services/fiscal.service'
import type {
  AppointmentForInvoice,
  AppointmentPaymentStatus,
  AppointmentsForInvoiceFilters,
} from '../types/fiscal.types'
import { formatCents, formatInvoiceDate } from '../utils/invoice-format'

const PAYMENT_STATUS_LABELS: Record<AppointmentPaymentStatus, string> = {
  PAYMENT_PENDING: 'Pagamento pendente',
  PAID: 'Pago',
  PARTIALLY_PAID: 'Pago parcialmente',
  REFUNDED: 'Reembolsado',
  CANCELED: 'Cancelado',
}

type AppointmentInvoicePickerModalProps = {
  open: boolean
  onClose: () => void
  onSelect: (appointmentId: string) => void
}

const EMPTY_FILTERS: AppointmentsForInvoiceFilters = {
  page: 1,
  limit: 20,
}

export function AppointmentInvoicePickerModal({
  open,
  onClose,
  onSelect,
}: AppointmentInvoicePickerModalProps) {
  const [filters, setFilters] = useState<AppointmentsForInvoiceFilters>(EMPTY_FILTERS)
  const [appointments, setAppointments] = useState<AppointmentForInvoice[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingSearch, setPendingSearch] = useState('')

  useEffect(() => {
    if (!open) return
    let isCurrent = true
    setIsLoading(true)
    setError(null)
    async function load() {
      try {
        const result = await listAppointmentsForInvoice(filters)
        if (!isCurrent) return
        setAppointments(result.data)
        setTotal(result.total)
      } catch {
        if (!isCurrent) return
        setError('Não foi possível carregar as consultas. Tente novamente.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }
    void load()
    return () => {
      isCurrent = false
    }
  }, [open, filters])

  function applySearch() {
    setFilters((prev) => ({ ...prev, patient: pendingSearch || undefined, page: 1 }))
  }

  function setFilter<K extends keyof AppointmentsForInvoiceFilters>(
    key: K,
    value: AppointmentsForInvoiceFilters[K],
  ) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  function handleClose() {
    setPendingSearch('')
    setFilters(EMPTY_FILTERS)
    setAppointments([])
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in-0 duration-200" />
        <Dialog.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-2xl bg-background shadow-2xl shadow-black/15',
            'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[80dvh] sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl',
            'animate-in slide-in-from-bottom sm:fade-in-0 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-foreground">
                Gerar nota a partir de consulta
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-muted-foreground">
                Selecione a consulta para preencher automaticamente os dados da nota.
              </Dialog.Description>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleClose}
              aria-label="Fechar"
            >
              <X />
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="border-b border-border bg-amber-50 px-5 py-3 dark:bg-amber-900/20">
            <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                Este módulo organiza dados fiscais e rascunhos internos. A emissão oficial depende
                de integração fiscal habilitada.
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="border-b border-border px-5 py-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <FormField label="Paciente" htmlFor="appointmentInvoicePatientSearch">
                  <div className="flex gap-2">
                    <TextInput
                      id="appointmentInvoicePatientSearch"
                      placeholder="Buscar por nome..."
                      value={pendingSearch}
                      onChange={(e) => setPendingSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={applySearch}
                      aria-label="Buscar"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </FormField>
              </div>
              <FormField label="Status de pagamento" htmlFor="appointmentInvoicePaymentStatus">
                <Select
                  value={filters.paymentStatus ?? '__all__'}
                  onValueChange={(v) =>
                    setFilter(
                      'paymentStatus',
                      v === '__all__' ? undefined : (v as AppointmentPaymentStatus),
                    )
                  }
                >
                  <SelectTrigger id="appointmentInvoicePaymentStatus" className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todos</SelectItem>
                    {(
                      Object.entries(PAYMENT_STATUS_LABELS) as [AppointmentPaymentStatus, string][]
                    ).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Carregando consultas...
              </div>
            ) : error ? (
              <div className="px-5 py-6">
                <InlineFeedback tone="error">{error}</InlineFeedback>
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-sm text-muted-foreground">
                <CalendarDays className="h-8 w-8 opacity-30" aria-hidden="true" />
                <p>Nenhuma consulta encontrada.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {appointments.map((appt) => (
                  <AppointmentRow
                    key={appt.id}
                    appointment={appt}
                    onSelect={() => {
                      onSelect(appt.id)
                      handleClose()
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer pagination */}
          {total > filters.limit && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm text-muted-foreground">
              <span>
                {(filters.page - 1) * filters.limit + 1}–
                {Math.min(filters.page * filters.limit, total)} de {total}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={filters.page * filters.limit >= total}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function AppointmentRow({
  appointment,
  onSelect,
}: {
  appointment: AppointmentForInvoice
  onSelect: () => void
}) {
  const amountCents = appointment.paidAmountCents ?? appointment.estimatedAmountCents

  return (
    <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground">{appointment.patientName}</p>
          {appointment.hasActiveInvoice && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/25 dark:text-amber-300">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              Nota já existe
            </span>
          )}
          {appointment.paymentStatus === 'PAYMENT_PENDING' && (
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/25 dark:text-amber-300">
              Pagamento pendente
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatInvoiceDate(appointment.appointmentDate)}
          {appointment.service && ` · ${appointment.service.name}`}
          {` · ${appointment.profile.displayName}`}
        </p>
        {amountCents != null && (
          <p className="mt-0.5 text-xs font-medium text-foreground">{formatCents(amountCents)}</p>
        )}
      </div>
      <Button
        type="button"
        variant={appointment.hasActiveInvoice ? 'outline' : 'secondary'}
        size="sm"
        className="shrink-0"
        onClick={onSelect}
      >
        Selecionar
      </Button>
    </div>
  )
}
