import { AiAssistantCard } from '@/components/common/AiAssistantCard'
import { PanelCard } from '@/components/common/PanelCard'
import { analyzeFinanceWithAi } from '../services/finance-ai.service'
import type { FinanceSummary } from '../types/finance.types'

export function FinancialAnalysisPanel({
  summary,
}: {
  summary: FinanceSummary
  previousSummary?: FinanceSummary | null
}) {
  const handleGenerate = () =>
    analyzeFinanceWithAi({ from: summary.period.from, to: summary.period.to })

  return (
    <PanelCard>
      <AiAssistantCard
        type="finance"
        title="Análise do período"
        description="Recomendações baseadas nos dados reais do período selecionado."
        onGenerate={handleGenerate}
        invalidationKey={`${summary.period.from}|${summary.period.to}`}
      />
    </PanelCard>
  )
}
