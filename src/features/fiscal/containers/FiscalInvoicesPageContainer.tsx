import { FileText, Loader2, RefreshCw, Settings2, ShieldAlert, Stethoscope } from 'lucide-react'
import { useRef, useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { ListPageShell } from '@/components/common/ListPageShell'
import { PanelCard } from '@/components/common/PanelCard'
import { PlanUpgradeNotice } from '@/components/common/PlanUpgradeNotice'
import { AppPage } from '@/components/layout/AppPage'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { HomeDashboardHeader } from '@/features/home/components/HomeDashboardHeader'
import { brazilTodayIso } from '@/lib/brazil-timezone'
import { formatCepBR, formatCpfCnpjBR } from '@/lib/field-formatters'

import { AppointmentInvoicePickerModal } from '../components/AppointmentInvoicePickerModal'
import { FiscalInvoiceFiltersBar } from '../components/FiscalInvoiceFiltersBar'
import { FiscalProfileForm } from '../components/FiscalProfileForm'
import { FiscalSummaryKpiGrid } from '../components/FiscalSummaryKpiGrid'
import { InvoiceDetails } from '../components/InvoiceDetails'
import { InvoiceForm } from '../components/InvoiceForm'
import { InvoiceList } from '../components/InvoiceList'
import { INVOICE_FIELD_LIMITS } from '../constants/invoice-field-limits'
import { useFiscalInvoicesPage } from '../hooks/useFiscalInvoicesPage'
import { getAppointmentInvoiceDraft } from '../services/fiscal.service'
import type { FiscalProfilePayload, InvoicePayload, ServiceInvoice } from '../types/fiscal.types'
import { getMissingFiscalProfileFields } from '../utils/fiscal-profile-completeness'
import { toInvoiceFormContact } from '../utils/invoice-request'

type ActiveWorkspace = 'profile' | 'form' | 'details' | 'none'

const emptyInvoiceForm: InvoicePayload = {
  customerName: '',
  customerDocument: '',
  customerEmail: '',
  customerPhone: '',
  serviceDescription: '',
  serviceCode: '',
  amountCents: 0,
  competenceDate: brazilTodayIso(),
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
  const [cancelReason, setCancelReason] = useState('')
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [simulateTarget, setSimulateTarget] = useState<ServiceInvoice | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [pendingInvoiceId, setPendingInvoiceId] = useState<string | null>(null)
  const [isInvoiceSaving, setIsInvoiceSaving] = useState(false)
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const [draftLoadError, setDraftLoadError] = useState<string | null>(null)
  const [appointmentWarnings, setAppointmentWarnings] = useState<{
    paymentPending: boolean
    hasExistingInvoice: boolean
    existingInvoiceId: string | null
  } | null>(null)

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
    planBlocked,
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
  // Mirrors the API issuing guard: a draft profile can be saved incomplete,
  // but simulating needs the required fiscal data.
  const missingFiscalFields = getMissingFiscalProfileFields(profile)

  function scrollToWorkspace() {
    window.requestAnimationFrame(() => {
      const workspace = workspaceRef.current
      if (!workspace) return

      workspace.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function openProfileForm() {
    setProfileForm(
      profile
        ? {
            legalName: profile.legalName,
            tradeName: profile.tradeName ?? '',
            documentType: profile.documentType,
            documentNumber: formatCpfCnpjBR(profile.documentNumber),
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
            addressZipCode: formatCepBR(profile.addressZipCode),
            cityIbgeCode: profile.cityIbgeCode ?? '',
          }
        : emptyProfileForm,
    )
    setIsProfileFormOpen(true)
    setActiveWorkspace('profile')
    scrollToWorkspace()
  }

  function openInvoiceForm(invoice?: ServiceInvoice) {
    setEditingInvoice(invoice ?? null)
    setInvoiceForm(
      invoice
        ? {
            customerName: invoice.customerName,
            ...toInvoiceFormContact(invoice.customerDocument, invoice.customerPhone),
            customerEmail: invoice.customerEmail ?? '',
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
    scrollToWorkspace()
  }

  async function handleAppointmentSelect(appointmentId: string) {
    setIsLoadingDraft(true)
    setDraftLoadError(null)
    try {
      const result = await getAppointmentInvoiceDraft(appointmentId)
      setAppointmentWarnings({
        paymentPending: result.warnings.paymentPending,
        hasExistingInvoice: result.warnings.hasExistingInvoice,
        existingInvoiceId: result.existingInvoice?.id ?? null,
      })
      setEditingInvoice(null)
      setInvoiceForm({
        ...emptyInvoiceForm,
        ...result.draft,
        customerEmail: result.draft.customerEmail ?? '',
        ...toInvoiceFormContact(null, result.draft.customerPhone ?? null),
        serviceCode: '',
        notes: '',
      })
      setIsInvoiceFormOpen(true)
      setActiveWorkspace('form')
      scrollToWorkspace()
    } catch {
      setDraftLoadError(
        'Não foi possível carregar os dados da consulta para a nota fiscal. Tente novamente.',
      )
    } finally {
      setIsLoadingDraft(false)
    }
  }

  async function submitInvoice() {
    if (isInvoiceSaving) return
    setIsInvoiceSaving(true)
    try {
      await saveInvoice(invoiceForm, editingInvoice)
      setIsInvoiceFormOpen(false)
      if (activeWorkspace === 'form') setActiveWorkspace('none')
      setEditingInvoice(null)
      setInvoiceForm(emptyInvoiceForm)
      setAppointmentWarnings(null)
    } catch {
      // O hook já exibe o alerta em português; manter o formulário aberto ajuda na correção.
    } finally {
      setIsInvoiceSaving(false)
    }
  }

  async function handleMarkReady(invoice: ServiceInvoice) {
    if (pendingInvoiceId) return
    setPendingInvoiceId(invoice.id)
    try {
      await markReady(invoice)
    } catch {
      // O hook já exibe o alerta em português.
    } finally {
      setPendingInvoiceId(null)
    }
  }

  async function confirmSimulate() {
    if (!simulateTarget) return
    setIsSimulating(true)
    setPendingInvoiceId(simulateTarget.id)
    try {
      await simulateIssue(simulateTarget)
      setSimulateTarget(null)
    } catch {
      // O hook já exibe o alerta em português.
    } finally {
      setIsSimulating(false)
      setPendingInvoiceId(null)
    }
  }

  async function submitProfile() {
    setIsProfileSaving(true)
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
    } finally {
      setIsProfileSaving(false)
    }
  }

  async function confirmCancel() {
    if (!cancelTarget) return
    setIsCancelling(true)
    try {
      await cancel(cancelTarget, cancelReason.trim())
      setCancelTarget(null)
      setCancelReason('')
    } catch {
      // O hook já exibe o alerta em português.
    } finally {
      setIsCancelling(false)
    }
  }

  async function openInvoiceDetails(invoice: ServiceInvoice) {
    setActiveWorkspace('details')
    try {
      await loadInvoiceDetails(invoice)
      scrollToWorkspace()
    } catch {
      setActiveWorkspace('none')
    }
  }

  function closeInvoiceDetails() {
    setSelectedInvoice(null)
    if (activeWorkspace === 'details') setActiveWorkspace('none')
  }

  function clearFilters() {
    setFilters((current) => ({
      ...current,
      customer: undefined,
      status: undefined,
      to: undefined,
      page: 1,
    }))
  }

  if (planBlocked) return <PlanUpgradeNotice title="Notas fiscais" />

  return (
    <AppPage>
      <HomeDashboardHeader
        eyebrow="Fiscal"
        title="Notas fiscais"
        description="Emita, acompanhe e organize notas fiscais da clínica com segurança, histórico e status fiscal em um só lugar."
        actions={
          <div className="flex flex-col gap-2 sm:flex-row *:w-full sm:*:w-auto">
            <Button variant="outline" onClick={load}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Atualizar
            </Button>
            {isFiscalConfigurationIncomplete && isOwner && (
              <Button onClick={openProfileForm}>
                <Settings2 className="h-4 w-4" aria-hidden="true" />
                Configurar dados fiscais
              </Button>
            )}
            {(!isFiscalConfigurationIncomplete || isAssistant) && (
              <>
                <Button
                  variant="outline"
                  disabled={isLoadingDraft}
                  onClick={() => {
                    setDraftLoadError(null)
                    setIsPickerOpen(true)
                  }}
                >
                  {isLoadingDraft ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Stethoscope className="h-4 w-4" aria-hidden="true" />
                  )}
                  Gerar a partir de consulta
                </Button>
                <Button
                  onClick={() => {
                    setAppointmentWarnings(null)
                    openInvoiceForm()
                  }}
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Criar nota fiscal
                </Button>
              </>
            )}
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
          {profileResponse?.providerMode === 'LOCAL' && (
            <InlineFeedback tone="warning">
              <div className="flex gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p>
                  Modo local/simulação ativo. Você pode organizar rascunhos e validar o fluxo de
                  notas; a emissão real depende da configuração fiscal da clínica.
                </p>
              </div>
            </InlineFeedback>
          )}

          {summary && (
            <section>
              <FiscalSummaryKpiGrid summary={summary} />
            </section>
          )}

          <PanelCard>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {profile?.isConfigured
                    ? 'Configuração fiscal completa'
                    : 'Configuração fiscal pendente'}
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Gerencie os dados da clínica usados para emissão real de NFS-e.
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

          {draftLoadError && <InlineFeedback tone="error">{draftLoadError}</InlineFeedback>}

          {isWorkspaceOpen && (
            <div
              ref={workspaceRef}
              className="scroll-mt-24 space-y-4"
              aria-label="Área de trabalho fiscal"
            >
              <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Área de trabalho</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    O painel aberto abaixo concentra a ação selecionada.
                  </p>
                </div>
                {activeWorkspaceLabel && (
                  <span className="inline-flex w-fit rounded-full border border-primary/25 bg-card px-3 py-1 text-xs font-semibold text-primary">
                    {activeWorkspaceLabel}
                  </span>
                )}
              </div>

              {isProfileFormOpen && (
                <div>
                  <FiscalProfileForm
                    form={profileForm}
                    savedIdentity={
                      profile
                        ? { documentNumber: profile.documentNumber, taxRegime: profile.taxRegime }
                        : null
                    }
                    onChange={setProfileForm}
                    onCancel={() => {
                      setIsProfileFormOpen(false)
                      if (activeWorkspace === 'profile') setActiveWorkspace('none')
                    }}
                    onSubmit={submitProfile}
                    isSaving={isProfileSaving}
                  />
                </div>
              )}

              {isInvoiceFormOpen && (
                <div className="space-y-3">
                  {appointmentWarnings?.paymentPending && (
                    <div role="alert">
                      <InlineFeedback tone="warning">
                        <p className="font-semibold">Consulta com pagamento pendente</p>
                        <p className="mt-1 leading-6">
                          O pagamento desta consulta ainda não foi registrado. Verifique o valor
                          antes de salvar a nota.
                        </p>
                      </InlineFeedback>
                    </div>
                  )}
                  {appointmentWarnings?.hasExistingInvoice && (
                    <div role="alert">
                      <InlineFeedback tone="warning">
                        <p className="font-semibold">
                          Já existe uma nota vinculada a esta consulta
                        </p>
                        <p className="mt-1 leading-6">
                          Uma consulta só pode ter uma nota ativa, por isso o salvamento será
                          recusado. Para gerar outra nota, cancele a nota existente ou edite-a na
                          lista abaixo.
                        </p>
                      </InlineFeedback>
                    </div>
                  )}
                  <InvoiceForm
                    form={invoiceForm}
                    editing={!!editingInvoice}
                    isSaving={isInvoiceSaving}
                    onChange={setInvoiceForm}
                    onCancel={() => {
                      setIsInvoiceFormOpen(false)
                      if (activeWorkspace === 'form') setActiveWorkspace('none')
                      setAppointmentWarnings(null)
                    }}
                    onSubmit={submitInvoice}
                  />
                </div>
              )}

              {selectedInvoice && (
                <div>
                  <InvoiceDetails invoice={selectedInvoice} onClose={closeInvoiceDetails} />
                </div>
              )}
            </div>
          )}

          <FiscalInvoiceFiltersBar
            customer={filters.customer ?? ''}
            status={filters.status}
            to={filters.to ?? ''}
            onCustomerChange={(value) => setFilter('customer', value)}
            onStatusChange={(value) => setFilter('status', value)}
            onToChange={(value) => setFilter('to', value)}
            onClear={clearFilters}
          />

          <InvoiceList
            invoices={invoices}
            userRole={user?.role}
            isOwner={isOwner}
            profile={profile}
            page={filters.page}
            totalPages={totalPages}
            total={total}
            limit={filters.limit}
            pendingInvoiceId={pendingInvoiceId}
            onViewDetails={(invoice) => {
              void openInvoiceDetails(invoice)
            }}
            onEdit={openInvoiceForm}
            onMarkReady={(invoice) => {
              void handleMarkReady(invoice)
            }}
            onSimulate={setSimulateTarget}
            onCancel={setCancelTarget}
            onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
            onPageSizeChange={(limit) => setFilters((current) => ({ ...current, page: 1, limit }))}
          />
        </div>
      </ListPageShell>

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancelar nota fiscal"
        subject={cancelTarget ? describeInvoice(cancelTarget) : undefined}
        description="A nota será cancelada apenas no controle interno. Nenhuma NFS-e real será cancelada."
        confirmLabel="Cancelar nota"
        cancelLabel="Voltar"
        confirmDisabled={cancelReason.trim().length === 0}
        isConfirming={isCancelling}
        onCancel={() => {
          setCancelTarget(null)
          setCancelReason('')
        }}
        onConfirm={confirmCancel}
      >
        <div className="space-y-1">
          <FormField label="Motivo do cancelamento" htmlFor="cancelReason">
            <TextInput
              id="cancelReason"
              value={cancelReason}
              maxLength={INVOICE_FIELD_LIMITS.cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex.: erro nos dados do tomador, duplicidade ou cancelamento solicitado"
            />
          </FormField>
          <p className="text-xs text-muted-foreground">
            Esse motivo será registrado no histórico da nota.
          </p>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!simulateTarget}
        tone="warning"
        title="Simular emissão da nota?"
        subject={simulateTarget ? describeInvoice(simulateTarget) : undefined}
        description="A nota passará para o status Simulada e não poderá mais ser editada. A simulação é local e não gera uma NFS-e com validade fiscal."
        confirmLabel="Simular emissão"
        cancelLabel="Voltar"
        isConfirming={isSimulating}
        confirmDisabled={missingFiscalFields.length > 0}
        onCancel={() => setSimulateTarget(null)}
        onConfirm={confirmSimulate}
      >
        {missingFiscalFields.length > 0 && (
          <p className="text-sm leading-6 text-destructive" role="alert">
            Complete os dados fiscais da clínica antes de simular. Falta:{' '}
            {missingFiscalFields.join(', ')}.
          </p>
        )}
      </ConfirmDialog>

      <AppointmentInvoicePickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(appointmentId) => {
          setIsPickerOpen(false)
          void handleAppointmentSelect(appointmentId)
        }}
      />
    </AppPage>
  )
}

function describeInvoice(invoice: ServiceInvoice) {
  const number = invoice.invoiceNumber ? `Nota nº ${invoice.invoiceNumber} · ` : ''
  return `${number}${invoice.customerName}`
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
