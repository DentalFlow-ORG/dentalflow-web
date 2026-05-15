import { Layers, Lock, Pencil, Trash2 } from 'lucide-react'

import { PanelCard } from '@/components/common/PanelCard'
import { cn } from '@/lib/utils'

import type { FinancialCategory } from '../types/finance.types'

export function CategoriesPanel({
  categories,
  onEdit,
  onDelete,
}: {
  categories: FinancialCategory[]
  onEdit: (category: FinancialCategory) => void
  onDelete: (category: FinancialCategory) => void
}) {
  const income = categories.filter((c) => c.type === 'INCOME')
  const expense = categories.filter((c) => c.type === 'EXPENSE')

  return (
    <PanelCard>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Categorias</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as categorias de entradas e saídas da clínica.
          </p>
        </div>
        <Layers className="h-5 w-5 text-primary" />
      </div>

      <div className="space-y-5">
        <CategoryGroup
          title="Entradas"
          titleColor="text-emerald-700"
          categories={income}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        <CategoryGroup
          title="Saídas"
          titleColor="text-red-700"
          categories={expense}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </PanelCard>
  )
}

function CategoryGroup({
  title,
  titleColor,
  categories,
  onEdit,
  onDelete,
}: {
  title: string
  titleColor: string
  categories: FinancialCategory[]
  onEdit: (category: FinancialCategory) => void
  onDelete: (category: FinancialCategory) => void
}) {
  return (
    <div>
      <h3 className={cn('mb-2 text-xs font-semibold uppercase tracking-wide', titleColor)}>
        {title}
      </h3>
      <div className="overflow-hidden rounded-lg border border-border">
        {categories.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>
        ) : (
          <ul className="divide-y divide-border">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color ?? '#94A3B8' }}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {category.name}
                </span>
                {category.isDefault && (
                  <span
                    title="Categoria padrão — não pode ser removida"
                    className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    <Lock className="h-3 w-3" />
                    Padrão
                  </span>
                )}
                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  <button
                    type="button"
                    title="Editar categoria"
                    aria-label="Editar categoria"
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    onClick={() => onEdit(category)}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    title={
                      category.isDefault
                        ? 'Categorias padrão não podem ser removidas'
                        : 'Remover categoria'
                    }
                    aria-label={
                      category.isDefault
                        ? 'Categorias padrão não podem ser removidas'
                        : 'Remover categoria'
                    }
                    disabled={category.isDefault}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors disabled:pointer-events-none disabled:opacity-25"
                    onClick={() => onDelete(category)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
