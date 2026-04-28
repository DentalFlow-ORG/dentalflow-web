import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { EmptyState } from './EmptyState'

type FilteredEmptyStateProps = {
  icon: LucideIcon
  onClear: () => void
}

export function FilteredEmptyState({ icon, onClear }: FilteredEmptyStateProps) {
  return (
    <EmptyState
      icon={icon}
      title="Nenhum resultado encontrado"
      description="Tente ajustar a pesquisa ou os filtros aplicados."
      action={
        <Button variant="outline" onClick={onClear}>
          Limpar filtros
        </Button>
      }
    />
  )
}
