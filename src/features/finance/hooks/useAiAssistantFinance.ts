import { useCallback, useEffect, useRef, useState } from 'react'
import type { AiAnalysisResult } from '../services/finance-ai.service'
import { analyzeFinanceWithAi, getLatestFinanceAnalysis } from '../services/finance-ai.service'

export function useAiAssistantFinance(from: string, to: string) {
  const [savedAnalysis, setSavedAnalysis] = useState<AiAnalysisResult | null>(null)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    setIsLoadingInitial(true)
    getLatestFinanceAnalysis()
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
  }, []) // Only on mount — reloads are intentional via handleGenerate

  const handleGenerate = useCallback((): Promise<AiAnalysisResult> => {
    return analyzeFinanceWithAi({ from, to }).then((result) => {
      setSavedAnalysis(result)
      return result
    })
  }, [from, to])

  return { savedAnalysis, isLoadingInitial, handleGenerate }
}
