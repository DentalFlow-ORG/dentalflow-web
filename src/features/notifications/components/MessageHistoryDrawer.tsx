import { History, Loader2, MessageCircle, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useNotificationMessages } from '../hooks/useNotificationMessages'
import { MessageStatusBadge } from './MessageStatusBadge'
import { TEMPLATE_LABELS } from '../services/notifications.service'

type MessageHistoryDrawerProps = {
  appointmentId: string
  patientName: string
  open: boolean
  onClose: () => void
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function MessageHistoryDrawer({
  appointmentId,
  patientName,
  open,
  onClose,
}: MessageHistoryDrawerProps) {
  const { messages, isLoading, total } = useNotificationMessages(open ? appointmentId : undefined)

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in-0 duration-200" />
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
                <History className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-semibold text-foreground">
                  Histórico de mensagens
                </Dialog.Title>
                <p className="text-xs text-muted-foreground">{patientName}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fechar">
              <X />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                <MessageCircle className="h-8 w-8 opacity-40" aria-hidden="true" />
                <p className="text-sm">Nenhuma mensagem enviada para este agendamento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {total} {total === 1 ? 'mensagem' : 'mensagens'} encontradas
                </p>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg border border-border bg-card p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {TEMPLATE_LABELS[msg.templateSlug] ?? msg.templateSlug}
                      </p>
                      <MessageStatusBadge status={msg.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {msg.sentAt
                        ? `Enviado em ${formatDate(msg.sentAt)}`
                        : msg.failedAt
                          ? `Falhou em ${formatDate(msg.failedAt)}`
                          : `Criado em ${formatDate(msg.createdAt)}`}
                    </p>
                    {msg.failReason && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Motivo: {msg.failReason}
                      </p>
                    )}
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      Simulado — WhatsApp Phase 0
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
