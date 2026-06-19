import { FileText } from 'lucide-react'

import { EmptyState } from '@/components/common/EmptyState'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'

import { INVOICE_STATUS_LABEL, INVOICE_STATUS_TONE } from '../constants/invoice-status'
import type { ClinicFiscalProfile, ServiceInvoice } from '../types/fiscal.types'
import {
  canCancelInvoice,
  canSimulateInvoice,
  getInvoiceActionLabel,
} from '../utils/invoice-actions'
import { formatCents, formatInvoiceDate } from '../utils/invoice-format'

type Props = {
  invoices: ServiceInvoice[]
  userRole: string | undefined
  isOwner: boolean
  profile: ClinicFiscalProfile | null
  page: number
  totalPages: number
  total: number
  limit: number
  onViewDetails: (invoice: ServiceInvoice) => void
  onEdit: (invoice: ServiceInvoice) => void
  onMarkReady: (invoice: ServiceInvoice) => void
  onSimulate: (invoice: ServiceInvoice) => void
  onCancel: (invoice: ServiceInvoice) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (limit: number) => void
}

function canEditInvoice(invoice: ServiceInvoice, role?: string): boolean {
  if (role === 'OWNER') return ['DRAFT', 'READY_TO_ISSUE'].includes(invoice.status)
  if (role === 'ASSISTANT') return invoice.status === 'DRAFT'
  return false
}

export function InvoiceList({
  invoices,
  userRole,
  isOwner,
  profile,
  page,
  totalPages,
  total,
  limit,
  onViewDetails,
  onEdit,
  onMarkReady,
  onSimulate,
  onCancel,
  onPageChange,
  onPageSizeChange,
}: Props) {
  return (
    <PanelCard>
      {invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma nota fiscal encontrada"
          description="Crie rascunhos para organizar a futura emissão de NFS-e da clínica."
        />
      ) : (
        <>
          {/* Mobile cards — hidden at md+ */}
          <div className="space-y-3 md:hidden">
            {invoices.map((invoice) => (
              <article
                key={invoice.id}
                className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm"
              >
                {/* Primary: customer name + amount */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {invoice.customerName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {invoice.customerEmail ?? invoice.customerDocument ?? 'Sem contato'}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                    {formatCents(invoice.amountCents)}
                  </span>
                </div>

                {/* Status badge + competence date */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge tone={INVOICE_STATUS_TONE[invoice.status]}>
                    {INVOICE_STATUS_LABEL[invoice.status]}
                  </StatusBadge>
                  <span className="text-xs text-muted-foreground">
                    {formatInvoiceDate(invoice.competenceDate)}
                  </span>
                </div>

                {/* Service description */}
                <p className="mt-2 truncate text-xs text-muted-foreground">
                  {invoice.serviceDescription}
                </p>

                {/* Actions */}
                <div className="mt-3 flex flex-wrap gap-2 border-t border-border/50 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={getInvoiceActionLabel('details', invoice.customerName)}
                    onClick={() => onViewDetails(invoice)}
                  >
                    Ver detalhes
                  </Button>
                  {canEditInvoice(invoice, userRole) && (
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={getInvoiceActionLabel('edit', invoice.customerName)}
                      onClick={() => onEdit(invoice)}
                    >
                      Editar
                    </Button>
                  )}
                  {isOwner && invoice.status === 'DRAFT' && (
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={getInvoiceActionLabel('markReady', invoice.customerName)}
                      onClick={() => onMarkReady(invoice)}
                    >
                      Marcar pronta
                    </Button>
                  )}
                  {isOwner && canSimulateInvoice(invoice.status, profile?.fiscalProviderMode) && (
                    <Button
                      size="sm"
                      aria-label={getInvoiceActionLabel('simulate', invoice.customerName)}
                      onClick={() => onSimulate(invoice)}
                    >
                      Simular emissão
                    </Button>
                  )}
                  {isOwner && canCancelInvoice(invoice.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={getInvoiceActionLabel('cancel', invoice.customerName)}
                      onClick={() => onCancel(invoice)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Desktop table — hidden below md */}
          <div className="hidden overflow-hidden rounded-lg border border-border md:block">
            <div className="app-scrollbar overflow-x-auto">
              <table className="w-full min-w-230 text-sm" aria-label="Notas fiscais">
                <thead>
                  <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="px-4 py-3">
                      Cliente
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Serviço
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Valor
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Competência
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Criada em
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/70">
                      <td className="max-w-[200px] overflow-hidden px-4 py-3">
                        <p className="truncate font-semibold text-foreground">
                          {invoice.customerName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {invoice.customerEmail ?? invoice.customerDocument ?? 'Sem contato'}
                        </p>
                      </td>
                      <td className="max-w-[220px] overflow-hidden px-4 py-3 text-muted-foreground">
                        <p className="truncate">{invoice.serviceDescription}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                        {formatCents(invoice.amountCents)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={INVOICE_STATUS_TONE[invoice.status]}>
                          {INVOICE_STATUS_LABEL[invoice.status]}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatInvoiceDate(invoice.competenceDate)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatInvoiceDate(invoice.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={getInvoiceActionLabel('details', invoice.customerName)}
                            onClick={() => onViewDetails(invoice)}
                          >
                            Ver detalhes
                          </Button>
                          {canEditInvoice(invoice, userRole) && (
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={getInvoiceActionLabel('edit', invoice.customerName)}
                              onClick={() => onEdit(invoice)}
                            >
                              Editar
                            </Button>
                          )}
                          {isOwner && invoice.status === 'DRAFT' && (
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={getInvoiceActionLabel('markReady', invoice.customerName)}
                              onClick={() => onMarkReady(invoice)}
                            >
                              Marcar pronta
                            </Button>
                          )}
                          {isOwner &&
                            canSimulateInvoice(invoice.status, profile?.fiscalProviderMode) && (
                              <Button
                                size="sm"
                                aria-label={getInvoiceActionLabel('simulate', invoice.customerName)}
                                onClick={() => onSimulate(invoice)}
                              >
                                Simular emissão
                              </Button>
                            )}
                          {isOwner && canCancelInvoice(invoice.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={getInvoiceActionLabel('cancel', invoice.customerName)}
                              onClick={() => onCancel(invoice)}
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            className="mt-4 border-t border-border pt-4"
            page={page}
            totalPages={totalPages}
            filteredCount={total}
            pageSize={limit}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}
    </PanelCard>
  )
}
