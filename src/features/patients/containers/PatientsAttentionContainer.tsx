import { useMemo, useState } from 'react'

import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Users2,
  X,
} from 'lucide-react'
import { Dialog } from 'radix-ui'

import { FormField, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { AppPage } from '@/components/layout/AppPage'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrencyBR } from '@/lib/number-formatters'

import { HomeActionGrid } from '@/features/home/components/HomeActionGrid'
import { HomeDashboardHeader } from '@/features/home/components/HomeDashboardHeader'
import { HomeEmptyState } from '@/features/home/components/HomeEmptyState'
import { HomeKpiCard } from '@/features/home/components/HomeKpiCard'
import { HomeQuickActionCard } from '@/features/home/components/HomeQuickActionCard'
import { HomeSection } from '@/features/home/components/HomeSection'

import { AttentionReasonBadge } from '../components/AttentionReasonBadge'
import { PatientAvatar } from '../components/PatientAvatar'
import { PatientIdentityBadge } from '../components/PatientIdentityBadge'
import { PatientPriorityBadge } from '../components/PatientPriorityBadge'

import { PRIORITY_OPTIONS, REASON_OPTIONS, WHATSAPP_OPTIONS } from '../constants/attention-display'
import {
  type AttentionPriorityFilter,
  type AttentionReasonFilter,
  type WhatsAppFilter,
  usePatientsAttention,
} from '../hooks/usePatientsAttention'
import type { PatientAttentionItem } from '../types/attention.types'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

// ── Mobile card ───────────────────────────────────────────────────────────────

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
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <PatientIdentityBadge
          name={item.patientName}
          email={item.patientEmail}
          phone={item.patientPhone}
          avatarUrl={avatarUrl}
          size="md"
          className="min-w-0 flex-1"
        />
        <PatientPriorityBadge priority={item.priority} />
      </div>

      {/* WhatsApp consent indicator */}
      {item.hasWhatsappConsent && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <MessageCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>WhatsApp autorizado</span>
        </div>
      )}

      {/* Reason badges */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.allReasons.map((r) => (
          <AttentionReasonBadge key={r} reason={r} />
        ))}
      </div>

      {/* Meta info */}
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
        aria-label={`Ver detalhes de ${item.patientName}`}
        className="mt-4 w-full"
        onClick={() => onSelect(item)}
      >
        Ver detalhes
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </article>
  )
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function AttentionDetailPanel({
  item,
  onClose,
  avatarUrl,
}: {
  item: PatientAttentionItem | null
  onClose: () => void
  avatarUrl?: string | null
}) {
  const hasPhone = !!item?.patientPhone
  const hasEmail = !!item?.patientEmail

  return (
    <Dialog.Root open={!!item} onOpenChange={(open: boolean) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex w-full flex-col overflow-hidden bg-card shadow-xl focus:outline-none sm:inset-y-0 sm:left-auto sm:right-0 sm:max-w-md"
          aria-describedby={undefined}
        >
          {/* ── Header ── */}
          <div className="flex items-start gap-3 border-b border-border bg-gradient-to-br from-muted/50 to-transparent px-5 py-5">
            <PatientAvatar name={item?.patientName ?? ''} avatarUrl={avatarUrl} size="lg" />
            <div className="min-w-0 flex-1 pt-0.5">
              <Dialog.Title className="text-base font-semibold text-foreground">
                {item?.patientName}
              </Dialog.Title>
              {item && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <PatientPriorityBadge priority={item.priority} />
                  {item.allReasons[0] && <AttentionReasonBadge reason={item.allReasons[0]} />}
                </div>
              )}
              {item?.patientEmail && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.patientEmail}</span>
                </p>
              )}
              {item?.patientPhone && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>{item.patientPhone}</span>
                </p>
              )}
              {!item?.patientEmail && !item?.patientPhone && (
                <p className="mt-0.5 text-xs text-muted-foreground">Sem contato registrado</p>
              )}
            </div>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Fechar painel"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          {/* ── Action strip ── */}
          {item && (hasPhone || hasEmail) && (
            <div className="flex flex-wrap gap-2 border-b border-border bg-card px-5 py-3">
              {hasPhone && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${item.patientPhone}`}>
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    Ligar
                  </a>
                </Button>
              )}
              {hasPhone && item.hasWhatsappConsent && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://wa.me/${item.patientPhone!.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    WhatsApp
                  </a>
                </Button>
              )}
              {hasEmail && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${item.patientEmail}`}>
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    E-mail
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link to="/app/agendamentos">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  Agendar
                </Link>
              </Button>
            </div>
          )}

          {/* ── Content ── */}
          {item && (
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              {/* Priority */}
              <div className="flex items-center gap-3">
                <PatientPriorityBadge priority={item.priority} />
                <span className="text-sm text-muted-foreground">Prioridade de atenção</span>
              </div>

              {/* Reasons */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Motivos de atenção
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.allReasons.map((r) => (
                    <AttentionReasonBadge key={r} reason={r} />
                  ))}
                </div>
              </div>

              {/* Appointments */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Consultas
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-border bg-muted/60 px-3 py-2.5">
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
                  <div className="rounded-xl border border-border bg-muted/60 px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">Próxima consulta</p>
                    <p className="mt-0.5 font-medium text-foreground">
                      {formatDate(item.nextAppointmentAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pending payment */}
              {item.pendingAmountCents > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50/70 px-4 py-3 dark:border-red-800/40 dark:bg-red-950/20">
                  <div className="flex items-center gap-2">
                    <CreditCard
                      className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                      Valor pendente: {formatCurrencyBR(item.pendingAmountCents / 100)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/80">
                    Consultas concluídas com pagamento em aberto.
                  </p>
                </div>
              )}

              {/* WhatsApp consent note */}
              {item.hasWhatsappConsent && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/20">
                  <MessageCircle
                    className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Paciente autorizou contato via WhatsApp.
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

// ── Main container ────────────────────────────────────────────────────────────

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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  // Clamp page to valid range when filters reduce the result set
  const effectivePage = Math.min(page, totalPages)
  const paginatedItems = useMemo(
    () => filteredItems.slice((effectivePage - 1) * pageSize, effectivePage * pageSize),
    [filteredItems, effectivePage, pageSize],
  )

  const highPriorityCount = allItems.filter((i) => i.priority === 'HIGH').length

  return (
    <AppPage spacing="loose">
      <HomeDashboardHeader
        eyebrow="Pacientes"
        title="Pacientes em atenção"
        description="Priorize retornos, pendências e pacientes que precisam de contato."
        badge={
          highPriorityCount > 0 ? (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
              {highPriorityCount} alta prioridade
            </span>
          ) : undefined
        }
        actions={
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

      {/* Error state */}
      {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

      {/* Loading state */}
      {isLoading && <LoadingCard message="Analisando pacientes…" />}

      {/* All clear – no patients need attention */}
      {!isLoading && !error && allItems.length === 0 && (
        <HomeEmptyState
          icon={Bell}
          title="Todos os pacientes estão em dia"
          description="Nenhuma pendência clínica, financeira ou de retorno foi encontrada."
        />
      )}

      {/* Main content */}
      {!isLoading && allItems.length > 0 && (
        <>
          {/* KPI row */}
          {summary && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <HomeKpiCard
                label="Pacientes em atenção"
                value={String(summary.total)}
                icon={AlertCircle}
                tone={summary.total > 0 ? 'warning' : 'neutral'}
              />
              <HomeKpiCard
                label="Pagamento pendente"
                value={String(summary.pendingPayment)}
                icon={CreditCard}
                tone={summary.pendingPayment > 0 ? 'danger' : 'neutral'}
              />
              <HomeKpiCard
                label="Inativos (+90 dias)"
                value={String(summary.inactive)}
                icon={Users2}
                tone={summary.inactive > 0 ? 'warning' : 'neutral'}
              />
              <HomeKpiCard
                label="Sem consulta futura"
                value={String(summary.withoutUpcomingAppointment)}
                icon={CalendarDays}
                tone={summary.withoutUpcomingAppointment > 0 ? 'info' : 'neutral'}
              />
            </div>
          )}

          {/* Filters */}
          <PanelCard className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FormField
                label="Buscar paciente"
                htmlFor="attentionSearch"
                className="lg:col-span-2"
              >
                <TextInput
                  id="attentionSearch"
                  placeholder="Nome ou e-mail…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </FormField>
              <FormField label="Motivo" htmlFor="attentionReason">
                <Select
                  value={reasonFilter}
                  onValueChange={(v) => {
                    setReasonFilter(v as AttentionReasonFilter)
                    setPage(1)
                  }}
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
                  onValueChange={(v) => {
                    setPriorityFilter(v as AttentionPriorityFilter)
                    setPage(1)
                  }}
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
              <FormField label="WhatsApp" htmlFor="attentionWhatsapp">
                <Select
                  value={whatsappFilter}
                  onValueChange={(v) => {
                    setWhatsappFilter(v as WhatsAppFilter)
                    setPage(1)
                  }}
                >
                  <SelectTrigger id="attentionWhatsapp">
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
              </FormField>
            </div>
            {hasFilters && (
              <div className="mt-3 flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Limpar filtros
                </Button>
              </div>
            )}
          </PanelCard>

          {/* Attention list */}
          <HomeSection
            title="Fila de acompanhamento"
            description={
              filteredItems.length > 0
                ? `${filteredItems.length} paciente${filteredItems.length !== 1 ? 's' : ''} encontrado${filteredItems.length !== 1 ? 's' : ''}${hasFilters ? ' com os filtros aplicados' : ''}.`
                : 'Pacientes ordenados por prioridade e motivo de atenção.'
            }
          >
            {/* Mobile cards */}
            <div className="mt-4 space-y-3 lg:hidden">
              {filteredItems.length === 0 ? (
                <HomeEmptyState
                  compact
                  icon={Bell}
                  title={
                    hasFilters ? 'Nenhum paciente encontrado' : 'Todos os pacientes estão em dia'
                  }
                  description={
                    hasFilters
                      ? 'Ajuste os filtros para ampliar a busca.'
                      : 'Nenhuma pendência encontrada.'
                  }
                />
              ) : (
                paginatedItems.map((item) => (
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
            <div className="mt-4 hidden overflow-hidden rounded-lg border border-border lg:block">
              <table className="w-full text-sm" aria-label="Pacientes que precisam de atenção">
                <thead>
                  <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="px-4 py-3">
                      Paciente
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Motivos
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Prioridade
                    </th>
                    <th scope="col" className="hidden px-4 py-3 xl:table-cell">
                      Última consulta
                    </th>
                    <th scope="col" className="hidden px-4 py-3 xl:table-cell">
                      Valor pendente
                    </th>
                    <th scope="col" className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10">
                        <HomeEmptyState
                          compact
                          icon={Bell}
                          title={
                            hasFilters
                              ? 'Nenhum paciente encontrado'
                              : 'Todos os pacientes estão em dia'
                          }
                          description={
                            hasFilters
                              ? 'Ajuste os filtros para ampliar a busca.'
                              : 'Nenhuma pendência encontrada.'
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => (
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
                          <PatientIdentityBadge
                            name={item.patientName}
                            email={item.patientEmail}
                            avatarUrl={avatarsByIdentifier[item.identifier]}
                            size="md"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.allReasons.slice(0, 2).map((r) => (
                              <AttentionReasonBadge key={r} reason={r} />
                            ))}
                            {item.allReasons.length > 2 && (
                              <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                                +{item.allReasons.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <PatientPriorityBadge priority={item.priority} />
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
                          <ChevronRight
                            className="ml-auto h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredItems.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <Pagination
                  page={effectivePage}
                  totalPages={totalPages}
                  filteredCount={filteredItems.length}
                  pageSize={pageSize}
                  pageSizeOptions={[10, 25, 50]}
                  onPageChange={setPage}
                  onPageSizeChange={(s) => {
                    setPageSize(s)
                    setPage(1)
                  }}
                />
              </div>
            )}
          </HomeSection>

          {/* Quick navigation */}
          <HomeActionGrid columns={2}>
            <HomeQuickActionCard
              title="Ver todos os pacientes"
              description="Lista completa de pacientes com histórico de consultas"
              icon={Users2}
              to="/app/pacientes"
            />
            <HomeQuickActionCard
              title="Agendar consulta"
              description="Crie um novo agendamento para acompanhar um paciente"
              icon={CalendarDays}
              to="/app/agendamentos"
            />
          </HomeActionGrid>
        </>
      )}

      <AttentionDetailPanel
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        avatarUrl={selectedItem ? avatarsByIdentifier[selectedItem.identifier] : undefined}
      />
    </AppPage>
  )
}
