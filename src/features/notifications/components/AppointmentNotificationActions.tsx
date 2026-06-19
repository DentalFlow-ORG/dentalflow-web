import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'
import { safeFormatDateBR, safeFormatTimeBR } from '@/lib/date-time-formatters'
import { normalizePhoneBR } from '@/lib/field-formatters'
import { cn } from '@/lib/utils'
import { ApiError } from '@/services/http'
import { ChevronRight, History, Loader2, MessageCircle, Send } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useState } from 'react'

import { useNotificationConsent } from '../hooks/useNotificationConsent'
import { useNotificationPreferences } from '../hooks/useNotificationPreferences'
import { useNotificationQuota } from '../hooks/useNotificationQuota'
import { useNotificationTemplates } from '../hooks/useNotificationTemplates'
import {
  TEMPLATES_BY_STATUS,
  TEMPLATE_LABELS,
  sendNotification,
} from '../services/notifications.service'
import type { NotificationTemplate } from '../types/notifications.types'
import { ConsentToggle } from './ConsentToggle'
import { MessageHistoryDrawer } from './MessageHistoryDrawer'
import { MessageStatusBadge } from './MessageStatusBadge'
import { TemplatePreviewer } from './TemplatePreviewer'
import { WhatsAppLockedPreview } from './WhatsAppLockedPreview'

type AppointmentNotificationActionsProps = {
  appointmentId: string
  appointmentStatus: string
  patientName: string
  patientPhone: string | null
  clinicName: string
  appointmentDate: string | Date | null | undefined
  appointmentTime: string | Date | null | undefined
}

function normalizePhone(phone: string) {
  return normalizePhoneBR(phone)
}

function canPrepareMessage(dateLabel: string, timeLabel: string) {
  return dateLabel !== safeFormatDateBR(null) && timeLabel !== safeFormatTimeBR(null)
}

type SendDrawerProps = {
  open: boolean
  onClose: () => void
  template: NotificationTemplate | null
  appointmentId: string
  patientName: string
  patientPhone: string
  clinicName: string
  appointmentDate: string | Date | null | undefined
  appointmentTime: string | Date | null | undefined
  onSent: () => void
}

function SendDrawer({
  open,
  onClose,
  template,
  appointmentId,
  patientName,
  patientPhone,
  clinicName,
  appointmentDate,
  appointmentTime,
  onSent,
}: SendDrawerProps) {
  const { showAlert } = useGlobalAlerts()
  const [isSending, setIsSending] = useState(false)
  const [lastStatus, setLastStatus] = useState<'SENT' | 'FAILED' | null>(null)
  const phone = normalizePhone(patientPhone)
  const { quota, isLoading: quotaLoading } = useNotificationQuota()
  const { preferences } = useNotificationPreferences()
  const {
    consent,
    isLoading: consentLoading,
    isSaving: consentSaving,
    grant,
    revoke,
  } = useNotificationConsent(phone)
  const isRealProvider =
    preferences?.providerType === 'whatsapp_cloud' && preferences.providerConfigured

  const hasConsent = !!consent?.granted && !consent.revokedAt
  const quotaExhausted = !quotaLoading && quota !== null && quota.available === 0
  const quotaBlocked = !quotaLoading && quota !== null && quota.limit === 0
  const formattedDate = safeFormatDateBR(appointmentDate)
  const formattedTime = safeFormatTimeBR(appointmentTime)
  const hasValidMessageData = canPrepareMessage(formattedDate, formattedTime)

  const canSend =
    hasConsent && hasValidMessageData && !quotaExhausted && !quotaBlocked && !isSending

  const handleSend = async () => {
    if (!template || !canSend) return
    setIsSending(true)
    try {
      const res = await sendNotification({
        templateSlug: template.slug,
        phone,
        appointmentId,
      })
      setLastStatus(res.status === 'SENT' ? 'SENT' : 'FAILED')
      if (res.status === 'SENT') {
        showAlert({
          title: 'Mensagem enviada',
          description: isRealProvider
            ? 'Mensagem real enviada via WhatsApp Cloud API.'
            : 'Mensagem simulada registrada com sucesso.',
          tone: 'success',
        })
        onSent()
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao enviar mensagem.'
      showAlert({ title: 'Erro', description: msg, tone: 'error' })
      setLastStatus('FAILED')
    } finally {
      setIsSending(false)
    }
  }

  const handleConsentChange = async (granted: boolean) => {
    if (granted) {
      await grant(phone)
    } else {
      await revoke()
    }
  }

  const previewVars = {
    patientName,
    date: formattedDate,
    time: formattedTime,
    clinicName,
    amount: 'R$ —',
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm animate-in fade-in-0 duration-200" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-background shadow-2xl shadow-black/15',
            'animate-in slide-in-from-right duration-200',
          )}
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-semibold text-foreground">
                  {template ? (TEMPLATE_LABELS[template.slug] ?? template.slug) : 'Enviar mensagem'}
                </Dialog.Title>
                <p className="text-xs text-muted-foreground">{patientName}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {/* Template preview */}
            {template && <TemplatePreviewer template={template} previewVars={previewVars} />}

            {/* Consent section */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Consentimento WhatsApp
              </p>
              {consentLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Verificando...
                </div>
              ) : (
                <ConsentToggle
                  checked={hasConsent}
                  onChange={handleConsentChange}
                  disabled={consentSaving}
                />
              )}
            </div>

            {/* Quota */}
            {!quotaLoading && quota && (
              <div className="rounded-lg border border-border bg-card px-3 py-2.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{quota.used}</span> /{' '}
                <span className="font-medium text-foreground">{quota.limit}</span> mensagens usadas
                este mês
              </div>
            )}

            {/* Blocked states */}
            {quotaBlocked && <WhatsAppLockedPreview reason="starter_plan" />}
            {!quotaBlocked && quotaExhausted && <WhatsAppLockedPreview reason="quota_exceeded" />}
            {!hasConsent && !consentLoading && <WhatsAppLockedPreview reason="no_consent" />}
            {!hasValidMessageData && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-300">
                Não foi possível preparar a mensagem porque a consulta não possui data/hora válida.
              </div>
            )}

            {/* Last status */}
            {lastStatus && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                Último envio: <MessageStatusBadge status={lastStatus} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-card px-4 py-3">
            <Button className="w-full" onClick={handleSend} disabled={!canSend}>
              {isSending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send />
                  {isRealProvider ? 'Enviar WhatsApp real' : 'Enviar mensagem simulada'}
                </>
              )}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function AppointmentNotificationActions({
  appointmentId,
  appointmentStatus,
  patientName,
  patientPhone,
  clinicName,
  appointmentDate,
  appointmentTime,
}: AppointmentNotificationActionsProps) {
  const { templates } = useNotificationTemplates()
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null)
  const [sendOpen, setSendOpen] = useState(false)
  const [sentCount, setSentCount] = useState(0)

  if (!patientPhone) return null

  const relevantSlugs = TEMPLATES_BY_STATUS[appointmentStatus] ?? []
  const relevantTemplates = templates.filter((t) => relevantSlugs.includes(t.slug))

  const handleOpenSend = (template: NotificationTemplate) => {
    setSelectedTemplate(template)
    setSendOpen(true)
  }

  const handleSent = () => {
    setSentCount((c) => c + 1)
  }

  return (
    <>
      <div>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          WhatsApp
        </p>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="divide-y divide-border">
            {/* Relevant templates */}
            {relevantTemplates.map((tpl) => (
              <button
                key={tpl.slug}
                type="button"
                onClick={() => handleOpenSend(tpl)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
                    {TEMPLATE_LABELS[tpl.slug] ?? tpl.slug}
                  </p>
                  <p className="text-xs text-muted-foreground">Preparar e enviar mensagem</p>
                </div>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </button>
            ))}

            {/* History button */}
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <History className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">Histórico de mensagens</p>
                {sentCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {sentCount} enviada{sentCount !== 1 ? 's' : ''} nesta sessão
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Send drawer */}
      <SendDrawer
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        template={selectedTemplate}
        appointmentId={appointmentId}
        patientName={patientName}
        patientPhone={patientPhone}
        clinicName={clinicName}
        appointmentDate={appointmentDate}
        appointmentTime={appointmentTime}
        onSent={handleSent}
      />

      {/* History drawer */}
      <MessageHistoryDrawer
        appointmentId={appointmentId}
        patientName={patientName}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </>
  )
}
