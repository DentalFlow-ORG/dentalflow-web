import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  Bell,
  Bot,
  Calendar,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  KeyRound,
  Landmark,
  Loader2,
  Package,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Users,
  Unlink,
} from 'lucide-react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { FormField, TextInput } from '@/components/common/FormField'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { PanelCard } from '@/components/common/PanelCard'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import {
  formatPhoneBR,
  formatCepBR,
  formatUf,
  onlyDigits,
} from '@/lib/field-formatters'
import {
  createGoogleCalendarConnectUrl,
  disconnectGoogleCalendar,
  getGoogleCalendarStatus,
  syncGoogleCalendar,
} from '@/features/scheduling/services/calendar-integrations.service'
import type { GoogleCalendarStatus } from '@/features/scheduling/types/calendar-integration.types'
import { getCurrentBillingStatus } from '@/features/billing/services/billing.service'
import type { CurrentBillingStatus } from '@/features/billing/types/billing.types'

import { useClinicProfile } from '../hooks/useClinicProfile'
import type { UpdateClinicProfilePayload } from '../types/settings.types'
import { LEGAL_LINKS, ROLE_INFO, STATUS_INFO } from '../constants/settings-display'

function SettingsPanelSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <PanelCard>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </PanelCard>
  )
}

function LinkRow({
  icon: Icon,
  label,
  description,
  to,
}: {
  icon: React.ElementType
  label: string
  description: string
  to: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-4 rounded-md px-1 py-2 transition-all hover:bg-primary/5 dark:hover:bg-white/[0.06]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{label}</p>
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  )
}

function ClinicProfileSection() {
  const { profile, isLoading, error, save, isSaving, saveError } = useClinicProfile()
  const { showAlert } = useGlobalAlerts()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    websiteUrl: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        email: profile.email ?? '',
        phone: profile.phone ? formatPhoneBR(profile.phone) : '',
        websiteUrl: profile.websiteUrl ?? '',
        addressLine1: profile.addressLine1 ?? '',
        addressLine2: profile.addressLine2 ?? '',
        city: profile.city ?? '',
        state: profile.state ?? '',
        postalCode: profile.postalCode ? formatCepBR(profile.postalCode) : '',
      })
    }
  }, [profile])

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload: UpdateClinicProfilePayload = {}
    if (form.name.trim()) payload.name = form.name.trim()
    if (form.email.trim()) payload.email = form.email.trim()
    if (form.phone.trim()) payload.phone = onlyDigits(form.phone)
    if (form.websiteUrl.trim()) payload.websiteUrl = form.websiteUrl.trim()
    if (form.addressLine1.trim()) payload.addressLine1 = form.addressLine1.trim()
    if (form.addressLine2.trim()) payload.addressLine2 = form.addressLine2.trim()
    if (form.city.trim()) payload.city = form.city.trim()
    if (form.state.trim()) payload.state = form.state.trim()
    if (form.postalCode.trim()) payload.postalCode = onlyDigits(form.postalCode)
    const ok = await save(payload)
    if (ok) {
      showAlert({ title: 'Perfil atualizado com sucesso.', tone: 'success' })
    }
  }

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 py-4 text-sm text-muted-foreground"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Carregando...
      </div>
    )
  }

  if (error) {
    return <InlineFeedback tone="error">{error}</InlineFeedback>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados de contato */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Dados de contato
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nome da clínica" htmlFor="clinic-name" className="sm:col-span-2">
            <TextInput
              id="clinic-name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ex: Odonto Saúde"
              required
              disabled={isSaving}
            />
          </FormField>

          <FormField label="E-mail" htmlFor="clinic-email" optional>
            <TextInput
              id="clinic-email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="contato@clinica.com.br"
              disabled={isSaving}
            />
          </FormField>

          <FormField label="Telefone" htmlFor="clinic-phone" optional>
            <TextInput
              id="clinic-phone"
              value={form.phone}
              onChange={(e) => set('phone', formatPhoneBR(e.target.value))}
              placeholder="(11) 99999-9999"
              disabled={isSaving}
            />
          </FormField>

          <FormField label="Site" htmlFor="clinic-website" optional className="sm:col-span-2">
            <TextInput
              id="clinic-website"
              type="url"
              value={form.websiteUrl}
              onChange={(e) => set('websiteUrl', e.target.value)}
              placeholder="https://www.clinica.com.br"
              disabled={isSaving}
            />
          </FormField>
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Endereço
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Logradouro" htmlFor="clinic-address1" optional className="sm:col-span-2">
            <TextInput
              id="clinic-address1"
              value={form.addressLine1}
              onChange={(e) => set('addressLine1', e.target.value)}
              placeholder="Rua, número"
              disabled={isSaving}
            />
          </FormField>

          <FormField label="Complemento" htmlFor="clinic-address2" optional className="sm:col-span-2">
            <TextInput
              id="clinic-address2"
              value={form.addressLine2}
              onChange={(e) => set('addressLine2', e.target.value)}
              placeholder="Sala, bloco, andar"
              disabled={isSaving}
            />
          </FormField>

          <FormField label="Cidade" htmlFor="clinic-city" optional>
            <TextInput
              id="clinic-city"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="São Paulo"
              disabled={isSaving}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="UF" htmlFor="clinic-state" optional>
              <TextInput
                id="clinic-state"
                value={form.state}
                onChange={(e) => set('state', formatUf(e.target.value))}
                placeholder="SP"
                maxLength={2}
                disabled={isSaving}
              />
            </FormField>

            <FormField label="CEP" htmlFor="clinic-cep" optional>
              <TextInput
                id="clinic-cep"
                value={form.postalCode}
                onChange={(e) => set('postalCode', formatCepBR(e.target.value))}
                placeholder="00000-000"
                disabled={isSaving}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Localização (read-only) */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Localização
        </p>
        <p className="text-xs text-muted-foreground">
          Esses dados ajudam a manter horários e documentos consistentes.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Fuso horário</p>
            <p className="text-sm text-foreground">{profile?.timezone ?? 'Não informado'}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">País</p>
            <p className="text-sm text-foreground">{profile?.country ?? 'Não informado'}</p>
          </div>
        </div>
      </div>

      {saveError && <InlineFeedback tone="error">{saveError}</InlineFeedback>}

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Salvar alterações
        </Button>
      </div>
    </form>
  )
}

function CalendarSection() {
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isActing, setIsActing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)

  useEffect(() => {
    getGoogleCalendarStatus()
      .then(setStatus)
      .catch(() => setLoadError('Não foi possível verificar a integração com o Google Agenda.'))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleConnect() {
    setIsActing(true)
    setActionError(null)
    try {
      const { url } = await createGoogleCalendarConnectUrl()
      window.location.href = url
    } catch {
      setActionError('Não foi possível iniciar a conexão com o Google Agenda.')
      setIsActing(false)
    }
  }

  async function handleDisconnectConfirmed() {
    setShowDisconnectDialog(false)
    setIsActing(true)
    setActionError(null)
    try {
      const updated = await disconnectGoogleCalendar()
      setStatus(updated)
    } catch {
      setActionError('Não foi possível desconectar o Google Agenda.')
    } finally {
      setIsActing(false)
    }
  }

  async function handleSync() {
    setIsActing(true)
    setActionError(null)
    setSyncMessage(null)
    try {
      const result = await syncGoogleCalendar()
      setSyncMessage(
        result.synced > 0
          ? `${result.synced} consulta${result.synced === 1 ? '' : 's'} sincronizada${result.synced === 1 ? '' : 's'}.`
          : 'Nenhuma consulta nova para sincronizar.',
      )
      const updated = await getGoogleCalendarStatus()
      setStatus(updated)
    } catch {
      setActionError('Erro ao sincronizar. Tente novamente.')
    } finally {
      setIsActing(false)
    }
  }

  const connected = status?.connected ?? false

  return (
    <>
      <ConfirmDialog
        open={showDisconnectDialog}
        title="Desconectar Google Calendar?"
        description="A sincronização com o Google Calendar será interrompida. Você poderá conectar novamente depois."
        confirmLabel="Desconectar"
        tone="destructive"
        isConfirming={isActing}
        onConfirm={handleDisconnectConfirmed}
        onCancel={() => setShowDisconnectDialog(false)}
      />

      <div className="space-y-4">
        {/* Integration identity header — always rendered */}
        <div className="flex items-center gap-3 border-b border-border pb-4">
          {/* Google Calendar-inspired tile: blue header + color dots + date number */}
          <div
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 flex-col overflow-hidden rounded-xl border border-[#e8eaed] shadow-sm dark:border-white/10"
          >
            <div className="flex h-4 shrink-0 items-center justify-center gap-0.5 bg-[#4285F4] dark:bg-slate-700">
              <div className="h-1.5 w-1.5 rounded-full bg-[#EA4335] dark:bg-rose-400/70" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#FBBC05] dark:bg-amber-300/70" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#34A853] dark:bg-emerald-400/70" />
            </div>
            <div className="flex flex-1 items-center justify-center bg-white dark:bg-slate-900">
              <span className="text-[13px] font-bold leading-none text-[#4285F4] dark:text-blue-200">31</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Google Agenda</p>
            <p className="text-xs text-muted-foreground">Sincronização de calendário</p>
          </div>
          {connected && (
            <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
              Conectado
            </span>
          )}
        </div>

        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Verificando integração...
          </div>
        ) : loadError ? (
          <InlineFeedback tone="error">{loadError}</InlineFeedback>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {connected ? status?.calendarSummary ?? 'Conectado' : 'Não conectado'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {connected
                      ? 'Google Agenda conectado para sincronização dos compromissos da clínica.'
                      : 'Conecte o Google Agenda para sincronizar eventos e reduzir conflitos de agenda.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {connected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isActing}
                      onClick={handleSync}
                    >
                      {isActing ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                      )}
                      Sincronizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isActing}
                      onClick={() => setShowDisconnectDialog(true)}
                    >
                      <Unlink className="h-4 w-4" aria-hidden="true" />
                      Desconectar
                    </Button>
                  </>
                ) : (
                  <Button size="sm" disabled={isActing} onClick={handleConnect}>
                    {isActing ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                    )}
                    Conectar Google Agenda
                  </Button>
                )}
              </div>
            </div>

            {syncMessage && <InlineFeedback tone="success">{syncMessage}</InlineFeedback>}
            {actionError && <InlineFeedback tone="error">{actionError}</InlineFeedback>}
          </>
        )}
      </div>
    </>
  )
}

function BillingSection() {
  const [status, setStatus] = useState<CurrentBillingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    getCurrentBillingStatus()
      .then(setStatus)
      .catch(() => setLoadError('Não foi possível carregar as informações do plano.'))
      .finally(() => setIsLoading(false))
  }, [])

  const info = status ? STATUS_INFO[status.status] : null
  const intervalLabel =
    status?.billingInterval === 'annual'
      ? 'Anual'
      : status?.billingInterval === 'monthly'
        ? 'Mensal'
        : null
  const renewalDate = status?.currentPeriodEnd
    ? new Date(status.currentPeriodEnd).toLocaleDateString('pt-BR')
    : null
  const trialDate = status?.trialEndsAt
    ? new Date(status.trialEndsAt).toLocaleDateString('pt-BR')
    : null

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 pb-1 text-sm text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Carregando plano...
        </div>
      ) : loadError ? (
        <InlineFeedback tone="error">{loadError}</InlineFeedback>
      ) : status && info ? (
        <div className="flex flex-wrap items-center gap-2 pb-1">
          {status.planName && (
            <span className="text-sm font-semibold text-foreground">{status.planName}</span>
          )}
          <StatusBadge tone={info.tone} className="px-2 py-0.5 text-xs shadow-none">
            {info.label}
          </StatusBadge>
          {intervalLabel && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {intervalLabel}
            </span>
          )}
          {status.status === 'trialing' && trialDate && (
            <span className="text-xs text-muted-foreground">· Teste até {trialDate}</span>
          )}
          {status.status === 'active' && renewalDate && (
            <span className="text-xs text-muted-foreground">· Renova em {renewalDate}</span>
          )}
        </div>
      ) : null}
      <LinkRow
        icon={CreditCard}
        label="Plano e cobrança"
        description="Veja seu plano atual, histórico e opções de upgrade."
        to="/app/assinatura"
      />
    </div>
  )
}

function TrustCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  )
}

export function SettingsPageContainer() {
  return (
    <AppPage spacing="loose">
      <AppPageHeader
        eyebrow="Administração"
        title="Configurações"
        description="Gerencie dados da clínica, integrações, equipe, assinatura e preferências operacionais em um só lugar."
      />

      <div className="space-y-6">
        <SettingsPanelSection title="Perfil da Clínica">
          <ClinicProfileSection />
        </SettingsPanelSection>

        <SettingsPanelSection title="Perfil Fiscal">
          <LinkRow
            icon={Receipt}
            label="Dados fiscais da clínica"
            description="Razão social, CNPJ, regime tributário e endereço fiscal."
            to="/app/configuracoes/fiscal"
          />
        </SettingsPanelSection>

        <SettingsPanelSection title="Comunicação">
          <LinkRow
            icon={Bell}
            label="Notificações WhatsApp"
            description="Configure mensagens automáticas para pacientes."
            to="/app/configuracoes/notificacoes"
          />
        </SettingsPanelSection>

        <SettingsPanelSection title="Integração de Calendário">
          <CalendarSection />
        </SettingsPanelSection>

        <SettingsPanelSection title="Equipe e Permissões">
          <div className="space-y-4">
            <LinkRow
              icon={Users}
              label="Gerenciar equipe"
              description="Adicione, edite ou remova membros da clínica."
              to="/app/equipe"
            />
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Papéis disponíveis
              </p>
              <div className="space-y-2">
                {ROLE_INFO.map((r) => (
                  <div key={r.label} className="flex items-start gap-3">
                    <span className="mt-px w-24 shrink-0 rounded-md bg-muted px-2 py-0.5 text-center text-xs font-medium text-muted-foreground">
                      {r.label}
                    </span>
                    <p className="text-xs leading-5 text-muted-foreground">{r.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SettingsPanelSection>

        <SettingsPanelSection title="Assinatura">
          <BillingSection />
        </SettingsPanelSection>

        <SettingsPanelSection title="IA e Limites">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                <Bot className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground">Uso inteligente da IA</p>
            </div>

            <p className="text-sm text-muted-foreground">
              Esta seção não executa a IA diretamente. Ela mostra onde os recursos de IA são usados
              e orienta a clínica a evitar análises repetidas que consomem processamento sem
              necessidade.
            </p>
            <p className="text-sm text-muted-foreground">
              A IA do DentalFlow gera diagnósticos em áreas como financeiro e estoque. Cada análise
              consome recursos de processamento, por isso a plataforma orienta o uso quando houver
              dados novos, mudanças relevantes ou decisões importantes.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <TrustCard
                icon={BarChart2}
                title="Quando usar"
                description="Use a IA após novas movimentações financeiras, alterações no estoque ou antes de revisar decisões importantes."
              />
              <TrustCard
                icon={AlertTriangle}
                title="Quando evitar"
                description="Evite gerar o mesmo diagnóstico várias vezes seguidas sem mudança nos dados. Isso consome recursos sem melhorar a resposta."
              />
              <TrustCard
                icon={DollarSign}
                title="Como controlamos custos"
                description="Mensagens educativas, limites por plano e atalhos contextuais ajudam a evitar consumo acelerado, inclusive em planos premium."
              />
            </div>

            <div className="border-t border-border pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Atalhos para executar análises
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  to="/app/financeiro"
                  hash="ai-analysis"
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm transition-all hover:border-primary/20 hover:bg-primary/5 dark:hover:border-white/10 dark:hover:bg-white/[0.06]"
                >
                  <Landmark className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="font-medium text-foreground">Abrir análise financeira</span>
                  <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
                <Link
                  to="/app/estoque"
                  hash="inventory-ai-analysis"
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm transition-all hover:border-primary/20 hover:bg-primary/5 dark:hover:border-white/10 dark:hover:bg-white/[0.06]"
                >
                  <Package className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="font-medium text-foreground">Abrir análise de estoque</span>
                  <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Dica: gere uma nova análise quando os dados mudarem ou quando precisar tomar uma decisão com base nos indicadores.
              </p>
            </div>
          </div>
        </SettingsPanelSection>

        <SettingsPanelSection title="Segurança e Conformidade">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Acompanhe políticas, termos e práticas de proteção de dados usadas para manter a clínica alinhada à LGPD.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <TrustCard
                icon={ShieldCheck}
                title="Dados protegidos"
                description="As informações da clínica e dos pacientes são tratadas em ambiente autenticado e com controles de acesso por perfil."
              />
              <TrustCard
                icon={KeyRound}
                title="Acesso por função"
                description="Permissões separam responsabilidades entre proprietário, dentistas e assistentes."
              />
              <TrustCard
                icon={FileText}
                title="Documentos legais"
                description="Políticas e termos ficam centralizados para consulta sempre que necessário."
              />
            </div>

            <div className="space-y-1 border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Documentos e políticas
              </p>
              {LEGAL_LINKS.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 rounded-md px-1 py-2 text-sm text-foreground transition-all hover:bg-primary/5 dark:hover:bg-white/[0.06]"
                >
                  <span className="min-w-0 truncate">{label}</span>
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </div>
        </SettingsPanelSection>
      </div>
    </AppPage>
  )
}
