import type { StockSummary } from '../types/inventory.types'
import { formatBRLCents } from './inventory-format'

export type InventoryInsightTone = 'positive' | 'warning' | 'danger' | 'neutral'

export type InventoryInsight = {
  id: string
  title: string
  description: string
  tone: InventoryInsightTone
}

export function generateInventoryInsights(summary: StockSummary): InventoryInsight[] {
  const { emptyStock, lowStock, expired, expiring, estimatedValue, totalActive } = summary

  const noRisks = emptyStock === 0 && lowStock === 0 && expired === 0 && expiring === 0

  if (totalActive === 0 && emptyStock === 0) {
    return [
      {
        id: 'no-data',
        title: 'Nenhum produto ativo',
        description: 'Cadastre produtos para visualizar alertas e a situação do estoque.',
        tone: 'neutral',
      },
    ]
  }

  const insights: InventoryInsight[] = []

  // 1. Expired products — highest priority
  if (expired > 0) {
    insights.push({
      id: 'expired',
      title: `${expired} produto${expired !== 1 ? 's' : ''} com validade vencida`,
      description:
        'Produtos vencidos devem ser descartados imediatamente para evitar riscos clínicos.',
      tone: 'danger',
    })
  }

  // 2. Empty stock
  if (emptyStock > 0) {
    insights.push({
      id: 'empty-stock',
      title: `${emptyStock} produto${emptyStock !== 1 ? 's' : ''} sem estoque`,
      description:
        emptyStock === 1
          ? 'Um produto está completamente esgotado e necessita de reposição urgente.'
          : `${emptyStock} produtos estão completamente esgotados e necessitam de reposição urgente.`,
      tone: 'danger',
    })
  }

  // 3. Low stock
  if (lowStock > 0) {
    insights.push({
      id: 'low-stock',
      title: `${lowStock} produto${lowStock !== 1 ? 's' : ''} com estoque baixo`,
      description:
        lowStock === 1
          ? 'Um produto está abaixo do mínimo definido. Programe a reposição em breve.'
          : `${lowStock} produtos estão abaixo do mínimo definido. Programe a reposição em breve.`,
      tone: 'warning',
    })
  }

  // 4. Expiring products
  if (expiring > 0) {
    insights.push({
      id: 'expiring',
      title: `${expiring} produto${expiring !== 1 ? 's' : ''} vencendo em breve`,
      description:
        'Produtos próximos da validade devem ser consumidos prioritariamente ou descartados antes do vencimento.',
      tone: 'warning',
    })
  }

  // 5. Estimated value — informational, shown when meaningful
  if (estimatedValue > 0 && insights.length < 5) {
    insights.push({
      id: 'estimated-value',
      title: 'Valor estimado do estoque',
      description: `O estoque ativo representa aproximadamente ${formatBRLCents(estimatedValue)} em produtos cadastrados.`,
      tone: 'neutral',
    })
  }

  // 6. All clear — only when no risks found
  if (noRisks && insights.length === 0) {
    insights.push({
      id: 'all-clear',
      title: 'Estoque sob controle',
      description:
        'Nenhum produto vencido, esgotado ou com estoque crítico no momento. Continue monitorando regularmente.',
      tone: 'positive',
    })
  }

  return insights.slice(0, 6)
}
