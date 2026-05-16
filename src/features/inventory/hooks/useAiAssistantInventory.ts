import { useCallback, useEffect, useRef, useState } from 'react'
import type { AiAnalysisResult } from '../services/inventory-ai.service'
import { analyzeInventoryWithAi, getLatestInventoryAnalysis } from '../services/inventory-ai.service'

export function useAiAssistantInventory() {
  const [savedAnalysis, setSavedAnalysis] = useState<AiAnalysisResult | null>(null)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    setIsLoadingInitial(true)
    getLatestInventoryAnalysis()
      .then((result) => {
        if (!cancelledRef.current) setSavedAnalysis(result)
      })
      .catch(() => {
        if (!cancelledRef.current) setSavedAnalysis(null)
      })
      .finally(() => {
        if (!cancelledRef.current) setIsLoadingInitial(false)
      })
    return () => {
      cancelledRef.current = true
    }
  }, [])

  const handleGenerate = useCallback((): Promise<AiAnalysisResult> => {
    return analyzeInventoryWithAi().then((result) => {
      setSavedAnalysis(result)
      return result
    })
  }, [])

  return { savedAnalysis, isLoadingInitial, handleGenerate }
}
