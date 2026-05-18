import { useCallback, useEffect, useRef, useState } from 'react'
import type { AiAnalysisResult, AiQuotaInfo, DataReadiness } from '../services/inventory-ai.service'
import { analyzeInventoryWithAi, getLatestInventoryAnalysis } from '../services/inventory-ai.service'

export function useAiAssistantInventory() {
  const [savedAnalysis, setSavedAnalysis] = useState<AiAnalysisResult | null>(null)
  const [quota, setQuota] = useState<AiQuotaInfo | null>(null)
  const [dataReadiness, setDataReadiness] = useState<DataReadiness | null>(null)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    setIsLoadingInitial(true)
    getLatestInventoryAnalysis()
      .then((result) => {
        if (!cancelledRef.current && result) {
          setSavedAnalysis(result.data)
          setQuota(result.quota)
          setDataReadiness(result.dataReadiness)
        }
      })
      .catch(() => {
        if (!cancelledRef.current) {
          setSavedAnalysis(null)
          setQuota(null)
          setDataReadiness(null)
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
    return analyzeInventoryWithAi().then((result) => {
      setSavedAnalysis(result.data)
      setQuota(result.quota)
      return result.data
    })
  }, [])

  return { savedAnalysis, quota, dataReadiness, isLoadingInitial, handleGenerate }
}
