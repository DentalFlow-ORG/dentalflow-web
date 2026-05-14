import { BookOpen, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { CLINICAL_TEMPLATE_CATEGORY_LABEL } from '../utils/clinical-record-labels'
import type { ClinicalTemplate } from '../types/clinical-record.types'

type Props = {
  templates: ClinicalTemplate[]
  onApply: (template: ClinicalTemplate) => void
}

export function ClinicalTemplateSelectorPanel({ templates, onApply }: Props) {
  if (templates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-2 text-sm font-medium text-slate-500">
          Nenhum modelo disponível
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Crie modelos em Modelos clínicos para agilizar seus registros.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-start gap-2 border-b border-slate-100 px-4 py-3">
        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold text-slate-800">Modelos clínicos</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Selecione um modelo para preencher os campos do prontuário.
          </p>
        </div>
      </div>
      <ul className="divide-y divide-slate-100">
        {templates.map((t) => (
          <li key={t.id}>
            <Button
              variant="ghost"
              className="w-full justify-between rounded-none px-4 py-3 text-left hover:bg-blue-50"
              onClick={() => onApply(t)}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{t.name}</p>
                <p className="text-xs text-slate-500">
                  {CLINICAL_TEMPLATE_CATEGORY_LABEL[t.category]}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
