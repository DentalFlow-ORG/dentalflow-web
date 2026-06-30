import { ChevronRight, History, MessageCircle } from 'lucide-react'
import { useState } from 'react'

import { useNotificationTemplates } from '../hooks/useNotificationTemplates'
import { TEMPLATES_BY_STATUS, TEMPLATE_LABELS } from '../services/notifications.service'
import type { NotificationTemplate } from '../types/notifications.types'
import { MessageHistoryDrawer } from './MessageHistoryDrawer'
import { NotificationSendDrawer } from './NotificationSendDrawer'

type AppointmentNotificationActionsProps = {
  appointmentId: string
  appointmentStatus: string
  patientName: string
  patientPhone: string | null
  clinicName: string
  appointmentDate: string | Date | null | undefined
  appointmentTime: string | Date | null | undefined
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
      <NotificationSendDrawer
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
