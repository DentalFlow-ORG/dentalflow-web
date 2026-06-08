import { useState } from 'react'
import { Bell, Loader2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/common/BackButton'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { ApiError } from '@/services/http'
import { cn } from '@/lib/utils'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useNotificationPreferences } from '../hooks/useNotificationPreferences'
import { useNotificationQuota } from '../hooks/useNotificationQuota'
import { MonthlyUsageBar } from '../components/MonthlyUsageBar'

const REMINDER_HOURS_OPTIONS = [2, 4, 12, 24, 48] as const

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <p className="border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="p-5">{children}</div>
    </div>
  )
}

export function NotificationSettingsPage() {
  const { user } = useAuth()
  const { showAlert } = useGlobalAlerts()
  const { preferences, isLoading, isSaving, save, error } = useNotificationPreferences()
  const { quota, isLoading: quotaLoading } = useNotificationQuota()
  const [localEnabled, setLocalEnabled] = useState<boolean | null>(null)
  const [localHours, setLocalHours] = useState<number | null>(null)

  const whatsappEnabled = localEnabled ?? preferences?.whatsappEnabled ?? false
  const isRealProvider = preferences?.providerType === 'whatsapp_cloud'
  const providerConfigured = preferences?.providerConfigured ?? false
  const reminderHours = localHours ?? preferences?.reminderHoursBefore ?? 24

  const handleToggleWhatsApp = async (enabled: boolean) => {
    setLocalEnabled(enabled)
    try {
      await save({ whatsappEnabled: enabled })
      showAlert({
        title: enabled ? 'WhatsApp ativado' : 'WhatsApp desativado',
        description: enabled
          ? isRealProvider
            ? 'WhatsApp real ativo. Mensagens só serão enviadas por ação explícita.'
            : 'Modo simulado ativo. Nenhuma mensagem real será enviada.'
          : 'Notificações WhatsApp desativadas.',
        tone: 'success',
      })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao salvar preferências.'
      showAlert({ title: 'Erro', description: msg, tone: 'error' })
      setLocalEnabled(!enabled)
    }
  }

  const handleHoursChange = async (hours: number) => {
    setLocalHours(hours)
    try {
      await save({ reminderHoursBefore: hours })
    } catch {
      setLocalHours(null)
    }
  }

  if (isLoading) {
    return (
      <AppPage>
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-center py-16 text-muted-foreground"
        >
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        </div>
      </AppPage>
    )
  }

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Comunicação"
        title="Notificações"
        description="Configure lembretes automáticos e acompanhe o uso mensal de mensagens da clínica."
        action={<BackButton to={user?.role === 'OWNER' ? '/app/configuracoes' : '/app'} />}
      />

      {user?.role === 'ASSISTANT' && (
        <InlineFeedback tone="info">
          Você pode ajustar preferências operacionais de comunicação, mas configurações administrativas da clínica continuam restritas ao proprietário.
        </InlineFeedback>
      )}

      {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

      {/* Status card */}
      <SectionCard title="Status do WhatsApp">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  whatsappEnabled
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {whatsappEnabled
                    ? isRealProvider
                      ? 'WhatsApp real ativo'
                      : 'Modo simulado'
                    : 'WhatsApp não configurado'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {whatsappEnabled
                    ? isRealProvider
                      ? 'Mensagens enviadas via Meta WhatsApp Business Cloud API.'
                      : 'Mensagens são registradas sem envio real.'
                    : isRealProvider && providerConfigured
                      ? 'Ative para enviar mensagens via WhatsApp Cloud API.'
                      : isRealProvider
                        ? 'Configure as credenciais da Meta antes de ativar o envio real.'
                        : 'Ative para registrar mensagens simuladas.'}
                </p>
              </div>
            </div>
            <Button
              variant={whatsappEnabled ? 'outline' : 'default'}
              size="sm"
              disabled={isSaving}
              onClick={() => handleToggleWhatsApp(!whatsappEnabled)}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : whatsappEnabled ? (
                'Desativar'
              ) : (
                'Ativar'
              )}
            </Button>
          </div>

          {whatsappEnabled && !isRealProvider && (
            <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              Fase 0 — simulação. Nenhuma mensagem real é enviada. O envio real será habilitado em uma fase futura.
            </div>
          )}
          {whatsappEnabled && isRealProvider && providerConfigured && (
            <div className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-800 dark:bg-green-900/20 dark:text-green-300">
              Provedor real ativo. Mensagens são enviadas via Meta WhatsApp Business Cloud API. Templates devem estar aprovados no Meta Business Manager.
            </div>
          )}
          {isRealProvider && !providerConfigured && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-900/20 dark:text-red-300">
              WhatsApp Cloud API selecionado, mas as credenciais obrigatórias não estão configuradas.
            </div>
          )}
        </div>
      </SectionCard>

      {/* Usage */}
      <SectionCard title="Uso mensal">
        {quotaLoading ? (
          <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Carregando uso...
          </div>
        ) : quota ? (
          <div className="space-y-3">
            <MonthlyUsageBar quota={quota} />
            {quota.limit === 0 && (
              <p className="text-xs text-muted-foreground">
                Seu plano atual não inclui mensagens WhatsApp.
              </p>
            )}
          </div>
        ) : (
          <InlineFeedback tone="error">Não foi possível carregar o uso mensal.</InlineFeedback>
        )}
      </SectionCard>

      {/* Preferences */}
      <SectionCard title="Preferências">
        <div className="space-y-4">
          {/* Reminder hours */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Antecedência do lembrete</p>
              <p className="text-xs text-muted-foreground">
                Com quantas horas de antecedência enviar o lembrete de consulta.
              </p>
            </div>
            <Select
              value={String(reminderHours)}
              onValueChange={(value) => handleHoursChange(Number(value))}
              disabled={isSaving}
            >
              <SelectTrigger className="w-28 shrink-0" aria-label="Antecedência do lembrete">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {REMINDER_HOURS_OPTIONS.map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {h}h
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Auto-reminder (future) */}
          <div className="flex items-center justify-between gap-4 opacity-50">
            <div>
              <p className="text-sm font-medium text-foreground">Lembrete automático</p>
              <p className="text-xs text-muted-foreground">
                Enviar lembretes automaticamente (Premium — em breve).
              </p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Em breve
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Info */}
      <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
        <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Mensagens WhatsApp nunca incluem diagnósticos, prontuários ou detalhes clínicos.
          O consentimento do paciente é sempre verificado antes do envio.
        </span>
      </div>
    </AppPage>
  )
}
