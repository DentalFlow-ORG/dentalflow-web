import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Bell,
  Bot,
  Calendar,
  CalendarCheck2,
  CreditCard,
  ExternalLink,
  Landmark,
  Loader2,
  Package,
  Receipt,
  RefreshCw,
  Shield,
  Users,
  Unlink,
} from 'lucide-react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { FormField, TextInput } from '@/components/common/FormField'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
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

function SettingsSectionCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <p className="border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
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
      className="flex items-center justify-between gap-4 rounded-md px-1 py-2 transition-colors hover:bg-muted"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  )
}

function ClinicProfileSection() {
  const { profile, isLoading, error, save, isSaving, saveSuccess, saveError } =
    useClinicProfile()

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
    await save(payload)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Carregando...
      </div>
    )
  }

  if (error) {
    return <InlineFeedback tone="error">{error}</InlineFeedback>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nome da clínica" htmlFor="clinic-name" className="sm:col-span-2">
          <TextInput
            id="clinic-name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ex: Odonto Saúde"
            required
          />
        </FormField>

        <FormField label="E-mail" htmlFor="clinic-email" optional>
          <TextInput
            id="clinic-email"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="contato@clinica.com.br"
          />
        </FormField>

        <FormField label="Telefone" htmlFor="clinic-phone" optional>
          <TextInput
            id="clinic-phone"
            value={form.phone}
            onChange={(e) => set('phone', formatPhoneBR(e.target.value))}
            placeholder="(11) 99999-9999"
          />
        </FormField>

        <FormField label="Site" htmlFor="clinic-website" optional className="sm:col-span-2">
          <TextInput
            id="clinic-website"
            type="url"
            value={form.websiteUrl}
            onChange={(e) => set('websiteUrl', e.target.value)}
            placeholder="https://www.clinica.com.br"
          />
        </FormField>

        <FormField label="Endereço" htmlFor="clinic-address1" optional className="sm:col-span-2">
          <TextInput
            id="clinic-address1"
            value={form.addressLine1}
            onChange={(e) => set('addressLine1', e.target.value)}
            placeholder="Rua, número"
          />
        </FormField>

        <FormField label="Complemento" htmlFor="clinic-address2" optional className="sm:col-span-2">
          <TextInput
            id="clinic-address2"
            value={form.addressLine2}
            onChange={(e) => set('addressLine2', e.target.value)}
            placeholder="Sala, bloco, andar"
          />
        </FormField>

        <FormField label="Cidade" htmlFor="clinic-city" optional>
          <TextInput
            id="clinic-city"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="São Paulo"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="UF" htmlFor="clinic-state" optional>
            <TextInput
              id="clinic-state"
              value={form.state}
              onChange={(e) => set('state', formatUf(e.target.value))}
              placeholder="SP"
              maxLength={2}
            />
          </FormField>

          <FormField label="CEP" htmlFor="clinic-cep" optional>
            <TextInput
              id="clinic-cep"
              value={form.postalCode}
              onChange={(e) => set('postalCode', formatCepBR(e.target.value))}
              placeholder="00000-000"
            />
          </FormField>
        </div>
      </div>

      {saveSuccess && (
        <InlineFeedback tone="success">Perfil atualizado com sucesso.</InlineFeedback>
      )}
      {saveError && <InlineFeedback tone="error">{saveError}</InlineFeedback>}

      <div className="flex justify-end">
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
  const [isActing, setIsActing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  useEffect(() => {
    getGoogleCalendarStatus()
      .then(setStatus)
      .catch(() => setStatus(null))
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

  async function handleDisconnect() {
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

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Verificando integração...
      </div>
    )
  }

  const connected = status?.connected ?? false

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={
              connected
                ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'
            }
          >
            <CalendarCheck2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {connected ? status?.calendarSummary ?? 'Conectado' : 'Não conectado'}
            </p>
            <p className="text-xs text-muted-foreground">
              {connected
                ? `Conectado em ${status?.connectedAt ? new Date(status.connectedAt).toLocaleDateString('pt-BR') : '—'}`
                : 'Sincronize consultas com o Google Agenda.'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
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
                onClick={handleDisconnect}
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
    </div>
  )
}

function BillingSection() {
  const [status, setStatus] = useState<CurrentBillingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCurrentBillingStatus()
      .then(setStatus)
      .catch(() => setStatus(null))
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
        <div className="flex items-center gap-2 pb-1 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Carregando plano...
        </div>
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

export function SettingsPageContainer() {
  return (
    <AppPage spacing="loose">
      <AppPageHeader
        title="Configurações da Clínica"
        description="Gerencie dados, integrações e preferências da sua clínica."
      />

      <div className="space-y-6">
        <SettingsSectionCard title="Perfil da Clínica">
          <ClinicProfileSection />
        </SettingsSectionCard>

        <SettingsSectionCard title="Perfil Fiscal">
          <LinkRow
            icon={Receipt}
            label="Dados fiscais da clínica"
            description="Razão social, CNPJ, regime tributário e endereço fiscal."
            to="/app/configuracoes/fiscal"
          />
        </SettingsSectionCard>

        <SettingsSectionCard title="Comunicação">
          <LinkRow
            icon={Bell}
            label="Notificações WhatsApp"
            description="Configure mensagens automáticas para pacientes."
            to="/app/configuracoes/notificacoes"
          />
        </SettingsSectionCard>

        <SettingsSectionCard title="Integração de Calendário">
          <CalendarSection />
        </SettingsSectionCard>

        <SettingsSectionCard title="Equipe e Permissões">
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
        </SettingsSectionCard>

        <SettingsSectionCard title="Assinatura">
          <BillingSection />
        </SettingsSectionCard>

        <SettingsSectionCard title="IA e Limites">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                <Bot className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Análise por IA</p>
                <p className="text-xs leading-5 text-muted-foreground">
                  A DentalFlow usa IA para gerar análises financeiras e de estoque com base nos dados
                  da clínica. Nenhum dado clínico é incluído nas análises.
                </p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                to="/app/financeiro"
                hash="ai-analysis"
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <Landmark className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="font-medium text-foreground">Análise financeira</span>
                <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
              <Link
                to="/app/estoque"
                hash="inventory-ai-analysis"
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <Package className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="font-medium text-foreground">Análise de estoque</span>
                <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard title="Segurança e Conformidade">
          <div className="space-y-1">
            {LEGAL_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 rounded-md px-1 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  {label}
                </div>
                <ExternalLink
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </SettingsSectionCard>
      </div>
    </AppPage>
  )
}
