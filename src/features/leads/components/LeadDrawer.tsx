import { Dialog } from 'radix-ui'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FormField, TextArea, TextInput, DateInput } from '@/components/common/FormField'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Lead, LeadActivity, LeadSource, LeadStatus } from '../types/leads.types'
import { SOURCE_LABELS } from './LeadSourceBadge'
import { STATUS_CONFIG } from './LeadStatusBadge'
import { LeadActivitiesTimeline } from './LeadActivitiesTimeline'

export type DrawerMode = 'view' | 'edit' | 'create'

interface LeadDrawerProps {
  mode: DrawerMode
  lead: Lead | null
  activities: LeadActivity[]
  isLoadingActivities: boolean
  isSaving: boolean
  onClose: () => void
  onSave: (payload: {
    name: string
    phone?: string
    email?: string
    source?: LeadSource
    message?: string
    nextFollowUpAt?: string
  }) => Promise<void>
  onStatusChange: (status: LeadStatus) => Promise<void>
  onConvert: () => Promise<void>
  onAddNote: (note: string) => Promise<void>
  onAddContact: () => Promise<void>
}

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as LeadStatus[]
const ALL_SOURCES = Object.keys(SOURCE_LABELS) as LeadSource[]

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.split('T')[0]
}

export function LeadDrawer({
  mode,
  lead,
  activities,
  isLoadingActivities,
  isSaving,
  onClose,
  onSave,
  onStatusChange,
  onConvert,
  onAddNote,
  onAddContact,
}: LeadDrawerProps) {
  const isOpen = mode === 'create' || !!lead

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [source, setSource] = useState<LeadSource>('MANUAL')
  const [message, setMessage] = useState('')
  const [nextFollowUpAt, setNextFollowUpAt] = useState('')
  const [localStatus, setLocalStatus] = useState<LeadStatus>('NEW')
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  useEffect(() => {
    if (lead) {
      setName(lead.name)
      setPhone(lead.phone ?? '')
      setEmail(lead.email ?? '')
      setSource(lead.source)
      setMessage(lead.message ?? '')
      setNextFollowUpAt(toDateInputValue(lead.nextFollowUpAt))
      setLocalStatus(lead.status)
    } else {
      setName('')
      setPhone('')
      setEmail('')
      setSource('MANUAL')
      setMessage('')
      setNextFollowUpAt('')
      setLocalStatus('NEW')
    }
  }, [lead, mode])

  async function handleSave() {
    await onSave({
      name,
      phone: phone || undefined,
      email: email || undefined,
      source,
      message: message || undefined,
      nextFollowUpAt: nextFollowUpAt || undefined,
    })
  }

  async function handleStatusChange(status: LeadStatus) {
    setIsChangingStatus(true)
    try {
      await onStatusChange(status)
      setLocalStatus(status)
    } finally {
      setIsChangingStatus(false)
    }
  }

  async function handleConvert() {
    setIsConverting(true)
    try {
      await onConvert()
    } finally {
      setIsConverting(false)
    }
  }

  const isEditing = mode === 'edit' || mode === 'create'
  const title =
    mode === 'create' ? 'Novo lead' : mode === 'edit' ? 'Editar lead' : (lead?.name ?? 'Lead')

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in-0 duration-200" />
        <Dialog.Content
          aria-labelledby="lead-drawer-title"
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-background shadow-2xl shadow-black/15 animate-in slide-in-from-right duration-200 focus:outline-none"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
            <Dialog.Title
              id="lead-drawer-title"
              className="text-lg font-semibold text-foreground"
            >
              {title}
            </Dialog.Title>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Status selector — view mode */}
            {mode === 'view' && lead && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.filter((s) => s !== 'ARCHIVED').map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={isChangingStatus}
                      onClick={() => handleStatusChange(s)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                        localStatus === s
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                      }`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              <FormField label="Nome" htmlFor="lead-name">
                {isEditing ? (
                  <TextInput
                    id="lead-name"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    placeholder="Nome do lead"
                  />
                ) : (
                  <p className="text-sm text-foreground">{lead?.name}</p>
                )}
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Telefone" htmlFor="lead-phone">
                  {isEditing ? (
                    <TextInput
                      id="lead-phone"
                      value={phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  ) : (
                    <p className="text-sm text-foreground">{lead?.phone ?? '—'}</p>
                  )}
                </FormField>
                <FormField label="E-mail" htmlFor="lead-email">
                  {isEditing ? (
                    <TextInput
                      id="lead-email"
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  ) : (
                    <p className="text-sm text-foreground">{lead?.email ?? '—'}</p>
                  )}
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Origem" htmlFor="lead-source">
                  {isEditing ? (
                    <Select
                      value={source}
                      onValueChange={(v) => setSource(v as LeadSource)}
                    >
                      <SelectTrigger id="lead-source">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_SOURCES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {SOURCE_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-foreground">
                      {lead ? SOURCE_LABELS[lead.source] : '—'}
                    </p>
                  )}
                </FormField>

                <FormField label="Próximo follow-up" htmlFor="lead-followup">
                  {isEditing ? (
                    <DateInput
                      id="lead-followup"
                      value={nextFollowUpAt}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNextFollowUpAt(e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      {lead?.nextFollowUpAt
                        ? new Date(lead.nextFollowUpAt).toLocaleDateString('pt-BR')
                        : '—'}
                    </p>
                  )}
                </FormField>
              </div>

              <FormField label="Notas" htmlFor="lead-message">
                {isEditing ? (
                  <TextArea
                    id="lead-message"
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setMessage(e.target.value)
                    }
                    placeholder="Observações sobre o lead..."
                    rows={3}
                    className="resize-none"
                  />
                ) : (
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {lead?.message ?? '—'}
                  </p>
                )}
              </FormField>
            </div>

            {/* Service info — view only */}
            {mode === 'view' && lead?.service && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Serviço de interesse
                </p>
                <p className="mt-1 text-sm text-foreground">{lead.service.name}</p>
              </div>
            )}

            {/* Convert action — view only */}
            {mode === 'view' &&
              lead &&
              lead.status !== 'CONVERTED' &&
              lead.status !== 'ARCHIVED' && (
                <div className="rounded-md border border-dashed border-border p-4">
                  <p className="text-sm font-medium text-foreground">Converter em consulta</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Marque este lead como convertido após agendar uma consulta manualmente na agenda.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={handleConvert}
                    disabled={isConverting}
                  >
                    {isConverting ? 'Convertendo...' : 'Marcar como convertido'}
                  </Button>
                </div>
              )}

            {/* Activity timeline — view only */}
            {mode === 'view' && (
              <div className="border-t border-border pt-5">
                <LeadActivitiesTimeline
                  activities={activities}
                  isLoading={isLoadingActivities}
                  onAddNote={onAddNote}
                  onAddContact={onAddContact}
                />
              </div>
            )}
          </div>

          {/* Footer — edit/create */}
          {isEditing && (
            <div className="shrink-0 border-t border-border px-6 py-4 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
                {isSaving
                  ? 'Salvando...'
                  : mode === 'create'
                    ? 'Criar lead'
                    : 'Salvar'}
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
