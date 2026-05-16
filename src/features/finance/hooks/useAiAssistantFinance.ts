import { useCallback, useEffect, useRef, useState } from 'react'
import type { AiAnalysisResult, AiQuotaInfo } from '../services/finance-ai.service'
import { analyzeFinanceWithAi, getLatestFinanceAnalysis } from '../services/finance-ai.service'

export function useAiAssistantFinance(from: string, to: string) {
  const [savedAnalysis, setSavedAnalysis] = useState<AiAnalysisResult | null>(null)
  const [quota, setQuota] = useState<AiQuotaInfo | null>(null)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    setIsLoadingInitial(true)
    getLatestFinanceAnalysis()
      .then((result) => {
        if (!cancelledRef.current && result) {
          setSavedAnalysis(result.data)
          setQuota(result.quota)
        }
      })
      .catch(() => {
        if (!cancelledRef.current) {
          setSavedAnalysis(null)
          setQuota(null)
        }
      })
      .finally(() => {
        if (!cancelledRef.current) setIsLoadingInitial(false)
      })
    return () => {
      cancelledRef.current = true
    }
  }, [])

  const handleGenerate = useCallback((): Promise<AiAnalysisResult> => {
    return analyzeFinanceWithAi({ from, to }).then((result) => {
      setSavedAnalysis(result.data)
      setQuota(result.quota)
      return result.data
    })
  }, [from, to])

  return { savedAnalysis, quota, isLoadingInitial, handleGenerate }
}
