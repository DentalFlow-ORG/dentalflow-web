import type { ReactNode } from 'react'
import { AlertTriangle, Mail } from 'lucide-react'

import { cn } from '@/lib/utils'

// Exportable class for inline links within legal page body text.
// Use in Block 4 when applying per-page polish to <a> elements.
export const legalInlineLinkClass =
  'text-primary underline decoration-primary/50 underline-offset-2 transition-colors hover:text-primary/80 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm'

// ── LegalSection ──────────────────────────────────────────────────────────────

type LegalSectionProps = {
  id?: string
  title: string
  children: ReactNode
  className?: string
}

export function LegalSection({ id, title, children, className }: LegalSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'mt-12 border-t border-slate-100 pt-12 first:mt-0 first:border-t-0 first:pt-0',
        className,
      )}
    >
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-4 space-y-4 leading-7 text-slate-600">{children}</div>
    </section>
  )
}

// ── LegalPageHeader ───────────────────────────────────────────────────────────

type LegalPageHeaderProps = {
  badge: string
  title: string
  description: string
  lastUpdated: string
}

export function LegalPageHeader({ badge, title, description, lastUpdated }: LegalPageHeaderProps) {
  return (
    <div className="mb-14 border-b border-slate-200 pb-10">
      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        {badge}
      </span>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-7 text-slate-500">{description}</p>
      <p className="mt-3 text-sm text-slate-400">Última atualização: {lastUpdated}</p>
      <div className="mt-6 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
        <p>
          <strong>Aviso:</strong> Este documento é um modelo informativo e deve ser revisado
          juridicamente por advogado especializado antes do uso em produção.
        </p>
      </div>
    </div>
  )
}

// ── LegalList ─────────────────────────────────────────────────────────────────

type LegalListProps = {
  items: string[]
  ordered?: boolean
}

export function LegalList({ items, ordered = false }: LegalListProps) {
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag className={cn('space-y-2 pl-5 text-sm', ordered ? 'list-decimal' : 'list-disc')}>
      {items.map((item) => (
        <li key={item} className="leading-7">
          {item}
        </li>
      ))}
    </Tag>
  )
}

// ── LegalTOC ─────────────────────────────────────────────────────────────────

type TocEntry = { id: string; label: string }

type LegalTOCProps = {
  entries: TocEntry[]
  className?: string
}

export function LegalTOC({ entries, className }: LegalTOCProps) {
  return (
    <nav
      aria-label="Índice do documento"
      className={cn(
        'mb-12 rounded-2xl border border-slate-200 bg-white p-6',
        className,
      )}
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        Neste documento
      </p>
      <ol className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
        {entries.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="block rounded-sm py-1 text-sm leading-5 text-slate-700 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

// ── LegalContactBlock ─────────────────────────────────────────────────────────

type LegalContactBlockProps = {
  email: string
  message?: string
}

export function LegalContactBlock({ email, message }: LegalContactBlockProps) {
  return (
    <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <p className="text-sm font-semibold text-slate-900">Dúvidas sobre este documento?</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        {message ?? 'Se tiver dúvidas sobre este documento, entre em contato pelos canais oficiais.'}
      </p>
      <a
        href={`mailto:${email}`}
        className={cn('mt-3 inline-flex items-center gap-2 text-sm', legalInlineLinkClass)}
      >
        <Mail className="h-4 w-4" aria-hidden="true" />
        {email}
      </a>
    </div>
  )
}

// ── LegalTable ────────────────────────────────────────────────────────────────

type LegalTableProps = {
  headers: string[]
  rows: string[][]
}

export function LegalTable({ headers, rows }: LegalTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-160 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-slate-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-slate-200 even:bg-slate-50/50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-slate-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
