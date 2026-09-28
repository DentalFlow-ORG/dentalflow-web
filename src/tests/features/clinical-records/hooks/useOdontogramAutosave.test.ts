import { act, renderHook } from '@/test-utils/render-utils'

import { useOdontogramAutosave } from '@/features/clinical-records/hooks/useOdontogramAutosave'
import type { OdontogramData } from '@/features/clinical-records/types/clinical-record.types'

const chart = (tooth: string): OdontogramData => ({ teeth: { [tooth]: { condition: 'caries' } } })

function deferred() {
  let resolve!: () => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useOdontogramAutosave', () => {
  it('waits for an in-flight save before resolving an explicit flush', async () => {
    const first = deferred()
    const save = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useOdontogramAutosave({ onError: vi.fn(), debounceMs: 100 }),
    )
    act(() => result.current.scheduleSave(chart('11'), save))
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    act(() => result.current.scheduleSave(chart('21'), save))
    let flush!: Promise<void>
    act(() => {
      flush = result.current.flushSave()
    })
    expect(save).toHaveBeenCalledTimes(1)
    await act(async () => {
      first.resolve()
      await flush
    })
    expect(save.mock.calls.map(([value]) => value)).toEqual([chart('11'), chart('21')])
    expect(result.current.isDirty).toBe(false)
  })

  it('keeps the pending debounce state until its timer settles after an in-flight edit', async () => {
    const first = deferred()
    const save = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useOdontogramAutosave({ onError: vi.fn(), debounceMs: 100 }),
    )
    act(() => result.current.scheduleSave(chart('11'), save))
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    act(() => result.current.scheduleSave(chart('21'), save))
    await act(async () => first.resolve())
    expect(result.current.saveState).toBe('pending')
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.isDirty).toBe(false)
    expect(save).toHaveBeenCalledTimes(2)
  })
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces rapid edits into one save of the latest chart', async () => {
    const onError = vi.fn()
    const save = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useOdontogramAutosave({ onError, debounceMs: 800 }))

    act(() => {
      result.current.scheduleSave(chart('11'), save)
      result.current.scheduleSave(chart('12'), save)
      result.current.scheduleSave(chart('13'), save)
    })
    await act(async () => {
      vi.advanceTimersByTime(799)
    })
    expect(save).not.toHaveBeenCalled()
    await act(async () => {
      vi.advanceTimersByTime(1)
    })
    expect(save).toHaveBeenCalledExactlyOnceWith(chart('13'))
    expect(onError).not.toHaveBeenCalled()
  })

  it('serializes saves so a slow older request cannot overwrite a newer chart', async () => {
    const first = deferred()
    const save = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useOdontogramAutosave({ onError: vi.fn(), debounceMs: 100 }),
    )

    act(() => result.current.scheduleSave(chart('11'), save))
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    act(() => result.current.scheduleSave(chart('21'), save))
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    // The newer chart waits for the older request instead of racing it.
    expect(save).toHaveBeenCalledTimes(1)
    await act(async () => first.resolve())
    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenLastCalledWith(chart('21'))
  })

  it('flushes a pending edit immediately and resolves once it is saved', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useOdontogramAutosave({ onError: vi.fn() }))

    act(() => result.current.scheduleSave(chart('11'), save))
    await act(async () => {
      await result.current.flushSave()
    })
    expect(save).toHaveBeenCalledExactlyOnceWith(chart('11'))
    // The cancelled debounce timer does not send it a second time.
    await act(async () => {
      vi.advanceTimersByTime(5_000)
    })
    expect(save).toHaveBeenCalledOnce()
  })

  it('does nothing on flush when no edit is pending', async () => {
    const save = vi.fn()
    const { result } = renderHook(() => useOdontogramAutosave({ onError: vi.fn() }))
    await act(async () => {
      await result.current.flushSave()
    })
    expect(save).not.toHaveBeenCalled()
  })

  it('reports a failure and keeps the chart queued for the next flush', async () => {
    const onError = vi.fn()
    const save = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined)
    const { result } = renderHook(() => useOdontogramAutosave({ onError }))

    act(() => result.current.scheduleSave(chart('11'), save))
    await act(async () => {
      await result.current.flushSave()
    })
    expect(onError).toHaveBeenCalledOnce()

    await act(async () => {
      await result.current.flushSave()
    })
    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenLastCalledWith(chart('11'))
  })

  it('prefers a newer edit over a failed one when retrying', async () => {
    const failing = deferred()
    const save = vi.fn().mockReturnValueOnce(failing.promise).mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useOdontogramAutosave({ onError: vi.fn(), debounceMs: 100 }),
    )

    act(() => result.current.scheduleSave(chart('11'), save))
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    act(() => result.current.scheduleSave(chart('21'), save))
    await act(async () => failing.reject(new Error('offline')))
    await act(async () => {
      await result.current.flushSave()
    })
    // The failed chart 11 is not re-sent: only the newer chart 21 is retried.
    expect(save.mock.calls).toEqual([[chart('11')], [chart('21')]])
  })

  it('uses the save function captured with each edit (patient binding)', async () => {
    const saveForA = vi.fn().mockResolvedValue(undefined)
    const saveForB = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useOdontogramAutosave({ onError: vi.fn() }))

    act(() => result.current.scheduleSave(chart('11'), saveForA))
    await act(async () => {
      await result.current.flushSave()
    })
    act(() => result.current.scheduleSave(chart('21'), saveForB))
    await act(async () => {
      await result.current.flushSave()
    })
    expect(saveForA).toHaveBeenCalledExactlyOnceWith(chart('11'))
    expect(saveForB).toHaveBeenCalledExactlyOnceWith(chart('21'))
  })

  it('sends a pending edit when the editor unmounts', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    const { result, unmount } = renderHook(() => useOdontogramAutosave({ onError: vi.fn() }))

    act(() => result.current.scheduleSave(chart('11'), save))
    unmount()
    expect(save).toHaveBeenCalledExactlyOnceWith(chart('11'))
    expect(vi.getTimerCount()).toBe(0)
  })

  it('reports pending, saving and idle as an edit is debounced and persisted', async () => {
    const request = deferred()
    const save = vi.fn().mockReturnValueOnce(request.promise)
    const { result } = renderHook(() =>
      useOdontogramAutosave({ onError: vi.fn(), debounceMs: 100 }),
    )
    expect(result.current.saveState).toBe('idle')
    expect(result.current.isDirty).toBe(false)

    act(() => result.current.scheduleSave(chart('11'), save))
    expect(result.current.saveState).toBe('pending')
    expect(result.current.isDirty).toBe(true)

    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.saveState).toBe('saving')

    await act(async () => request.resolve())
    expect(result.current.saveState).toBe('idle')
    expect(result.current.isDirty).toBe(false)
  })

  it('stays dirty after a failure, never retries on its own, and recovers through retry', async () => {
    const onError = vi.fn()
    const save = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined)
    const { result } = renderHook(() => useOdontogramAutosave({ onError, debounceMs: 100 }))

    act(() => result.current.scheduleSave(chart('11'), save))
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.saveState).toBe('error')
    expect(result.current.isDirty).toBe(true)

    // No automatic retry loop: a long wait sends nothing new.
    await act(async () => {
      vi.advanceTimersByTime(60_000)
    })
    expect(save).toHaveBeenCalledTimes(1)

    // Retry needs no new edit and re-sends the kept chart.
    await act(async () => {
      await result.current.retry()
    })
    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenLastCalledWith(chart('11'))
    expect(result.current.saveState).toBe('idle')
    expect(result.current.isDirty).toBe(false)
  })
})
