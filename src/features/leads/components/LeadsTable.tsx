import { Archive, Loader2, Pencil } from 'lucide-react'
import { ActionIconButton } from '@/components/common/ActionIconButton'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { todayIso } from '@/lib/date-range-rules'
import { cn } from '@/lib/utils'
import type { Lead, LeadStatus } from '../types/leads.types'
import { LeadSourceBadge } from './LeadSourceBadge'
import { LeadStatusBadge } from './LeadStatusBadge'

const ACTIVE_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'SCHEDULED']

function isOverdue(nextFollowUpAt: string | null, status: LeadStatus): boolean {
  if (!nextFollowUpAt) return false
  if (!ACTIVE_STATUSES.includes(status)) return false
  return nextFollowUpAt.split('T')[0] < todayIso()
}

function formatFollowUp(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function getUserName(user: { firstName: string; lastName: string } | null) {
  if (!user) return '—'
  return `${user.firstName} ${user.lastName}`
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-muted animate-pulse" style={{ width: `${60 + (i * 17) % 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

interface MobileCardProps {
  lead: Lead
  onView: (l: Lead) => void
  onEdit: (l: Lead) => void
  onArchive: (l: Lead) => void
}

function MobileCard({ lead, onView, onEdit, onArchive }: MobileCardProps) {
  return (
    <div
      className={cn(
        'cursor-pointer rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm',
        lead.status === 'ARCHIVED' && 'opacity-60',
      )}
      onClick={() => onView(lead)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{lead.name}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {lead.phone ?? lead.email ?? 'Sem contato'}
          </p>
        </div>
        <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
          <ActionIconButton
            title="Editar"
            onClick={() => onEdit(lead)}
          >
            <Pencil className="h-4 w-4" />
          </ActionIconButton>
          <ActionIconButton
            tone="danger"
            title="Arquivar"
            onClick={() => onArchive(lead)}
          >
            <Archive className="h-4 w-4" />
          </ActionIconButton>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <LeadStatusBadge status={lead.status} />
        <LeadSourceBadge source={lead.source} />
      </div>

      {lead.nextFollowUpAt && (
        isOverdue(lead.nextFollowUpAt, lead.status) ? (
          <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
            Retorno atrasado · {formatFollowUp(lead.nextFollowUpAt)}
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            Follow-up: {formatFollowUp(lead.nextFollowUpAt)}
          </p>
        )
      )}
    </div>
  )
}

interface LeadsTableProps {
  leads: Lead[]
  total: number
  isLoading: boolean
  page: number
  limit: number
  onPageChange: (page: number) => void
  onView: (lead: Lead) => void
  onEdit: (lead: Lead) => void
  onArchive: (lead: Lead) => void
}

export function LeadsTable({
  leads,
  total,
  isLoading,
  page,
  limit,
  onPageChange,
  onView,
  onEdit,
  onArchive,
}: LeadsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <PanelCard>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Lista de leads</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {total} lead{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        {isLoading && (
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {['Lead', 'Contato', 'Origem', 'Status', 'Responsável', 'Follow-up', ''].map((h, i) => (
                <th
                  key={i}
                  className="px-4 pb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && leads.length === 0
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-muted/40',
                      lead.status === 'ARCHIVED' && 'opacity-60',
                    )}
                    onClick={() => onView(lead)}
                  >
                    <td className="px-4 py-3">
                      <p className="max-w-45 truncate font-medium text-foreground">
                        {lead.name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="space-y-0.5">
                        {lead.phone && <p className="text-xs">{lead.phone}</p>}
                        {lead.email && (
                          <p className="truncate text-xs max-w-40">{lead.email}</p>
                        )}
                        {!lead.phone && !lead.email && <p className="text-xs">—</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <LeadSourceBadge source={lead.source} />
                    </td>
                    <td className="px-4 py-3">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {getUserName(lead.assignedTo)}
                    </td>
                    <td className="px-4 py-3">
                      {lead.nextFollowUpAt ? (
                        isOverdue(lead.nextFollowUpAt, lead.status) ? (
                          <div>
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                              {formatFollowUp(lead.nextFollowUpAt)}
                            </p>
                            <p className="text-xs text-red-500 dark:text-red-400">
                              Retorno atrasado
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {formatFollowUp(lead.nextFollowUpAt)}
                          </span>
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ActionIconButton title="Editar" onClick={() => onEdit(lead)}>
                          <Pencil className="h-4 w-4" />
                        </ActionIconButton>
                        <ActionIconButton
                          tone="danger"
                          title="Arquivar"
                          onClick={() => onArchive(lead)}
                        >
                          <Archive className="h-4 w-4" />
                        </ActionIconButton>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {isLoading && leads.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg border border-border animate-pulse bg-muted/40" />
            ))
          : leads.map((lead) => (
              <MobileCard
                key={lead.id}
                lead={lead}
                onView={onView}
                onEdit={onEdit}
                onArchive={onArchive}
              />
            ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={totalPages}
            filteredCount={total}
            pageSize={limit}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </PanelCard>
  )
}
