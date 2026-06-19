import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  AiAnalysisResult,
  AiQuotaInfo,
  AiVisibility,
  DataReadiness,
} from '../services/finance-ai.service'
import { analyzeFinanceWithAi, getLatestFinanceAnalysis } from '../services/finance-ai.service'

export function useAiAssistantFinance(from: string, to: string) {
  const [savedAnalysis, setSavedAnalysis] = useState<AiAnalysisResult | null>(null)
  const [quota, setQuota] = useState<AiQuotaInfo | null>(null)
  const [dataReadiness, setDataReadiness] = useState<DataReadiness | null>(null)
  const [visibility, setVisibility] = useState<AiVisibility | undefined>(undefined)
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
          setDataReadiness(result.dataReadiness)
          setVisibility(result.visibility)
        }
      })
      .catch(() => {
        if (!cancelledRef.current) {
          setSavedAnalysis(null)
          setQuota(null)
          setDataReadiness(null)
          setVisibility(undefined)
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
      setVisibility('FULL')
      return result.data
    })
  }, [from, to])

  return { savedAnalysis, quota, dataReadiness, visibility, isLoadingInitial, handleGenerate }
}
