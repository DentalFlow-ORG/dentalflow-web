import { useStockCopilot } from '../hooks/useStockCopilot'
import { InventoryCopilotCard } from './InventoryCopilotCard'

export function StockCopilotCard() {
  const {
    result,
    isLoadingInitial,
    isGenerating,
    error,
    isPlanBlocked,
    isQuotaExceeded,
    quotaMessage,
    handleGenerate,
  } = useStockCopilot()

  return (
    <InventoryCopilotCard
      title="Copiloto de estoque"
      description="Resumo inteligente da sua lista de compra."
      planBlockedMessage="O Copiloto de estoque está disponível nos planos Professional e Premium."
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
