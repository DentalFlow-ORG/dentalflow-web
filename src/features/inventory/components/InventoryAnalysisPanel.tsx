import { AiAssistantCard } from '@/components/common/AiAssistantCard'
import { PanelCard } from '@/components/common/PanelCard'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useEffect, useRef } from 'react'
import { useAiAssistantInventory } from '../hooks/useAiAssistantInventory'
import type { StockSummary } from '../types/inventory.types'

export function InventoryAnalysisPanel({ summary }: { summary: StockSummary }) {
  const { user } = useAuth()
  const sectionRef = useRef<HTMLDivElement>(null)
  const isOwner = user?.role === 'OWNER'
  const { savedAnalysis, quota, dataReadiness, visibility, isLoadingInitial, handleGenerate } =
    useAiAssistantInventory()

  const hasCritical =
    summary.emptyStock > 0 || summary.expired > 0 || summary.lowStock > 0 || summary.expiring > 0

  const dataDisabledReason =
    dataReadiness && !dataReadiness.ready ? dataReadiness.reason : undefined

  useEffect(() => {
    if (isLoadingInitial) return
    if (!['#inventory-ai-analysis', '#inventory-ai'].includes(window.location.hash)) return
    window.setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      sectionRef.current?.focus({ preventScroll: true })
    }, 0)
  }, [isLoadingInitial])

  return (
    <div
      id="inventory-ai-analysis"
      ref={sectionRef}
      tabIndex={-1}
      className="scroll-mt-24 outline-none"
    >
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
          visibility={visibility}
          disabledReason={dataDisabledReason}
        />
      </PanelCard>
    </div>
  )
}
