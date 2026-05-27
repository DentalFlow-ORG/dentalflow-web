import { act, renderHook, waitFor } from '@/test/render-utils'

import { useChatWidgetState } from '@/features/marketing/hooks/useChatWidgetState'

describe('useChatWidgetState', () => {
  it('syncs chatOpen from dentalflow:chat:state events', async () => {
    const { result } = renderHook(() => useChatWidgetState())

    expect(result.current.chatOpen).toBe(false)

    act(() => {
      window.dispatchEvent(
        new CustomEvent('dentalflow:chat:state', { detail: { isOpen: true } }),
      )
    })

    await waitFor(() => expect(result.current.chatOpen).toBe(true))
  })

  it('dispatches open event when toggled while closed', () => {
    const onOpen = vi.fn()
    window.addEventListener('dentalflow:chat:open', onOpen)
    const { result } = renderHook(() => useChatWidgetState())

    act(() => {
      result.current.toggleChat()
    })

    expect(onOpen).toHaveBeenCalledTimes(1)
    window.removeEventListener('dentalflow:chat:open', onOpen)
  })

  it('dispatches close event when toggled while open', async () => {
    const onClose = vi.fn()
    window.addEventListener('dentalflow:chat:close', onClose)
    const { result } = renderHook(() => useChatWidgetState())

    act(() => {
      window.dispatchEvent(
        new CustomEvent('dentalflow:chat:state', { detail: { isOpen: true } }),
      )
    })

    await waitFor(() => expect(result.current.chatOpen).toBe(true))

    act(() => {
      result.current.toggleChat()
    })

    expect(onClose).toHaveBeenCalledTimes(1)
    window.removeEventListener('dentalflow:chat:close', onClose)
  })
})
