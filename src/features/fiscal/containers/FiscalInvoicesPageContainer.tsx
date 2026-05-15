import { FileText, RefreshCw, Settings2, ShieldAlert } from 'lucide-react'
import { useRef, useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DatePickerInput } from '@/components/common/DatePickerInput'
import { EmptyState } from '@/components/common/EmptyState'
import { FormField, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
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
import { cn } from '@/lib/utils'

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

type ActiveWorkspace = 'profile' | 'form' | 'details' | 'none'

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
  const isAssistant = user?.role === 'ASSISTANT'
  const workspaceRef = useRef<HTMLDivElement>(null)
  const [activeWorkspace, setActiveWorkspace] = useState<ActiveWorkspace>('none')
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
  const isWorkspaceOpen = isProfileFormOpen || isInvoiceFormOpen || !!selectedInvoice
  const activeWorkspaceLabel = getActiveWorkspaceLabel(activeWorkspace)
  const isFiscalConfigurationIncomplete =
    summary?.configurationPending ?? (profile ? !profile.isConfigured : false)

  function focusWorkspace() {
    window.requestAnimationFrame(() => {
      const workspace = workspaceRef.current
      if (!workspace) return

      workspace.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.setTimeout(() => {
        workspace.focus({ preventScroll: true })
      }, 250)
    })
  }

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
    setActiveWorkspace('profile')
    focusWorkspace()
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
    setActiveWorkspace('form')
    focusWorkspace()
  }

  async function submitInvoice() {
    try {
      await saveInvoice(invoiceForm, editingInvoice)
      setIsInvoiceFormOpen(false)
      if (activeWorkspace === 'form') setActiveWorkspace('none')
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
        issRate: profileForm.issRate,
      })
      setIsProfileFormOpen(false)
      if (activeWorkspace === 'profile') setActiveWorkspace('none')
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

  async function openInvoiceDetails(invoice: ServiceInvoice) {
    setActiveWorkspace('details')
    try {
      await loadInvoiceDetails(invoice)
      focusWorkspace()
    } catch {
      setActiveWorkspace('none')
    }
  }

  function closeInvoiceDetails() {
    setSelectedInvoice(null)
    if (activeWorkspace === 'details') setActiveWorkspace('none')
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
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Atualizar
            </Button>
            {isFiscalConfigurationIncomplete && isOwner ? (
              <Button onClick={openProfileForm} disabled={!isOwner}>
                <Settings2 className="h-4 w-4" aria-hidden="true" />
                Configurar dados fiscais
              </Button>
            ) : !isFiscalConfigurationIncomplete ? (
              <Button onClick={() => openInvoiceForm()}>
                <FileText className="h-4 w-4" aria-hidden="true" />
                Criar nota fiscal
              </Button>
            ) : null}
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
          <InlineFeedback tone="warning">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">Integração fiscal em modo local/simulação</p>
                <p className="mt-1 leading-6">
                  A emissão real de NFS-e ainda não está ativa. No momento, este módulo funciona
                  como controle interno e simulação. Para emitir notas fiscais válidas, será
                  necessário configurar uma integração fiscal homologada.
                </p>
              </div>
            </div>
          </InlineFeedback>

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
                value={summary.configurationPending ? 'Pendente' : 'Ok'}
                label="Configuração fiscal"
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
              {isOwner && (
                <Button variant="outline" onClick={openProfileForm}>
                  <Settings2 className="h-4 w-4" aria-hidden="true" />
                  Configurar dados fiscais
                </Button>
              )}
            </div>
          </PanelCard>

          {isFiscalConfigurationIncomplete && (
            <InlineFeedback tone="warning">
              <div className="max-w-2xl">
                <p className="font-semibold">Configuração fiscal pendente</p>
                <p className="mt-1 leading-6">
                  {isAssistant
                    ? 'A configuração fiscal precisa ser concluída pelo proprietário da clínica antes da criação de novas notas.'
                    : 'Complete os dados fiscais da clínica para criar novas notas fiscais com segurança.'}
                </p>
              </div>
            </InlineFeedback>
          )}

          {isWorkspaceOpen && (
            <div
              ref={workspaceRef}
              tabIndex={-1}
              className="scroll-mt-24 space-y-4 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              aria-label="Área de trabalho fiscal"
            >
              <div className="flex flex-col gap-2 rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">Área de trabalho</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    O painel aberto abaixo concentra a ação selecionada.
                  </p>
                </div>
                {activeWorkspaceLabel && (
                  <span className="inline-flex w-fit rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-primary">
                    {activeWorkspaceLabel}
                  </span>
                )}
              </div>

              {isProfileFormOpen && (
                <div className={getWorkspacePanelClass(activeWorkspace === 'profile')}>
                  <FiscalProfileForm
                    form={profileForm}
                    onChange={setProfileForm}
                    onCancel={() => {
                      setIsProfileFormOpen(false)
                      if (activeWorkspace === 'profile') setActiveWorkspace('none')
                    }}
                    onSubmit={submitProfile}
                  />
                </div>
              )}

              {isInvoiceFormOpen && (
                <div className={getWorkspacePanelClass(activeWorkspace === 'form')}>
                  <InvoiceForm
                    form={invoiceForm}
                    editing={!!editingInvoice}
                    onChange={setInvoiceForm}
                    onCancel={() => {
                      setIsInvoiceFormOpen(false)
                      if (activeWorkspace === 'form') setActiveWorkspace('none')
                    }}
                    onSubmit={submitInvoice}
                  />
                </div>
              )}

              {selectedInvoice && (
                <div className={getWorkspacePanelClass(activeWorkspace === 'details')}>
                  <InvoiceDetails invoice={selectedInvoice} onClose={closeInvoiceDetails} />
                </div>
              )}
            </div>
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
              <div className="space-y-3">
                {/* Mobile card list — hidden on md+ */}
                <div className="space-y-3 md:hidden">
                  {invoices.map((invoice) => (
                    <PanelCard key={invoice.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{invoice.customerName}</p>
                          <p className="truncate text-xs text-slate-500">
                            {invoice.customerEmail ?? invoice.customerDocument ?? 'Sem contato'}
                          </p>
                        </div>
                        <StatusBadge tone={INVOICE_STATUS_TONE[invoice.status]}>
                          {INVOICE_STATUS_LABEL[invoice.status]}
                        </StatusBadge>
                      </div>
                      <p className="mt-2 truncate text-sm text-slate-600">{invoice.serviceDescription}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">{formatCents(invoice.amountCents)}</span>
                        <span className="text-xs text-slate-500">{formatInvoiceDate(invoice.competenceDate)}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            void openInvoiceDetails(invoice)
                          }}
                        >
                          Ver detalhes
                        </Button>
                        {canEditInvoice(invoice, user?.role) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openInvoiceForm(invoice)}
                          >
                            Editar
                          </Button>
                        )}
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
                    </PanelCard>
                  ))}
                </div>

                {/* Desktop table — hidden below md */}
                <div className="hidden overflow-hidden rounded-lg border border-slate-200 md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-230 text-sm" aria-label="Notas fiscais">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <th scope="col" className="px-4 py-3">Cliente</th>
                          <th scope="col" className="px-4 py-3">Serviço</th>
                          <th scope="col" className="px-4 py-3 text-right">Valor</th>
                          <th scope="col" className="px-4 py-3">Status</th>
                          <th scope="col" className="px-4 py-3">Competência</th>
                          <th scope="col" className="px-4 py-3">Criada em</th>
                          <th scope="col" className="px-4 py-3 text-right">Ações</th>
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
                                    void openInvoiceDetails(invoice)
                                  }}
                                >
                                  Ver detalhes
                                </Button>
                                {canEditInvoice(invoice, user?.role) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openInvoiceForm(invoice)}
                                  >
                                    Editar
                                  </Button>
                                )}
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
                </div>

                {/* Shared pagination */}
                <div className="rounded-lg border border-slate-100 bg-white px-4 py-3">
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

function getActiveWorkspaceLabel(activeWorkspace: ActiveWorkspace) {
  const labels: Record<ActiveWorkspace, string | null> = {
    profile: 'Configuração fiscal',
    form: 'Nota fiscal',
    details: 'Detalhes da nota',
    none: null,
  }

  return labels[activeWorkspace]
}

function getWorkspacePanelClass(isActive: boolean) {
  return cn(
    'rounded-xl transition-shadow',
    isActive && 'ring-2 ring-primary/25 ring-offset-2 ring-offset-slate-50',
  )
}

function canEditInvoice(invoice: ServiceInvoice, role?: string) {
  if (role === 'OWNER') return ['DRAFT', 'READY_TO_ISSUE'].includes(invoice.status)
  if (role === 'ASSISTANT') return invoice.status === 'DRAFT'
  return false
}
