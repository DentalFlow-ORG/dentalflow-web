import { useCallback, useEffect, useRef, useState } from 'react'

import { ApiError } from '@/services/http'

export type UsePersistedCopilotResult<T> = {
  result: T | null
  isLoadingInitial: boolean
  isGenerating: boolean
  error: string | null
  isPlanBlocked: boolean
  isQuotaExceeded: boolean
  quotaMessage: string | null
  handleGenerate: () => Promise<void>
}

export function usePersistedCopilot<T>(
  getLatest: () => Promise<T | undefined>,
  generate: () => Promise<T>,
): UsePersistedCopilotResult<T> {
  const [result, setResult] = useState<T | null>(null)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlanBlocked, setIsPlanBlocked] = useState(false)
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false)
  const [quotaMessage, setQuotaMessage] = useState<string | null>(null)
  const cancelledRef = useRef(false)

  // On mount: fetch the latest persisted analysis — never triggers AI, never
  // short-circuits based on the current list state.
  useEffect(() => {
    cancelledRef.current = false
    setIsLoadingInitial(true)

    getLatest()
      .then((latest) => {
        if (cancelledRef.current) return
        setResult(latest ?? null)
      })
      .catch((err: unknown) => {
        if (cancelledRef.current) return
        if (err instanceof ApiError) {
          if (err.status === 403) {
            setIsPlanBlocked(true)
            return
          }
          if (err.status === 429) {
            setIsQuotaExceeded(true)
            setQuotaMessage(err.message)
            return
          }
        }
        // Other errors on initial load are silently ignored — the inventory section still works
      })
      .finally(() => {
        if (!cancelledRef.current) setIsLoadingInitial(false)
      })

    return () => {
      cancelledRef.current = true
    }
  }, [getLatest])

  const handleGenerate = useCallback(async () => {
    if (isGenerating) return
    setIsGenerating(true)
    setError(null)
    setIsQuotaExceeded(false)

    try {
      const newResult = await generate()
      setResult(newResult)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          setIsPlanBlocked(true)
          return
        }
        if (err.status === 429) {
          setIsQuotaExceeded(true)
          setQuotaMessage(err.message)
          return
        }
        setError(err.message)
        return
      }
      setError('Não foi possível gerar o resumo. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }, [generate, isGenerating])

  return {
    result,
    isLoadingInitial,
    isGenerating,
    error,
    isPlanBlocked,
    isQuotaExceeded,
    quotaMessage,
    handleGenerate,
  }
}
