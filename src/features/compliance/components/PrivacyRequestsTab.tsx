import { ShieldAlert } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { ListPageShell } from '@/components/common/ListPageShell'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HomeEmptyState } from '@/features/home/components/HomeEmptyState'

import {
  REQUESTER_TYPE_LABEL,
  REQUEST_TYPE_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
} from '../constants/privacy-request-display'
import { INITIAL_FILTERS } from '../constants/privacy-request-filters'
import { listPrivacyRequests } from '../services/compliance.service'
import type {
  PaginatedResponse,
  PrivacyRequest,
  PrivacyRequestFilters,
  PrivacyRequestStatus,
  PrivacyRequestType,
} from '../types/compliance.types'
import { formatDatetime as formatDate } from '../utils/format-date'

export function PrivacyRequestsTab() {
  const [filters, setFilters] = useState<PrivacyRequestFilters>(INITIAL_FILTERS)
  const [result, setResult] = useState<PaginatedResponse<PrivacyRequest> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setIsLoading(true)
    setError(null)
    listPrivacyRequests(filters)
      .then(setResult)
      .catch((err: Error) => setError(err.message ?? 'Não foi possível carregar as solicitações.'))
      .finally(() => setIsLoading(false))
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  function setFilter<K extends keyof PrivacyRequestFilters>(
    key: K,
    value: PrivacyRequestFilters[K],
  ) {
    setFilters((prev) => ({ ...prev, [key]: value, page: key !== 'page' ? 1 : (value as number) }))
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por código, e-mail ou nome..."
          aria-label="Buscar solicitações"
          maxLength={100}
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <Select
          value={filters.status || '__ALL__'}
          onValueChange={(v) =>
            setFilter('status', v === '__ALL__' ? '' : (v as PrivacyRequestStatus))
          }
        >
          <SelectTrigger size="sm" className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__ALL__">Todos os status</SelectItem>
            {(Object.keys(STATUS_LABEL) as PrivacyRequestStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.requestType || '__ALL__'}
          onValueChange={(v) =>
            setFilter('requestType', v === '__ALL__' ? '' : (v as PrivacyRequestType))
          }
        >
          <SelectTrigger size="sm" className="w-52">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__ALL__">Todos os tipos</SelectItem>
            {(Object.keys(REQUEST_TYPE_LABEL) as PrivacyRequestType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {REQUEST_TYPE_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(filters.status || filters.requestType || filters.requesterType || filters.search) && (
          <Button variant="ghost" size="sm" onClick={() => setFilters(INITIAL_FILTERS)}>
            Limpar filtros
          </Button>
        )}
        {result && (
          <span className="ml-auto text-sm text-muted-foreground">
            {result.total} {result.total === 1 ? 'solicitação' : 'solicitações'}
          </span>
        )}
      </div>

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando solicitações..."
        error={error}
        onRetry={load}
        isEmpty={!isLoading && !error && (result?.data.length ?? 0) === 0}
        emptyState={
          <HomeEmptyState
            compact
            icon={ShieldAlert}
            title="Nenhuma solicitação encontrada"
            description="Não há solicitações de privacidade para os filtros selecionados."
          />
        }
      >
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm" aria-label="Solicitações LGPD">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Tipo solicitante</th>
                  <th className="px-4 py-3">Tipo solicitação</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {req.requestCode}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{req.requesterName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{req.requesterEmail ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {REQUESTER_TYPE_LABEL[req.requesterType] ?? req.requesterType}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {REQUEST_TYPE_LABEL[req.requestType] ?? req.requestType}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={STATUS_TONE[req.status]}>
                        {STATUS_LABEL[req.status]}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                      {formatDate(req.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-border md:hidden">
            {result?.data.map((req) => (
              <div key={req.id} className="space-y-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{req.requestCode}</span>
                  <StatusBadge tone={STATUS_TONE[req.status]}>
                    {STATUS_LABEL[req.status]}
                  </StatusBadge>
                </div>
                <p className="font-medium text-foreground">{req.requesterName}</p>
                {req.requesterEmail && (
                  <p className="text-sm text-muted-foreground">{req.requesterEmail}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {REQUEST_TYPE_LABEL[req.requestType] ?? req.requestType}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(req.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>

        {result && (
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
