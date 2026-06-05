import { Pencil, Trash2 } from 'lucide-react'

import { ActionIconButton } from '@/components/common/ActionIconButton'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatCurrencyBRL } from '@/lib/number-formatters'

import { ServicePriceDurationBadge } from './ServicePriceDurationBadge'
import type { ServiceItem } from '../types/team.types'

type ServiceItemCardProps = {
  service: ServiceItem
  readOnly: boolean
  isLoading: boolean
  onEditStart: () => void
  onDeleteStart: () => void
}

export function ServiceItemCard({
  service,
  readOnly,
  isLoading,
  onEditStart,
  onDeleteStart,
}: ServiceItemCardProps) {
  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/25 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-foreground">
              {service.name}
            </p>
            {service.description && (
              <p className="mt-1 line-clamp-3 break-words text-xs leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            )}
          </div>
          <StatusBadge
            tone={service.isActive ? 'success' : 'muted'}
            className="w-fit shrink-0"
          >
            {service.isActive ? 'Ativo' : 'Inativo'}
          </StatusBadge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ServicePriceDurationBadge
            durationMinutes={service.durationMinutes}
            priceFrom={service.priceFrom}
            priceTo={service.priceTo}
            isPriceDisplayed={service.isPriceDisplayed}
          />
          {!readOnly && (
            <span className="inline-flex max-w-full items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              Custo direto:{' '}
              <span className="ml-1 text-foreground">
                {service.estimatedDirectCostCents != null
                  ? formatCurrencyBRL(service.estimatedDirectCostCents / 100)
                  : 'Não configurado'}
              </span>
            </span>
          )}
        </div>
      </div>

      {!readOnly && (
        <div className="flex shrink-0 items-center justify-end gap-1 sm:pt-0.5">
          <ActionIconButton
            onClick={onEditStart}
            disabled={isLoading}
            aria-label={`Editar serviço ${service.name}`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </ActionIconButton>
          <ActionIconButton
            tone="danger"
            onClick={onDeleteStart}
            disabled={isLoading}
            aria-label={`Remover serviço ${service.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </ActionIconButton>
        </div>
      )}
    </article>
  )
}
