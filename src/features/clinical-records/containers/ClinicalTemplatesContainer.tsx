import { useState } from 'react'
import { BookOpen, Edit2, Plus, Trash2 } from 'lucide-react'

import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ListPageShell } from '@/components/common/ListPageShell'
import { Button } from '@/components/ui/button'

import { useClinicalTemplates } from '../hooks/useClinicalTemplates'
import {
  CLINICAL_TEMPLATE_CATEGORY_LABEL,
} from '../utils/clinical-record-labels'
import type {
  ClinicalTemplate,
  ClinicalTemplateCategory,
  CreateClinicalTemplateDto,
} from '../types/clinical-record.types'

const CATEGORIES: ClinicalTemplateCategory[] = [
  'ANAMNESIS', 'EVOLUTION', 'PRESCRIPTION', 'RECOMMENDATION', 'PROCEDURE', 'OTHER',
]

export function ClinicalTemplatesContainer() {
  const { templates, isLoading, isSaving, error, refresh, create, update, deactivate } =
    useClinicalTemplates()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ClinicalTemplate | null>(null)

  const [form, setForm] = useState<CreateClinicalTemplateDto>({
    name: '',
    category: 'EVOLUTION',
    content: '',
  })

  const resetForm = () => {
    setForm({ name: '', category: 'EVOLUTION', content: '' })
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (template: ClinicalTemplate) => {
    setEditing(template)
    setForm({ name: template.name, category: template.category, content: template.content })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.content.trim()) return
    if (editing) {
      await update(editing.id, form)
    } else {
      await create(form)
    }
    resetForm()
  }

  return (
    <div className="space-y-8">
      <AppPageHeader
        eyebrow="Clínica"
        title="Modelos clínicos"
        description="Crie modelos de texto para agilizar o preenchimento dos prontuários."
        action={
          <Button onClick={() => { resetForm(); setShowForm(true) }}>
            <Plus className="h-4 w-4" />
            Novo modelo
          </Button>
        }
      />

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">
            {editing ? 'Editar modelo' : 'Novo modelo clínico'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nome do modelo
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Anamnese padrão adulto"
                className="mt-1.5 h-11 w-full rounded-md border border-slate-200 px-3 text-sm placeholder:text-slate-400 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Categoria
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value as ClinicalTemplateCategory }))
                }
                className="mt-1.5 h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-800 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CLINICAL_TEMPLATE_CATEGORY_LABEL[cat]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Conteúdo do modelo
              </label>
              <textarea
                rows={6}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Escreva o texto padrão deste modelo..."
                className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? 'Salvando...' : editing ? 'Atualizar modelo' : 'Criar modelo'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando modelos..."
        error={error}
        onRetry={refresh}
        isEmpty={templates.length === 0}
        emptyState={
          <EmptyState
            icon={BookOpen}
            title="Nenhum modelo criado"
            description="Crie modelos de texto para agilizar o preenchimento dos prontuários clínicos."
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                Criar primeiro modelo
              </Button>
            }
          />
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{t.name}</p>
                  <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {CLINICAL_TEMPLATE_CATEGORY_LABEL[t.category]}
                  </span>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-500 hover:text-primary"
                    onClick={() => handleEdit(t)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-500 hover:text-red-600"
                    onClick={() => deactivate(t.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
                {t.content}
              </p>
            </div>
          ))}
        </div>
      </ListPageShell>
    </div>
  )
}
