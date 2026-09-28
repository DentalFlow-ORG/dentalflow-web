import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'
import { safeFormatDateBR, safeFormatTimeBR } from '@/lib/date-time-formatters'
import { normalizePhoneBR } from '@/lib/field-formatters'
import { cn } from '@/lib/utils'
import { ApiError } from '@/services/http'
import { Loader2, MessageCircle, Send } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useState } from 'react'

import { useNotificationConsent } from '../hooks/useNotificationConsent'
import { useNotificationPreferences } from '../hooks/useNotificationPreferences'
import { useNotificationQuota } from '../hooks/useNotificationQuota'
import { TEMPLATE_LABELS, sendNotification } from '../services/notifications.service'
import type { NotificationTemplate } from '../types/notifications.types'
import { ConsentToggle } from './ConsentToggle'
import { MessageStatusBadge } from './MessageStatusBadge'
import { TemplatePreviewer } from './TemplatePreviewer'
import { WhatsAppLockedPreview } from './WhatsAppLockedPreview'

function canPrepareMessage(dateLabel: string, timeLabel: string) {
  return dateLabel !== safeFormatDateBR(null) && timeLabel !== safeFormatTimeBR(null)
}

export type NotificationSendDrawerProps = {
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

/**
 * Self-contained WhatsApp send drawer — consent, quota, and template preview
 * are all resolved internally. Shared by the full notification action list
 * (AppointmentNotificationActions) and any inline shortcut that opens it
 * directly with a pre-selected template.
 */
export function NotificationSendDrawer({
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
}: NotificationSendDrawerProps) {
  const { showAlert } = useGlobalAlerts()
  const [isSending, setIsSending] = useState(false)
  const [lastStatus, setLastStatus] = useState<'SENT' | 'FAILED' | null>(null)
  const phone = normalizePhoneBR(patientPhone)
  const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false)
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

  // Granting is immediate; revoking stops all WhatsApp messages to this
  // patient, so it is confirmed first.
  const handleConsentChange = async (granted: boolean) => {
    if (!granted) {
      setConfirmRevokeOpen(true)
      return
    }
    try {
      await grant(phone)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Não foi possível registrar o consentimento.'
      showAlert({ title: 'Erro ao registrar consentimento', description: msg, tone: 'error' })
    }
  }

  const handleRevokeConfirmed = async () => {
    try {
      await revoke()
      showAlert({ title: 'Consentimento revogado', tone: 'success' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Não foi possível revogar o consentimento.'
      showAlert({ title: 'Erro ao revogar consentimento', description: msg, tone: 'error' })
    } finally {
      setConfirmRevokeOpen(false)
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
      <ConfirmDialog
        open={confirmRevokeOpen}
        title="Revogar consentimento do WhatsApp?"
        subject={patientName}
        description="O paciente deixará de receber mensagens da clínica pelo WhatsApp, incluindo lembretes de consulta, até que um novo consentimento seja registrado."
        confirmLabel="Revogar consentimento"
        isConfirming={consentSaving}
        onConfirm={() => void handleRevokeConfirmed()}
        onCancel={() => setConfirmRevokeOpen(false)}
      />
    </Dialog.Root>
  )
}
