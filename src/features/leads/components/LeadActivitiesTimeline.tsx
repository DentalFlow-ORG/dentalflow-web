import { CheckCheck, MessageSquare, Phone, Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TextArea } from '@/components/common/FormField'
import type { LeadActivity, LeadActivityAction } from '../types/leads.types'
import { STATUS_CONFIG } from './LeadStatusBadge'

function ActionIcon({ action }: { action: LeadActivityAction }) {
  switch (action) {
    case 'CREATED': return <Plus className="h-3.5 w-3.5" />
    case 'STATUS_CHANGED': return <RefreshCw className="h-3.5 w-3.5" />
    case 'NOTE_ADDED': return <MessageSquare className="h-3.5 w-3.5" />
    case 'CONTACTED': return <Phone className="h-3.5 w-3.5" />
    case 'APPOINTMENT_SCHEDULED': return <CheckCheck className="h-3.5 w-3.5" />
    default: return <MessageSquare className="h-3.5 w-3.5" />
  }
}

function activityLabel(activity: LeadActivity): string {
  switch (activity.action) {
    case 'CREATED': return 'Lead criado'
    case 'STATUS_CHANGED':
      if (activity.oldStatus && activity.newStatus) {
        return `Status alterado: ${STATUS_CONFIG[activity.oldStatus]?.label ?? activity.oldStatus} → ${STATUS_CONFIG[activity.newStatus]?.label ?? activity.newStatus}`
      }
      return 'Status alterado'
    case 'NOTE_ADDED': return 'Nota adicionada'
    case 'CONTACTED': return 'Contato realizado'
    case 'APPOINTMENT_SCHEDULED': return 'Consulta agendada'
    case 'WHATSAPP_SENT': return 'WhatsApp enviado'
    default: return activity.action
  }
}

function formatDateTime(dateStr: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

interface LeadActivitiesTimelineProps {
  activities: LeadActivity[]
  isLoading: boolean
  onAddNote: (note: string) => Promise<void>
  onAddContact: () => Promise<void>
}

export function LeadActivitiesTimeline({
  activities,
  isLoading,
  onAddNote,
  onAddContact,
}: LeadActivitiesTimelineProps) {
  const [note, setNote] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [isLoggingContact, setIsLoggingContact] = useState(false)

  async function handleAddNote() {
    if (!note.trim()) return
    setIsSavingNote(true)
    try {
      await onAddNote(note.trim())
      setNote('')
    } finally {
      setIsSavingNote(false)
    }
  }

  async function handleAddContact() {
    setIsLoggingContact(true)
    try {
      await onAddContact()
    } finally {
      setIsLoggingContact(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Atividades</h3>

      <div className="space-y-2">
        <TextArea
          placeholder="Adicionar nota..."
          value={note}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
          rows={2}
          className="min-h-0 resize-none text-sm"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddNote}
            disabled={!note.trim() || isSavingNote}
          >
            {isSavingNote ? 'Salvando...' : 'Salvar nota'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddContact}
            disabled={isLoggingContact}
          >
            <Phone className="mr-1.5 h-3.5 w-3.5" />
            {isLoggingContact ? 'Registrando...' : 'Registrar contato'}
          </Button>
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-6 w-6 shrink-0 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1.5 pt-0.5">
                  <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-48 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-border" aria-hidden="true" />
            {activities.map((activity) => (
              <div key={activity.id} className="relative flex gap-3 pb-4 last:pb-0">
                <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                  <ActionIcon action={activity.action} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-foreground">{activityLabel(activity)}</p>
                  {activity.note && (
                    <p className="mt-0.5 text-sm text-muted-foreground whitespace-pre-wrap">
                      {activity.note}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activity.user
                      ? `${activity.user.firstName} ${activity.user.lastName} · `
                      : ''}
                    {formatDateTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
