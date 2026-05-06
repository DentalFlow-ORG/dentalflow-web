import { FileText, RefreshCw, Settings2, ShieldAlert } from 'lucide-react'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DatePickerInput } from '@/components/common/DatePickerInput'
import { EmptyState } from '@/components/common/EmptyState'
import { FormField, TextInput } from '@/components/common/FormField'
import { ListPageShell } from '@/components/common/ListPageShell'
import { MetricCard } from '@/components/common/MetricCard'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/features/auth/hooks/useAuth'

import { FiscalProfileForm } from '../components/FiscalProfileForm'
import { InvoiceDetails } from '../components/InvoiceDetails'
import { InvoiceForm } from '../components/InvoiceForm'
import { INVOICE_STATUS_LABEL, INVOICE_STATUS_TONE } from '../constants/invoice-status'
import { useFiscalInvoicesPage } from '../hooks/useFiscalInvoicesPage'
import type {
  FiscalProfilePayload,
  InvoicePayload,
  ServiceInvoice,
  ServiceInvoiceStatus,
} from '../types/fiscal.types'
import { formatCents, formatInvoiceDate } from '../utils/invoice-format'

const emptyInvoiceForm: InvoicePayload = {
  customerName: '',
  customerDocument: '',
  customerEmail: '',
  customerPhone: '',
  serviceDescription: '',
  serviceCode: '',
  amountCents: 0,
  competenceDate: new Date().toISOString().slice(0, 10),
  notes: '',
}

const emptyProfileForm: FiscalProfilePayload = {
  legalName: '',
  tradeName: '',
  documentType: 'CNPJ',
  documentNumber: '',
  municipalRegistration: '',
  stateRegistration: '',
  taxRegime: 'SIMPLES_NACIONAL',
  specialTaxRegime: '',
  serviceCode: '',
  cnae: '',
  issRate: null,
  addressStreet: '',
  addressNumber: '',
  addressComplement: '',
  addressNeighborhood: '',
  addressCity: '',
  addressState: '',
  addressZipCode: '',
  cityIbgeCode: '',
  fiscalProvider: 'LOCAL',
  fiscalProviderMode: 'LOCAL',
}

export function FiscalInvoicesPageContainer() {
  const { user } = useAuth()
  const isOwner = user?.role === 'OWNER'
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<ServiceInvoice | null>(null)
  const [invoiceForm, setInvoiceForm] = useState<InvoicePayload>(emptyInvoiceForm)
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false)
  const [profileForm, setProfileForm] = useState<FiscalProfilePayload>(emptyProfileForm)
  const [cancelTarget, setCancelTarget] = useState<ServiceInvoice | null>(null)

  const {
    profileResponse,
    summary,
    invoices,
    selectedInvoice,
    setSelectedInvoice,
    total,
    totalPages,
    isLoading,
    loadError,
    filters,
    setFilters,
    setFilter,
    load,
    saveProfile,
    saveInvoice,
    markReady,
    simulateIssue,
    cancel,
    loadInvoiceDetails,
  } = useFiscalInvoicesPage()

  const profile = profileResponse?.profile ?? null

  function openProfileForm() {
    setProfileForm(
      profile
        ? {
            legalName: profile.legalName,
            tradeName: profile.tradeName ?? '',
            documentType: profile.documentType,
            documentNumber: profile.documentNumber,
            municipalRegistration: profile.municipalRegistration ?? '',
            stateRegistration: profile.stateRegistration ?? '',
            taxRegime: profile.taxRegime,
            specialTaxRegime: profile.specialTaxRegime ?? '',
            serviceCode: profile.serviceCode ?? '',
            cnae: profile.cnae ?? '',
            issRate: profile.issRate,
            addressStreet: profile.addressStreet,
            addressNumber: profile.addressNumber,
            addressComplement: profile.addressComplement ?? '',
            addressNeighborhood: profile.addressNeighborhood,
            addressCity: profile.addressCity,
            addressState: profile.addressState,
            addressZipCode: profile.addressZipCode,
            cityIbgeCode: profile.cityIbgeCode ?? '',
            fiscalProvider: profile.fiscalProvider,
            fiscalProviderMode: profile.fiscalProviderMode,
          }
        : emptyProfileForm,
    )
    setIsProfileFormOpen(true)
  }

  function openInvoiceForm(invoice?: ServiceInvoice) {
    setEditingInvoice(invoice ?? null)
    setInvoiceForm(
      invoice
        ? {
            customerName: invoice.customerName,
            customerDocument: invoice.customerDocument ?? '',
            customerEmail: invoice.customerEmail ?? '',
            customerPhone: invoice.customerPhone ?? '',
            serviceDescription: invoice.serviceDescription,
            serviceCode: invoice.serviceCode ?? '',
            amountCents: invoice.amountCents,
            deductionsCents: invoice.deductionsCents ?? undefined,
            issRate: invoice.issRate ? Number(invoice.issRate) : undefined,
            competenceDate: invoice.competenceDate.slice(0, 10),
            notes: invoice.notes ?? '',
          }
        : emptyInvoiceForm,
    )
    setIsInvoiceFormOpen(true)
  }

  async function submitInvoice() {
    try {
      await saveInvoice(invoiceForm, editingInvoice)
      setIsInvoiceFormOpen(false)
      setEditingInvoice(null)
      setInvoiceForm(emptyInvoiceForm)
    } catch {
      // O hook já exibe o alerta em português; manter o formulário aberto ajuda na correção.
    }
  }

  async function submitProfile() {
    try {
      await saveProfile({
        ...profileForm,
        addressState: profileForm.addressState.trim().toUpperCase(),
        issRate: profileForm.issRate === '' ? null : profileForm.issRate,
      })
      setIsProfileFormOpen(false)
    } catch {
      // O hook já exibe o alerta em português; manter o formulário aberto ajuda na correção.
    }
  }

  async function confirmCancel() {
    if (!cancelTarget) return
    try {
      await cancel(cancelTarget, 'Cancelamento interno')
      setCancelTarget(null)
    } catch {
      // O hook já exibe o alerta em português.
    }
  }

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Fiscal"
        title="Notas fiscais"
        description="Prepare, organize e acompanhe as notas fiscais de serviço da clínica."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={load}>
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button onClick={() => openInvoiceForm()}>
              <FileText className="h-4 w-4" />
              Criar nota fiscal
            </Button>
          </div>
        }
      />

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando notas fiscais..."
        error={loadError}
        onRetry={load}
      >
        <div className="space-y-6">
          <PanelCard className="border-amber-200 bg-amber-50/80">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <h2 className="text-sm font-semibold text-amber-950">
                  Integração fiscal em modo local/simulação
                </h2>
                <p className="mt-1 text-sm leading-6 text-amber-900">
                  A emissão real de NFS-e ainda não está ativa. No momento, este módulo funciona
                  como controle interno e simulação. Para emitir notas fiscais válidas, será
                  necessário configurar uma integração fiscal homologada.
                </p>
              </div>
            </div>
          </PanelCard>

          {summary && (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
              <MetricCard value={String(summary.counts.DRAFT ?? 0)} label="Rascunhos" />
              <MetricCard
                value={String(summary.counts.READY_TO_ISSUE ?? 0)}
                label="Prontas para emissão"
              />
              <MetricCard value={String(summary.counts.SIMULATED ?? 0)} label="Simuladas" />
              <MetricCard value={String(summary.counts.CANCELED ?? 0)} label="Canceladas" />
              <MetricCard value={formatCents(summary.monthTotalCents)} label="Valor total do mês" />
              <MetricCard
                value={summary.configurationPending ? '1' : '0'}
                label="Pendências de configuração"
              />
            </section>
          )}

          <PanelCard>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  {profile?.isConfigured
                    ? 'Configuração fiscal completa'
                    : 'Configuração fiscal pendente'}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Integração fiscal real ainda não configurada. Esses dados serão usados futuramente
                  para emissão real de NFS-e.
                </p>
              </div>
              <Button variant="outline" onClick={openProfileForm} disabled={!isOwner}>
                <Settings2 className="h-4 w-4" />
                Configurar dados fiscais
              </Button>
            </div>
          </PanelCard>

          {isProfileFormOpen && (
            <FiscalProfileForm
              form={profileForm}
              onChange={setProfileForm}
              onCancel={() => setIsProfileFormOpen(false)}
              onSubmit={submitProfile}
            />
          )}

          {isInvoiceFormOpen && (
            <InvoiceForm
              form={invoiceForm}
              editing={!!editingInvoice}
              onChange={setInvoiceForm}
              onCancel={() => setIsInvoiceFormOpen(false)}
              onSubmit={submitInvoice}
            />
          )}

          {selectedInvoice && (
            <InvoiceDetails invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
          )}

          <PanelCard>
            <div className="mb-4 grid gap-3 lg:grid-cols-4">
              <FormField label="Cliente" htmlFor="invoiceCustomer" className="lg:col-span-2">
                <TextInput
                  id="invoiceCustomer"
                  placeholder="Buscar por cliente..."
                  value={filters.customer ?? ''}
                  onChange={(e) => setFilter('customer', e.target.value)}
                />
              </FormField>
              <FormField label="Status" htmlFor="invoiceStatus">
                <Select
                  value={filters.status ?? '__all__'}
                  onValueChange={(value) =>
                    setFilter(
                      'status',
                      (value === '__all__' ? undefined : value) as ServiceInvoiceStatus,
                    )
                  }
                >
                  <SelectTrigger id="invoiceStatus">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todos</SelectItem>
                    {Object.entries(INVOICE_STATUS_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Competência até" htmlFor="invoiceTo">
                <DatePickerInput
                  id="invoiceTo"
                  value={filters.to ?? ''}
                  onValueChange={(value) => setFilter('to', value)}
                />
              </FormField>
            </div>

            {invoices.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Nenhuma nota fiscal encontrada"
                description="Crie rascunhos para organizar a futura emissão de NFS-e da clínica."
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-230 text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3">Serviço</th>
                        <th className="px-4 py-3 text-right">Valor</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Competência</th>
                        <th className="px-4 py-3">Criada em</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{invoice.customerName}</p>
                            <p className="text-xs text-slate-500">
                              {invoice.customerEmail ?? invoice.customerDocument ?? 'Sem contato'}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {invoice.serviceDescription}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-900">
                            {formatCents(invoice.amountCents)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge tone={INVOICE_STATUS_TONE[invoice.status]}>
                              {INVOICE_STATUS_LABEL[invoice.status]}
                            </StatusBadge>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {formatInvoiceDate(invoice.competenceDate)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {formatInvoiceDate(invoice.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  void loadInvoiceDetails(invoice).catch(() => undefined)
                                }}
                              >
                                Ver detalhes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openInvoiceForm(invoice)}
                                disabled={!['DRAFT', 'READY_TO_ISSUE'].includes(invoice.status)}
                              >
                                Editar
                              </Button>
                              {isOwner && invoice.status === 'DRAFT' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    void markReady(invoice).catch(() => undefined)
                                  }}
                                >
                                  Marcar pronta
                                </Button>
                              )}
                              {isOwner && invoice.status === 'READY_TO_ISSUE' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    void simulateIssue(invoice).catch(() => undefined)
                                  }}
                                >
                                  Simular emissão
                                </Button>
                              )}
                              {isOwner && invoice.status !== 'CANCELED' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCancelTarget(invoice)}
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
                <div className="border-t border-slate-100 px-4 py-3">
                  <Pagination
                    page={filters.page}
                    totalPages={totalPages}
                    filteredCount={total}
                    pageSize={filters.limit}
                    onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
                    onPageSizeChange={(limit) =>
                      setFilters((current) => ({ ...current, page: 1, limit }))
                    }
                  />
                </div>
              </div>
            )}
          </PanelCard>
        </div>
      </ListPageShell>

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancelar nota fiscal"
        description="A nota será cancelada apenas no controle interno. Nenhuma NFS-e real será cancelada."
        confirmLabel="Cancelar nota"
        cancelLabel="Voltar"
        onCancel={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
    </AppPage>
  )
}
