import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NotificationTemplate } from '../types/notifications.types'
import { renderTemplatePreview, TEMPLATE_LABELS } from '../services/notifications.service'

type TemplatePreviewerProps = {
  template: NotificationTemplate
  previewVars: Record<string, string>
  className?: string
}

export function TemplatePreviewer({ template, previewVars, className }: TemplatePreviewerProps) {
  const rendered = renderTemplatePreview(template.bodyPt, previewVars)
  const label = TEMPLATE_LABELS[template.slug] ?? template.slug

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Pré-visualização — {label}
      </p>

      {/* WhatsApp bubble */}
      <div className="rounded-xl rounded-tl-none bg-[#dcf8c6] px-4 py-3 dark:bg-[#1a4731] max-w-xs">
        <p className="whitespace-pre-line text-sm text-gray-900 dark:text-gray-100">{rendered}</p>
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
        <span>A mensagem não inclui diagnóstico, prontuário ou detalhes clínicos.</span>
      </div>
    </div>
  )
}
