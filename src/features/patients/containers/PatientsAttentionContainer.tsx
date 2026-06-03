import { useState } from 'react'

import {
  AlertCircle,
  ArrowLeft,
  Bell,
  ChevronRight,
  CreditCard,
  MessageCircle,
  RefreshCw,
  X,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Dialog } from 'radix-ui'

import { EmptyState } from '@/components/common/EmptyState'
import { PatientAvatarWidget } from '../components/PatientAvatarWidget'
import { FormField, TextInput } from '@/components/common/FormField'
import { ListPageShell } from '@/components/common/ListPageShell'
import { MetricCard } from '@/components/common/MetricCard'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrencyBR } from '@/lib/number-formatters'

import {
  type AttentionPriorityFilter,
  type AttentionReasonFilter,
  type WhatsAppFilter,
  usePatientsAttention,
} from '../hooks/usePatientsAttention'
import type { AttentionPriority, PatientAttentionItem } from '../types/attention.types'
import {
  PRIORITY_LABEL,
  PRIORITY_OPTIONS,
  PRIORITY_TONE,
  REASON_LABEL,
  REASON_OPTIONS,
  REASON_TONE,
  WHATSAPP_OPTIONS,
} from '../constants/attention-display'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

// ─── Summary cards ────────────────────────────────────────────────────────────

function SummaryCards({ summary }: { summary: NonNullable<ReturnType<typeof usePatientsAttention>['summary']> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard value={String(summary.total)} label="Pacientes em atenção" tone="neutral" />
      <MetricCard value={String(summary.pendingPayment)} label="Pagamento pendente" tone="danger" />
      <MetricCard value={String(summary.inactive)} label="Inativos (+90 dias)" tone="danger" />
      <MetricCard value={String(summary.withoutUpcomingAppointment)} label="Sem consulta futura" tone="warning" />
    </div>
  )
}

// ─── Priority badge ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: AttentionPriority }) {
  if (priority === 'HIGH') {
    return (
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300">
        {PRIORITY_LABEL[priority]}
      </span>
    )
  }
  return (
    <StatusBadge tone={PRIORITY_TONE[priority]}>
      {PRIORITY_LABEL[priority]}
    </StatusBadge>
  )
}

// ─── Mobile card ─────────────────────────────────────────────────────────────

function AttentionMobileCard({
  item,
  onSelect,
  avatarUrl,
}: {
  item: PatientAttentionItem
  onSelect: (item: PatientAttentionItem) => void
  avatarUrl?: string | null
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <PatientAvatarWidget name={item.patientName} avatarUrl={avatarUrl} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {item.patientName}
              </h3>
              {item.hasWhatsappConsent && (
                <MessageCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-label="WhatsApp autorizado" />
              )}
            </div>
            {item.patientEmail && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.patientEmail}</p>
            )}
          </div>
        </div>
        <PriorityBadge priority={item.priority} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.allReasons.map((r) => (
          <StatusBadge key={r} tone={REASON_TONE[r]} className="text-xs">
            {REASON_LABEL[r]}
          </StatusBadge>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div>
          <p className="font-medium uppercase tracking-wide">Última consulta</p>
          <p className="mt-0.5 text-foreground">{formatDate(item.lastAppointmentAt)}</p>
        </div>
        {item.pendingAmountCents > 0 && (
          <div>
            <p className="font-medium uppercase tracking-wide">Valor pendente</p>
            <p className="mt-0.5 font-semibold text-red-600 dark:text-red-400">
              {formatCurrencyBR(item.pendingAmountCents / 100)}
            </p>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 w-full"
        onClick={() => onSelect(item)}
      >
        Ver detalhes
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </article>
  )
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function AttentionDetailPanel({
  item,
  onClose,
  avatarUrl,
}: {
  item: PatientAttentionItem | null
  onClose: () => void
  avatarUrl?: string | null
}) {
  return (
    <Dialog.Root open={!!item} onOpenChange={(open: boolean) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-card shadow-xl focus:outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-4">
              <PatientAvatarWidget
                name={item?.patientName ?? ''}
                avatarUrl={avatarUrl}
                size="lg"
              />
              <div>
                <Dialog.Title className="text-base font-semibold text-foreground">
                  {item?.patientName}
                </Dialog.Title>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {item?.patientEmail ?? item?.patientPhone ?? 'Sem contato registrado'}
                </p>
              </div>
            </div>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Fechar painel"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          {item && (
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Priority */}
              <div className="flex items-center gap-3">
                <PriorityBadge priority={item.priority} />
                <span className="text-sm text-muted-foreground">Prioridade de atenção</span>
              </div>

              {/* Reasons */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Motivos de atenção
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.allReasons.map((r) => (
                    <StatusBadge key={r} tone={REASON_TONE[r]}>
                      {REASON_LABEL[r]}
                    </StatusBadge>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Contato
                </p>
                <div className="space-y-1 text-sm">
                  {item.patientPhone ? (
                    <div className="flex items-center gap-2 text-foreground">
                      {item.hasWhatsappConsent && (
                        <MessageCircle className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                      )}
                      <span>{item.patientPhone}</span>
                      {item.hasWhatsappConsent && (
                        <StatusBadge tone="success" className="ml-1">WhatsApp</StatusBadge>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Telefone não cadastrado</p>
                  )}
                  {item.patientEmail && (
                    <p className="wrap-break-word text-foreground">{item.patientEmail}</p>
                  )}
                </div>
              </div>

              {/* Appointments */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Consultas
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-border bg-muted px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">Última consulta</p>
                    <p className="mt-0.5 font-medium text-foreground">
                      {formatDate(item.lastAppointmentAt)}
                    </p>
                    {item.lastProfessionalName && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.lastProfessionalName}
                      </p>
                    )}
                  </div>
                  <div className="rounded-lg border border-border bg-muted px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">Próxima consulta</p>
                    <p className="mt-0.5 font-medium text-foreground">
                      {formatDate(item.nextAppointmentAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pending payment */}
              {item.pendingAmountCents > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50/70 px-4 py-3 dark:border-red-800/40 dark:bg-red-950/20">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                      Valor pendente: {formatCurrencyBR(item.pendingAmountCents / 100)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/80">
                    Consultas concluídas com pagamento em aberto.
                  </p>
                </div>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── Main container ───────────────────────────────────────────────────────────

export function PatientsAttentionContainer() {
  const {
    summary,
    allItems,
    filteredItems,
    avatarsByIdentifier,
    isLoading,
    error,
    search,
    setSearch,
    reasonFilter,
    setReasonFilter,
    priorityFilter,
    setPriorityFilter,
    whatsappFilter,
    setWhatsappFilter,
    hasFilters,
    clearFilters,
    refresh,
  } = usePatientsAttention()

  const [selectedItem, setSelectedItem] = useState<PatientAttentionItem | null>(null)

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Pacientes"
        title="Pacientes que precisam de atenção"
        description="Identifique automaticamente pacientes inativos, com pagamentos pendentes ou que precisam de acompanhamento."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/app/pacientes">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Voltar para pacientes
              </Link>
            </Button>
            <Button variant="outline" onClick={refresh}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Atualizar
            </Button>
          </div>
        }
      />

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Analisando pacientes…"
        error={error}
        onRetry={refresh}
        isEmpty={allItems.length === 0}
        emptyState={
          <EmptyState
            icon={Bell}
            title="Nenhum paciente precisa de atenção"
            description="Todos os seus pacientes estão com consultas em dia e sem pendências."
          />
        }
      >
        <>
          {summary && <SummaryCards summary={summary} />}

          <PanelCard className="p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="Buscar paciente" htmlFor="attentionSearch" className="lg:col-span-2">
                <TextInput
                  id="attentionSearch"
                  placeholder="Nome ou e-mail…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </FormField>
              <FormField label="Motivo" htmlFor="attentionReason">
                <Select
                  value={reasonFilter}
                  onValueChange={(v) => setReasonFilter(v as AttentionReasonFilter)}
                >
                  <SelectTrigger id="attentionReason">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REASON_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Prioridade" htmlFor="attentionPriority">
                <Select
                  value={priorityFilter}
                  onValueChange={(v) => setPriorityFilter(v as AttentionPriorityFilter)}
                >
                  <SelectTrigger id="attentionPriority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <Select
                value={whatsappFilter}
                onValueChange={(v) => setWhatsappFilter(v as WhatsAppFilter)}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WHATSAPP_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </PanelCard>

          <PanelCard>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Lista de atenção
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredItems.length} paciente{filteredItems.length !== 1 ? 's' : ''} encontrado
                  {filteredItems.length !== 1 ? 's' : ''}
                  {hasFilters ? ' com os filtros aplicados' : ''}.
                </p>
              </div>
              <AlertCircle className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              {/* Mobile cards */}
              <div className="space-y-3 bg-muted p-3 lg:hidden">
                {filteredItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                    {hasFilters
                      ? 'Nenhum paciente encontrado para os filtros aplicados.'
                      : 'Nenhum paciente precisa de atenção no momento.'}
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <AttentionMobileCard
                      key={item.identifier}
                      item={item}
                      onSelect={setSelectedItem}
                      avatarUrl={avatarsByIdentifier[item.identifier]}
                    />
                  ))
                )}
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block">
                <table className="w-full text-sm" aria-label="Pacientes que precisam de atenção">
                  <thead>
                    <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th scope="col" className="px-4 py-3">Paciente</th>
                      <th scope="col" className="px-4 py-3">Motivos</th>
                      <th scope="col" className="px-4 py-3">Prioridade</th>
                      <th scope="col" className="hidden px-4 py-3 xl:table-cell">Última consulta</th>
                      <th scope="col" className="hidden px-4 py-3 xl:table-cell">Valor pendente</th>
                      <th scope="col" className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          {hasFilters
                            ? 'Nenhum paciente encontrado para os filtros aplicados.'
                            : 'Nenhum paciente precisa de atenção no momento.'}
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr
                          key={item.identifier}
                          role="button"
                          tabIndex={0}
                          aria-label={`Ver detalhes de ${item.patientName}`}
                          className="cursor-pointer hover:bg-muted/50 focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          onClick={() => setSelectedItem(item)}
                          onKeyDown={(e) => {
                            if (e.target !== e.currentTarget) return
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setSelectedItem(item)
                            }
                          }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <PatientAvatarWidget
                                name={item.patientName}
                                avatarUrl={avatarsByIdentifier[item.identifier]}
                                size="md"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-medium text-foreground">{item.patientName}</p>
                                  {item.hasWhatsappConsent && (
                                    <MessageCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-label="WhatsApp autorizado" />
                                  )}
                                </div>
                                {item.patientEmail && (
                                  <p className="text-xs text-muted-foreground">{item.patientEmail}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {item.allReasons.slice(0, 2).map((r) => (
                                <StatusBadge key={r} tone={REASON_TONE[r]} className="text-xs">
                                  {REASON_LABEL[r]}
                                </StatusBadge>
                              ))}
                              {item.allReasons.length > 2 && (
                                <StatusBadge tone="muted" className="text-xs">
                                  +{item.allReasons.length - 2}
                                </StatusBadge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <PriorityBadge priority={item.priority} />
                          </td>
                          <td className="hidden px-4 py-3 text-foreground xl:table-cell">
                            {formatDate(item.lastAppointmentAt)}
                          </td>
                          <td className="hidden px-4 py-3 xl:table-cell">
                            {item.pendingAmountCents > 0 ? (
                              <span className="font-semibold text-red-600 dark:text-red-400">
                                {formatCurrencyBR(item.pendingAmountCents / 100)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </PanelCard>
        </>
      </ListPageShell>

      <AttentionDetailPanel
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        avatarUrl={selectedItem ? avatarsByIdentifier[selectedItem.identifier] : undefined}
      />
    </AppPage>
  )
}
