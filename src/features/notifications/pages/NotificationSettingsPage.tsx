import { useState } from 'react'
import { Bell, Check, ChevronDown, Loader2, MessageCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { ApiError } from '@/services/http'
import { cn } from '@/lib/utils'

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
  const { showAlert } = useGlobalAlerts()
  const { preferences, isLoading, isSaving, save } = useNotificationPreferences()
  const { quota, isLoading: quotaLoading } = useNotificationQuota()
  const [localEnabled, setLocalEnabled] = useState<boolean | null>(null)
  const [localHours, setLocalHours] = useState<number | null>(null)
  const [hoursMenuOpen, setHoursMenuOpen] = useState(false)

  const whatsappEnabled = localEnabled ?? preferences?.whatsappEnabled ?? false
  const reminderHours = localHours ?? preferences?.reminderHoursBefore ?? 24

  const handleToggleWhatsApp = async (enabled: boolean) => {
    setLocalEnabled(enabled)
    try {
      await save({ whatsappEnabled: enabled })
      showAlert({
        title: enabled ? 'WhatsApp ativado' : 'WhatsApp desativado',
        description: enabled
          ? 'Modo simulado ativo. Nenhuma mensagem real será enviada.'
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
    setHoursMenuOpen(false)
    try {
      await save({ reminderHoursBefore: hours })
    } catch {
      setLocalHours(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure mensagens WhatsApp para seus pacientes.
        </p>
      </div>

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
                  {whatsappEnabled ? 'Modo simulado ativo' : 'Não configurado'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {whatsappEnabled
                    ? 'Mensagens são registradas sem envio real.'
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
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : whatsappEnabled ? (
                'Desativar'
              ) : (
                'Ativar'
              )}
            </Button>
          </div>

          {whatsappEnabled && (
            <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              Fase 0 — simulação. Nenhuma mensagem real é enviada. O envio real será habilitado em uma fase futura.
            </div>
          )}
        </div>
      </SectionCard>

      {/* Usage */}
      <SectionCard title="Uso mensal">
        {quotaLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
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
          <p className="text-sm text-muted-foreground">Não foi possível carregar o uso mensal.</p>
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
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setHoursMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {reminderHours}h
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </button>
              {hoursMenuOpen && (
                <div className="absolute right-0 z-10 mt-1 min-w-[5rem] overflow-hidden rounded-md border border-border bg-card shadow-md">
                  {REMINDER_HOURS_OPTIONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleHoursChange(h)}
                      className={cn(
                        'flex w-full items-center justify-between px-3 py-1.5 text-sm transition-colors hover:bg-muted',
                        h === reminderHours && 'font-semibold text-primary',
                      )}
                    >
                      {h}h
                      {h === reminderHours && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
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

      {/* Session marker */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Settings className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Configurações de notificação — DentalFlow</span>
      </div>
    </div>
  )
}
