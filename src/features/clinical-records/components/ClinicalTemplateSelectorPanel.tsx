import { AlertCircle, BookOpen, FilePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { CLINICAL_TEMPLATE_CATEGORY_LABEL } from '../utils/clinical-record-labels'
import type { ClinicalTemplate, ClinicalTemplateCategory } from '../types/clinical-record.types'

const UNMAPPED_CATEGORIES: ClinicalTemplateCategory[] = ['OTHER']

type Props = {
  templates: ClinicalTemplate[]
  onApply: (template: ClinicalTemplate) => void
}

export function ClinicalTemplateSelectorPanel({ templates, onApply }: Props) {
  if (templates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-5 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          Nenhum modelo disponível
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Nenhum modelo clínico foi criado ainda para esta clínica.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-start gap-2 border-b border-border px-4 py-3">
        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">Modelos clínicos</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Clique para adicionar o texto do modelo ao campo correspondente.
          </p>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {templates.map((t) => {
          const isUnmapped = UNMAPPED_CATEGORIES.includes(t.category)
          return (
            <li key={t.id}>
              <Button
                variant="ghost"
                aria-label={
                  isUnmapped
                    ? `Modelo "${t.name}" sem campo associado`
                    : `Inserir modelo "${t.name}" em ${CLINICAL_TEMPLATE_CATEGORY_LABEL[t.category]}`
                }
                title={
                  isUnmapped
                    ? 'Modelos da categoria "Outros" não têm campo de destino no prontuário.'
                    : undefined
                }
                disabled={isUnmapped}
                className={cn(
                  'w-full justify-between rounded-none px-4 py-3 text-left',
                  !isUnmapped && 'hover:bg-primary/10',
                )}
                onClick={() => onApply(t)}
              >
                <div className="min-w-0">
                  <p className={cn('truncate text-sm font-medium', isUnmapped ? 'text-muted-foreground/50' : 'text-foreground')}>
                    {t.name}
                  </p>
                  {isUnmapped ? (
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <AlertCircle className="h-3 w-3" />
                      Sem campo associado
                    </span>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      → {CLINICAL_TEMPLATE_CATEGORY_LABEL[t.category]}
                    </p>
                  )}
                </div>
                {!isUnmapped && <FilePlus className="h-4 w-4 shrink-0 text-muted-foreground" />}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
