import { AiAssistantCard } from '@/components/common/AiAssistantCard'
import { PanelCard } from '@/components/common/PanelCard'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useEffect, useRef } from 'react'
import { useAiAssistantFinance } from '../hooks/useAiAssistantFinance'
import type { FinanceSummary } from '../types/finance.types'

export function FinancialAnalysisPanel({
  summary,
}: {
  summary: FinanceSummary
  previousSummary?: FinanceSummary | null
}) {
  const { user } = useAuth()
  const sectionRef = useRef<HTMLDivElement>(null)
  const isOwner = user?.role === 'OWNER'
  const { savedAnalysis, quota, dataReadiness, isLoadingInitial, handleGenerate } =
    useAiAssistantFinance(summary.period.from, summary.period.to)

  const dataDisabledReason =
    dataReadiness && !dataReadiness.ready ? dataReadiness.reason : undefined

  useEffect(() => {
    if (window.location.hash !== '#finance-ai') return
    window.setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      sectionRef.current?.focus({ preventScroll: true })
    }, 0)
  }, [isLoadingInitial])

  return (
    <div id="finance-ai" ref={sectionRef} tabIndex={-1} className="scroll-mt-24 outline-none">
      <PanelCard>
        <AiAssistantCard
          type="finance"
          title="Análise do período"
          description="Recomendações baseadas nos dados reais do período selecionado."
          onGenerate={handleGenerate}
          invalidationKey={`${summary.period.from}|${summary.period.to}`}
          initialResult={savedAnalysis}
          isLoadingInitial={isLoadingInitial}
          canGenerate={isOwner}
          quota={quota}
          disabledReason={dataDisabledReason}
        />
      </PanelCard>
    </div>
  )
}
