import { Cookie } from 'lucide-react'
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

import { listCookieConsents } from '../services/compliance.service'
import type {
  CookieConsentFilters,
  CookieConsentLog,
  PaginatedResponse,
} from '../types/compliance.types'

const INITIAL_FILTERS: CookieConsentFilters = {
  source: '',
  policyVersion: '',
  userId: '',
  dateFrom: '',
  dateTo: '',
  page: 1,
  limit: 20,
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function CategoryDots({ categories }: { categories: CookieConsentLog['categories'] }) {
  const items: [string, boolean][] = [
    ['Necessários', categories.necessary],
    ['Preferências', categories.preferences],
    ['Analíticos', categories.analytics],
    ['Marketing', categories.marketing],
  ]
  return (
    <div className="flex flex-wrap gap-1">
      {items.map(([label, enabled]) => (
        <StatusBadge key={label} tone={enabled ? 'success' : 'muted'}>
          {label}
        </StatusBadge>
      ))}
    </div>
  )
}

export function CookieConsentLogsTab() {
  const [filters, setFilters] = useState<CookieConsentFilters>(INITIAL_FILTERS)
  const [result, setResult] = useState<PaginatedResponse<CookieConsentLog> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setIsLoading(true)
    setError(null)
    listCookieConsents(filters)
      .then(setResult)
      .catch((err: Error) =>
        setError(err.message ?? 'Não foi possível carregar os consentimentos.'),
      )
      .finally(() => setIsLoading(false))
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  function setFilter<K extends keyof CookieConsentFilters>(key: K, value: CookieConsentFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value, page: key !== 'page' ? 1 : (value as number) }))
  }

  const hasActiveFilters = !!(
    filters.source ||
    filters.policyVersion ||
    filters.userId ||
    filters.dateFrom ||
    filters.dateTo
  )

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.source || '__ALL__'}
          onValueChange={(v) => setFilter('source', v === '__ALL__' ? '' : v)}
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__ALL__">Todas as origens</SelectItem>
            <SelectItem value="banner">Banner</SelectItem>
            <SelectItem value="preferences">Preferências</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilter('dateFrom', e.target.value)}
          aria-label="Data inicial"
          title="De"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:[color-scheme:dark]"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilter('dateTo', e.target.value)}
          aria-label="Data final"
          title="Até"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:[color-scheme:dark]"
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={() => setFilters(INITIAL_FILTERS)}>
            Limpar filtros
          </Button>
        )}
        {result && (
          <span className="ml-auto text-sm text-muted-foreground">
            {result.total} {result.total === 1 ? 'registro' : 'registros'}
          </span>
        )}
      </div>

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando consentimentos..."
        error={error}
        onRetry={load}
        isEmpty={!isLoading && !error && (result?.data.length ?? 0) === 0}
        emptyState={
          <HomeEmptyState
            compact
            icon={Cookie}
            title="Nenhum consentimento encontrado"
            description="Não há registros de cookie consent para os filtros selecionados."
          />
        }
      >
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm" aria-label="Consentimentos de cookies">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Origem</th>
                  <th className="px-4 py-3">Versão</th>
                  <th className="px-4 py-3">Categorias aceitas</th>
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">IP Hash</th>
                  <th className="px-4 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.data.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/40 transition-colors align-top">
                    <td className="px-4 py-3">
                      <StatusBadge tone={log.source === 'banner' ? 'warning' : 'muted'}>
                        {log.source === 'banner' ? 'Banner' : 'Preferências'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{log.policyVersion}</td>
                    <td className="px-4 py-3">
                      <CategoryDots categories={log.categories} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {log.userId
                        ? `${log.userId.slice(0, 8)}…`
                        : log.anonymousId
                          ? `anon: ${log.anonymousId.slice(0, 8)}…`
                          : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground/60">
                      {log.ipHash ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-border md:hidden">
            {result?.data.map((log) => (
              <div key={log.id} className="space-y-2 p-4">
                <div className="flex items-center gap-2">
                  <StatusBadge tone={log.source === 'banner' ? 'warning' : 'muted'}>
                    {log.source === 'banner' ? 'Banner' : 'Preferências'}
                  </StatusBadge>
                  <span className="text-xs text-muted-foreground">v{log.policyVersion}</span>
                </div>
                <CategoryDots categories={log.categories} />
                <p className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
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
