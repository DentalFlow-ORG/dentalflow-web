import { Printer } from 'lucide-react'

import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'

import { getInvoiceEventLabel } from '../constants/invoice-events'
import { INVOICE_STATUS_LABEL, INVOICE_STATUS_TONE } from '../constants/invoice-status'
import type { FiscalProviderMode, ServiceInvoice } from '../types/fiscal.types'
import { formatCents, formatInvoiceDate } from '../utils/invoice-format'
import { printInvoice } from '../utils/print-invoice'

const ENVIRONMENT_LABELS: Record<FiscalProviderMode, string> = {
  LOCAL: 'Local/Simulação',
  SANDBOX: 'Sandbox',
  PRODUCTION: 'Produção',
}

type Props = {
  invoice: ServiceInvoice
  onClose: () => void
}

export function InvoiceDetails({ invoice, onClose }: Props) {
  return (
    <PanelCard>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Detalhes da nota fiscal</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Documento sem validade fiscal. Modo da integração:{' '}
            {ENVIRONMENT_LABELS[invoice.environment]}.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            onClick={() => printInvoice(invoice)}
            aria-label="Imprimir nota fiscal"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Imprimir
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            aria-label="Fechar detalhes da nota fiscal"
          >
            Fechar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-muted p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Status atual</p>
          <div className="mt-2">
            <StatusBadge tone={INVOICE_STATUS_TONE[invoice.status]}>
              {INVOICE_STATUS_LABEL[invoice.status]}
            </StatusBadge>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Cliente</p>
          <p className="mt-2 truncate font-semibold text-foreground">{invoice.customerName}</p>
          <p className="truncate text-sm text-muted-foreground">
            {invoice.customerDocument ?? 'Sem documento'}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Valor</p>
          <p className="mt-2 font-semibold text-foreground">{formatCents(invoice.amountCents)}</p>
          <p className="text-sm text-muted-foreground">
            Competência {formatInvoiceDate(invoice.competenceDate)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Dados do serviço</h3>
          <p className="mt-2 text-sm leading-6 text-foreground">{invoice.serviceDescription}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Código de serviço: {invoice.serviceCode ?? '-'}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Linha do tempo</h3>
          {invoice.events?.length ? (
            <div className="mt-2 space-y-2">
              {invoice.events.map((event) => (
                <div key={event.id} className="rounded-md border border-border px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">
                    {getInvoiceEventLabel(event.eventType)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.previousStatus ? INVOICE_STATUS_LABEL[event.previousStatus] : '-'} →{' '}
                    {event.nextStatus ? INVOICE_STATUS_LABEL[event.nextStatus] : '-'} ·{' '}
                    {formatInvoiceDate(event.createdAt)}
                  </p>
                  {event.message && (
                    <p className="mt-1 text-xs text-muted-foreground">{event.message}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
              Nenhum evento registrado.
            </div>
          )}
        </div>
      </div>
    </PanelCard>
  )
}
