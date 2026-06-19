import { useAbnormalConsumptionCopilot } from '../hooks/useAbnormalConsumptionCopilot'
import { InventoryCopilotCard } from './InventoryCopilotCard'

export function StockAbnormalConsumptionCopilotCard() {
  const {
    result,
    isLoadingInitial,
    isGenerating,
    error,
    isPlanBlocked,
    isQuotaExceeded,
    quotaMessage,
    handleGenerate,
  } = useAbnormalConsumptionCopilot()

  return (
    <InventoryCopilotCard
      title="Copiloto de consumo"
      description="Resumo inteligente sobre perdas, ajustes e consumo fora do padrão."
      planBlockedMessage="O Copiloto de consumo está disponível nos planos Professional e Premium."
      result={result}
      isLoadingInitial={isLoadingInitial}
      isGenerating={isGenerating}
      error={error}
      isPlanBlocked={isPlanBlocked}
      isQuotaExceeded={isQuotaExceeded}
      quotaMessage={quotaMessage}
      onGenerate={handleGenerate}
    />
  )
}
