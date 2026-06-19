import { AlertTriangle, Building2, FileText } from 'lucide-react'

import { InlineFeedback } from '@/components/common/InlineFeedback'

import type { ReportPreviewResponse } from '../types/reports.types'

interface ReportPreviewPanelProps {
  data: ReportPreviewResponse
}

function formatGeneratedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function ReportPreviewPanel({ data }: ReportPreviewPanelProps) {
  return (
    <div
      className="space-y-3 rounded-lg border border-border bg-muted/20 p-4"
      role="region"
      aria-label="Prévia do relatório"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-semibold text-foreground">Prévia do relatório</span>
      </div>

      {/* Clinic + timestamp */}
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>
            Clínica: <span className="font-medium text-foreground">{data.clinic.name}</span>
          </span>
        </div>
        <p>Gerado em: {formatGeneratedAt(data.generatedAt)}</p>
      </div>

      {/* Period */}
      {data.period && (
        <p className="text-xs text-muted-foreground">
          Período: <span className="font-medium text-foreground">{data.period.label}</span>
        </p>
      )}

      {/* Applied filters */}
      {data.filters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.filters.map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center rounded border border-border bg-background px-2 py-0.5 text-xs text-foreground"
            >
              <span className="text-muted-foreground">{f.label}:</span>
              <span className="ml-1 font-medium">{f.value}</span>
            </span>
          ))}
        </div>
      )}

      {/* Record count */}
      <div className="rounded-md border border-border bg-background px-3 py-2">
        {data.empty ? (
          <p className="text-sm text-muted-foreground">
            Nenhum registro encontrado para os filtros aplicados.
          </p>
        ) : (
          <p className="text-sm">
            <span className="font-semibold text-foreground">
              {data.recordCount.toLocaleString('pt-BR')}
            </span>{' '}
            <span className="text-muted-foreground">
              registro{data.recordCount !== 1 ? 's' : ''} encontrado
              {data.recordCount !== 1 ? 's' : ''}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              (limite: {data.maxRecords.toLocaleString('pt-BR')})
            </span>
          </p>
        )}
      </div>

      {/* Truncation warning */}
      {data.isTruncated && (
        <InlineFeedback tone="warning">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              Este relatório possui mais de 5.000 registros. O arquivo exportado respeitará o limite
              atual de 5.000 registros.
            </span>
          </div>
        </InlineFeedback>
      )}

      {/* CSV disclaimer */}
      <p className="text-xs text-muted-foreground">
        A prévia resume os filtros e a quantidade de registros. O arquivo completo será baixado em
        CSV.
      </p>
    </div>
  )
}
