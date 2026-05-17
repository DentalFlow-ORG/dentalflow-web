import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { cn } from '@/lib/utils'

interface ReportCardProps {
  title: string
  description: string
  notice?: string
  children?: React.ReactNode
  onExport: () => Promise<void>
  disabled?: boolean
}

export function ReportCard({
  title,
  description,
  notice,
  children,
  onExport,
  disabled = false,
}: ReportCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { showAlert } = useGlobalAlerts()

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

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>

      {children && <div className="space-y-3">{children}</div>}

      {notice && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
          {notice}
        </p>
      )}

      <Button
        size="sm"
        onClick={handleExport}
        disabled={isLoading || disabled}
        className={cn('w-full sm:w-auto')}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </>
        )}
      </Button>
    </div>
  )
}
