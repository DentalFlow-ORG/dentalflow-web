import { Download, Loader2, RotateCcw, ScanSearch } from 'lucide-react'
import { useId, useState } from 'react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { cn } from '@/lib/utils'

import type { ReportPreviewResponse } from '../types/reports.types'
import { ReportPreviewPanel } from './ReportPreviewPanel'

export type ReportCardTone = 'neutral' | 'primary' | 'info' | 'warning' | 'success'

const TONE_BORDER_TOP: Record<ReportCardTone, string> = {
  neutral: '',
  primary: 'border-t-2 border-t-primary',
  info:    'border-t-2 border-t-blue-400 dark:border-t-blue-500',
  warning: 'border-t-2 border-t-amber-400 dark:border-t-amber-500',
  success: 'border-t-2 border-t-emerald-500 dark:border-t-emerald-400',
}

type PreviewState =
  | { mode: 'idle' }
  | { mode: 'previewing' }
  | { mode: 'previewed'; data: ReportPreviewResponse }
  | { mode: 'error'; message: string }

interface ReportCardProps {
  title: string
  description: string
  notice?: string
  tone?: ReportCardTone
  error?: string | null
  children?: React.ReactNode
  onExport: () => Promise<void>
  onPreview?: () => Promise<ReportPreviewResponse>
  disabled?: boolean
}

export function ReportCard({
  title,
  description,
  notice,
  tone = 'neutral',
  error,
  children,
  onExport,
  onPreview,
  disabled = false,
}: ReportCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewState, setPreviewState] = useState<PreviewState>({ mode: 'idle' })
  const { showAlert } = useGlobalAlerts()
  const errorId = useId()

  async function handlePreview() {
    if (!onPreview) return
    setPreviewState({ mode: 'previewing' })
    try {
      const data = await onPreview()
      setPreviewState({ mode: 'previewed', data })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível carregar a prévia do relatório.'
      setPreviewState({ mode: 'error', message })
    }
  }

  async function handleExport() {
    setIsLoading(true)
    try {
      await onExport()
      showAlert({
        title: 'Relatório gerado',
        description: 'O download do arquivo CSV foi iniciado.',
        tone: 'success',
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível gerar o relatório.'
      showAlert({ title: 'Erro ao exportar', description: message, tone: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  function resetPreview() {
    setPreviewState({ mode: 'idle' })
  }

  const isPreviewing = previewState.mode === 'previewing'
  const hasPreviewed = previewState.mode === 'previewed'
  const hasPreviewError = previewState.mode === 'error'
  const canDownload =
    hasPreviewed && !previewState.data.empty

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card shadow-sm',
        TONE_BORDER_TOP[tone],
      )}
    >
      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="space-y-4 p-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </div>
          <span className="mt-0.5 shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
            CSV
          </span>
        </div>

        {/* Filters / children */}
        {children && <div className="space-y-3">{children}</div>}

        {/* Internal notice */}
        {notice && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
            {notice}
          </p>
        )}

        {/* Date/validation error */}
        {error && (
          <div id={errorId}>
            <InlineFeedback tone="error">{error}</InlineFeedback>
          </div>
        )}

        {/* Preview panel */}
        {hasPreviewed && <ReportPreviewPanel data={previewState.data} />}

        {/* Preview API error */}
        {hasPreviewError && (
          <InlineFeedback tone="error">{previewState.message}</InlineFeedback>
        )}
      </div>

      {/* ── Footer / action area ──────────────────────────────────────────── */}
      <div className="border-t border-border px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          {onPreview ? (
            <>
              {/* Cards with preview capability */}
              {(hasPreviewed || hasPreviewError) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetPreview}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Nova prévia
                </Button>
              )}

              {canDownload ? (
                <Button
                  size="sm"
                  onClick={handleExport}
                  disabled={isLoading || disabled}
                  className="w-full sm:w-auto"
                  aria-describedby={disabled && !isLoading && !!error ? errorId : undefined}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                      Baixar CSV
                    </>
                  )}
                </Button>
              ) : !hasPreviewed ? (
                <Button
                  size="sm"
                  onClick={handlePreview}
                  disabled={isPreviewing || disabled}
                  className="w-full sm:w-auto"
                  aria-describedby={disabled && !isPreviewing && !!error ? errorId : undefined}
                >
                  {isPreviewing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Carregando prévia...
                    </>
                  ) : (
                    <>
                      <ScanSearch className="mr-2 h-4 w-4" aria-hidden="true" />
                      Pré-visualizar relatório
                    </>
                  )}
                </Button>
              ) : null}
            </>
          ) : (
            /* Cards without preview (e.g. Leads) — direct export */
            <Button
              size="sm"
              onClick={handleExport}
              disabled={isLoading || disabled}
              className="w-full sm:w-auto"
              aria-describedby={disabled && !isLoading && !!error ? errorId : undefined}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                  Exportar CSV
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
