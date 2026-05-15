import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type LegalSectionProps = {
  id?: string
  title: string
  children: ReactNode
  className?: string
}

export function LegalSection({ id, title, children, className }: LegalSectionProps) {
  return (
    <section id={id} className={cn('mt-10 first:mt-0', className)}>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-4 text-slate-600 leading-7">{children}</div>
    </section>
  )
}

type LegalPageHeaderProps = {
  badge: string
  title: string
  description: string
  lastUpdated: string
}

export function LegalPageHeader({ badge, title, description, lastUpdated }: LegalPageHeaderProps) {
  return (
    <div className="mb-12 border-b border-slate-200 pb-8">
      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        {badge}
      </span>
      <h1 className="mt-4 text-4xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-500 leading-7">{description}</p>
      <p className="mt-4 text-sm text-slate-400">Última atualização: {lastUpdated}</p>
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Aviso:</strong> Este documento é um modelo informativo e deve ser revisado
        juridicamente por advogado especializado antes do uso em produção.
      </div>
    </div>
  )
}

type LegalListProps = {
  items: string[]
  ordered?: boolean
}

export function LegalList({ items, ordered = false }: LegalListProps) {
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag className={cn('space-y-2 pl-5', ordered ? 'list-decimal' : 'list-disc')}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </Tag>
  )
}

type LegalTableProps = {
  headers: string[]
  rows: string[][]
}

export function LegalTable({ headers, rows }: LegalTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left font-semibold text-slate-700"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-slate-200">
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
