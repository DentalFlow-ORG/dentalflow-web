import { Printer } from 'lucide-react'

import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'

import { INVOICE_STATUS_LABEL, INVOICE_STATUS_TONE } from '../constants/invoice-status'
import type { ServiceInvoice } from '../types/fiscal.types'
import { formatCents, formatInvoiceDate } from '../utils/invoice-format'
import { printInvoice } from '../utils/print-invoice'

type Props = {
  invoice: ServiceInvoice
  onClose: () => void
}

export function InvoiceDetails({ invoice, onClose }: Props) {
  return (
    <PanelCard>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Detalhes da nota fiscal</h2>
          <p className="mt-1 text-sm text-slate-500">
            Documento sem validade fiscal. Modo da integração: Local/Simulação.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => printInvoice(invoice)}>
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Status atual</p>
          <div className="mt-2">
            <StatusBadge tone={INVOICE_STATUS_TONE[invoice.status]}>
              {INVOICE_STATUS_LABEL[invoice.status]}
            </StatusBadge>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Cliente</p>
          <p className="mt-2 font-semibold text-slate-900">{invoice.customerName}</p>
          <p className="text-sm text-slate-500">{invoice.customerDocument ?? 'Sem documento'}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Valor</p>
          <p className="mt-2 font-semibold text-slate-900">{formatCents(invoice.amountCents)}</p>
          <p className="text-sm text-slate-500">
            Competência {formatInvoiceDate(invoice.competenceDate)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Dados do serviço</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{invoice.serviceDescription}</p>
          <p className="mt-1 text-sm text-slate-500">
            Código de serviço: {invoice.serviceCode ?? '-'}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Linha do tempo</h3>
          {invoice.events?.length ? (
            <div className="mt-2 space-y-2">
              {invoice.events.map((event) => (
                <div key={event.id} className="rounded-md border border-slate-200 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-800">{event.eventType}</p>
                  <p className="text-xs text-slate-500">
                    {event.previousStatus ? INVOICE_STATUS_LABEL[event.previousStatus] : '-'} →{' '}
                    {event.nextStatus ? INVOICE_STATUS_LABEL[event.nextStatus] : '-'} ·{' '}
                    {formatInvoiceDate(event.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Nenhum evento registrado.</p>
          )}
        </div>
      </div>
    </PanelCard>
  )
}
