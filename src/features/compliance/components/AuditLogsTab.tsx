import { ClipboardList } from 'lucide-react'
import { useEffect, useState } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { ListPageShell } from '@/components/common/ListPageShell'
import { Pagination } from '@/components/common/Pagination'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { listAuditLogs } from '../services/compliance.service'
import type {
  AuditLogEntry,
  AuditLogFilters,
  PaginatedResponse,
} from '../types/compliance.types'
import { COMMON_ACTIONS, INITIAL_FILTERS } from '../constants/audit-log-config'
import { formatDatetimeWithSeconds as formatDate } from '../utils/format-date'

function renderMetadata(metadata: Record<string, unknown> | null): string {
  if (!metadata) return '—'
  const safe = { ...metadata }
  // Strip any field that could accidentally contain a raw token or credential
  delete safe['token']
  delete safe['password']
  delete safe['secret']
  delete safe['authorization']
  const str = JSON.stringify(safe)
  return str.length > 120 ? `${str.slice(0, 120)}…` : str
}

type ResolvedState = {
  resolvedKey: string
  data: PaginatedResponse<AuditLogEntry> | null
  error: string | null
}

export function AuditLogsTab() {
  const [filters, setFilters] = useState<AuditLogFilters>(INITIAL_FILTERS)
  const [retryKey, setRetryKey] = useState(0)
  const [resolved, setResolved] = useState<ResolvedState>({ resolvedKey: '', data: null, error: null })

  const requestKey = JSON.stringify({ ...filters, retryKey })
  const isLoading = resolved.resolvedKey !== requestKey
  const result = resolved.data
  const error = resolved.error

  useEffect(() => {
    let cancelled = false
    const key = JSON.stringify({ ...filters, retryKey })
    listAuditLogs(filters)
      .then((data) => {
        if (!cancelled) setResolved({ resolvedKey: key, data, error: null })
      })
      .catch((err: Error) => {
        if (!cancelled) setResolved({ resolvedKey: key, data: null, error: err.message ?? 'Não foi possível carregar os logs.' })
      })
    return () => { cancelled = true }
  }, [filters, retryKey])

  function setFilter<K extends keyof AuditLogFilters>(key: K, value: AuditLogFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value, page: key !== 'page' ? 1 : (value as number) }))
  }

  const hasActiveFilters = !!(filters.action || filters.actorUserId || filters.clinicId || filters.dateFrom || filters.dateTo)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filters.action || '__ALL__'} onValueChange={(v) => setFilter('action', v === '__ALL__' ? '' : v)}>
          <SelectTrigger size="sm" className="w-60">
            <SelectValue placeholder="Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__ALL__">Todas as ações</SelectItem>
            {COMMON_ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilter('dateFrom', e.target.value)}
          title="De"
          aria-label="Data inicial"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:scheme-dark"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilter('dateTo', e.target.value)}
          title="Até"
          aria-label="Data final"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:scheme-dark"
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={() => setFilters(INITIAL_FILTERS)}>
            Limpar filtros
          </Button>
        )}
        {result && (
          <span className="ml-auto text-sm text-muted-foreground">
            {result.total} {result.total === 1 ? 'evento' : 'eventos'}
          </span>
        )}
      </div>

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando logs de auditoria..."
        error={error}
        onRetry={() => setRetryKey((key) => key + 1)}
        isEmpty={!isLoading && !error && (result?.data.length ?? 0) === 0}
        emptyState={
          <EmptyState
            icon={ClipboardList}
            title="Nenhum evento encontrado"
            description="Não há eventos de auditoria para os filtros selecionados."
          />
        }
      >
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm" aria-label="Logs de auditoria">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Ação</th>
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">Entidade</th>
                  <th className="px-4 py-3">Detalhes</th>
                  <th className="px-4 py-3">IP Hash</th>
                  <th className="px-4 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {log.actorUserId ? log.actorUserId.slice(0, 8) + '…' : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {log.entityType ? `${log.entityType}` : '—'}
                      {log.entityId && (
                        <span className="ml-1 font-mono text-xs text-muted-foreground/60">
                          {log.entityId.slice(0, 8)}…
                        </span>
                      )}
                    </td>
                    <td className="max-w-xs px-4 py-3 font-mono text-xs text-muted-foreground">
                      <span title={log.metadata ? JSON.stringify(log.metadata) : undefined}>
                        {renderMetadata(log.metadata)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground/60">
                      {log.ipHash ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-border md:hidden">
            {result?.data.map((log) => (
              <div key={log.id} className="space-y-1 p-4">
                <span className="inline-block rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                  {log.action}
                </span>
                {log.actorUserId && (
                  <p className="font-mono text-xs text-muted-foreground">Usuário: {log.actorUserId.slice(0, 8)}…</p>
                )}
                <p className="font-mono text-xs text-muted-foreground/60">{renderMetadata(log.metadata)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>

        {result && result.totalPages > 1 && (
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            filteredCount={result.total}
            pageSize={result.limit}
            onPageChange={(p) => setFilter('page', p)}
            onPageSizeChange={(l) => setFilter('limit', l)}
            pageSizeOptions={[20, 50, 100]}
          />
        )}
      </ListPageShell>
    </div>
  )
}
