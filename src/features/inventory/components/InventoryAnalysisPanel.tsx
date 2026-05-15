import { AiAssistantCard } from '@/components/common/AiAssistantCard'
import { PanelCard } from '@/components/common/PanelCard'
import { analyzeInventoryWithAi } from '../services/inventory-ai.service'
import type { StockSummary } from '../types/inventory.types'

export function InventoryAnalysisPanel({ summary }: { summary: StockSummary }) {
  const hasCritical =
    summary.emptyStock > 0 || summary.expired > 0 || summary.lowStock > 0 || summary.expiring > 0

  return (
    <PanelCard>
      <AiAssistantCard
        type="inventory"
        title="Análise do estoque"
        description={
          hasCritical
            ? 'Há itens que requerem atenção. Gere uma análise detalhada.'
            : 'Alertas e situação atual dos produtos da clínica.'
        }
        onGenerate={analyzeInventoryWithAi}
      />
    </PanelCard>
  )
}
