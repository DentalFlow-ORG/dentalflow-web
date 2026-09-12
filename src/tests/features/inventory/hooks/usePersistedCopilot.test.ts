import { act, renderHook, waitFor } from '@/test-utils/render-utils'

import { usePersistedCopilot } from '@/features/inventory/hooks/usePersistedCopilot'
import { ApiError } from '@/services/http'

type Analysis = { summary: string }

const latest: Analysis = { summary: 'análise persistida' }
const fresh: Analysis = { summary: 'análise nova' }

function setup(
  getLatest: () => Promise<Analysis | undefined>,
  generate: () => Promise<Analysis> = () => Promise.resolve(fresh),
) {
  return renderHook(() => usePersistedCopilot<Analysis>(getLatest, generate))
}

describe('usePersistedCopilot — initial load', () => {
  it('starts in the initial loading state', () => {
    const { result } = setup(() => new Promise(() => {}))
    expect(result.current.isLoadingInitial).toBe(true)
    expect(result.current.result).toBeNull()
  })

  it('adopts the latest persisted analysis', async () => {
    const { result } = setup(() => Promise.resolve(latest))
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
    expect(result.current.result).toEqual(latest)
    expect(result.current.isPlanBlocked).toBe(false)
  })

  it('settles with no analysis when none is persisted', async () => {
    const { result } = setup(() => Promise.resolve(undefined))
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
    expect(result.current.result).toBeNull()
  })

  it('blocks on plan when the initial load is refused with 403', async () => {
    const { result } = setup(() =>
      Promise.reject(new ApiError('Recurso indisponível no seu plano.', 403, null)),
    )
    await waitFor(() => expect(result.current.isPlanBlocked).toBe(true))
    expect(result.current.isLoadingInitial).toBe(false)
    expect(result.current.result).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('reports the quota message when the initial load is refused with 429', async () => {
    const { result } = setup(() =>
      Promise.reject(new ApiError('Limite mensal de análises atingido.', 429, null)),
    )
    await waitFor(() => expect(result.current.isQuotaExceeded).toBe(true))
    expect(result.current.quotaMessage).toBe('Limite mensal de análises atingido.')
    expect(result.current.isPlanBlocked).toBe(false)
    expect(result.current.isLoadingInitial).toBe(false)
  })

  it('ignores other initial-load failures so the inventory page stays usable', async () => {
    const { result } = setup(() => Promise.reject(new ApiError('Falha interna', 500, null)))
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
    expect(result.current.error).toBeNull()
    expect(result.current.isPlanBlocked).toBe(false)
    expect(result.current.isQuotaExceeded).toBe(false)
  })

  it('ignores a non-ApiError initial-load failure', async () => {
    const { result } = setup(() => Promise.reject(new Error('offline')))
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
    expect(result.current.error).toBeNull()
  })

  it('does not apply a late initial response after unmount', async () => {
    let resolve!: (value: Analysis) => void
    const { result, unmount } = setup(
      () =>
        new Promise<Analysis>((r) => {
          resolve = r
        }),
    )
    unmount()
    await act(async () => {
      resolve(latest)
    })
    expect(result.current.result).toBeNull()
    expect(result.current.isLoadingInitial).toBe(true)
  })

  it('does not apply a late initial failure after unmount', async () => {
    let reject!: (reason: unknown) => void
    const { result, unmount } = setup(
      () =>
        new Promise<Analysis>((_, r) => {
          reject = r
        }),
    )
    unmount()
    await act(async () => {
      reject(new ApiError('bloqueado', 403, null))
      await Promise.resolve()
    })
    expect(result.current.isPlanBlocked).toBe(false)
  })
})

describe('usePersistedCopilot — handleGenerate', () => {
  async function ready(
    generate: () => Promise<Analysis>,
    getLatest: () => Promise<Analysis | undefined> = () => Promise.resolve(undefined),
  ) {
    const hook = setup(getLatest, generate)
    await waitFor(() => expect(hook.result.current.isLoadingInitial).toBe(false))
    return hook
  }

  it('replaces the result with a freshly generated analysis', async () => {
    const { result } = await ready(() => Promise.resolve(fresh))
    await act(async () => {
      await result.current.handleGenerate()
    })
    expect(result.current.result).toEqual(fresh)
    expect(result.current.isGenerating).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('blocks on plan when generation is refused with 403', async () => {
    const { result } = await ready(() =>
      Promise.reject(new ApiError('Plano sem acesso à IA.', 403, null)),
    )
    await act(async () => {
      await result.current.handleGenerate()
    })
    expect(result.current.isPlanBlocked).toBe(true)
    expect(result.current.error).toBeNull()
    expect(result.current.isGenerating).toBe(false)
  })

  it('reports the quota message when generation is refused with 429', async () => {
    const { result } = await ready(() =>
      Promise.reject(new ApiError('Você atingiu o limite do mês.', 429, null)),
    )
    await act(async () => {
      await result.current.handleGenerate()
    })
    expect(result.current.isQuotaExceeded).toBe(true)
    expect(result.current.quotaMessage).toBe('Você atingiu o limite do mês.')
    expect(result.current.error).toBeNull()
  })

  it('clears a previous quota block when generation is retried', async () => {
    const generate = vi
      .fn<() => Promise<Analysis>>()
      .mockRejectedValueOnce(new ApiError('Limite atingido.', 429, null))
      .mockResolvedValueOnce(fresh)
    const { result } = await ready(generate)
    await act(async () => {
      await result.current.handleGenerate()
    })
    expect(result.current.isQuotaExceeded).toBe(true)
    await act(async () => {
      await result.current.handleGenerate()
    })
    expect(result.current.isQuotaExceeded).toBe(false)
    expect(result.current.result).toEqual(fresh)
  })

  it('surfaces the API message for other ApiError failures', async () => {
    const { result } = await ready(() =>
      Promise.reject(new ApiError('Serviço indisponível.', 503, null)),
    )
    await act(async () => {
      await result.current.handleGenerate()
    })
    expect(result.current.error).toBe('Serviço indisponível.')
  })

  it('falls back to a generic message for a non-ApiError failure', async () => {
    const { result } = await ready(() => Promise.reject(new Error('offline')))
    await act(async () => {
      await result.current.handleGenerate()
    })
    expect(result.current.error).toBe('Não foi possível gerar o resumo. Tente novamente.')
  })

  it('keeps the previous analysis when a regeneration fails', async () => {
    const generate = vi
      .fn<() => Promise<Analysis>>()
      .mockRejectedValueOnce(new ApiError('Serviço indisponível.', 503, null))
    const { result } = await ready(generate, () => Promise.resolve(latest))
    await act(async () => {
      await result.current.handleGenerate()
    })
    expect(result.current.result).toEqual(latest)
  })

  it('ignores a second generate while one is already running', async () => {
    let resolve!: (value: Analysis) => void
    const generate = vi.fn(
      () =>
        new Promise<Analysis>((r) => {
          resolve = r
        }),
    )
    const { result } = await ready(generate)
    let first!: Promise<void>
    act(() => {
      first = result.current.handleGenerate()
    })
    expect(result.current.isGenerating).toBe(true)
    await act(async () => {
      await result.current.handleGenerate()
    })
    expect(generate).toHaveBeenCalledTimes(1)
    await act(async () => {
      resolve(fresh)
      await first
    })
    expect(generate).toHaveBeenCalledTimes(1)
  })
})
