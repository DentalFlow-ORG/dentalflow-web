import { AiAssistantCard } from '@/components/common/AiAssistantCard'
import { PanelCard } from '@/components/common/PanelCard'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAiAssistantInventory } from '../hooks/useAiAssistantInventory'
import type { StockSummary } from '../types/inventory.types'

export function InventoryAnalysisPanel({ summary }: { summary: StockSummary }) {
  const { user } = useAuth()
  const isOwner = user?.role === 'OWNER'
  const { savedAnalysis, quota, isLoadingInitial, handleGenerate } = useAiAssistantInventory()

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
        onGenerate={handleGenerate}
        initialResult={savedAnalysis}
        isLoadingInitial={isLoadingInitial}
        canGenerate={isOwner}
        quota={quota}
      />
    </PanelCard>
  )
}
