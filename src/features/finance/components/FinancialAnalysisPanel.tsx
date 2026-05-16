import { AiAssistantCard } from '@/components/common/AiAssistantCard'
import { PanelCard } from '@/components/common/PanelCard'
import { useAiAssistantFinance } from '../hooks/useAiAssistantFinance'
import type { FinanceSummary } from '../types/finance.types'

export function FinancialAnalysisPanel({
  summary,
}: {
  summary: FinanceSummary
  previousSummary?: FinanceSummary | null
}) {
  const { savedAnalysis, isLoadingInitial, handleGenerate } = useAiAssistantFinance(
    summary.period.from,
    summary.period.to,
  )

  return (
    <PanelCard>
      <AiAssistantCard
        type="finance"
        title="Análise do período"
        description="Recomendações baseadas nos dados reais do período selecionado."
        onGenerate={handleGenerate}
        invalidationKey={`${summary.period.from}|${summary.period.to}`}
        initialResult={savedAnalysis}
        isLoadingInitial={isLoadingInitial}
      />
    </PanelCard>
  )
}
