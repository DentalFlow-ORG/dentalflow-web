import { useEffect, useState } from 'react'

export function useChatWidgetState() {
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    const handler = (event: Event) => {
      setChatOpen((event as CustomEvent<{ isOpen: boolean }>).detail.isOpen)
    }
    window.addEventListener('dentalflow:chat:state', handler)
    return () => window.removeEventListener('dentalflow:chat:state', handler)
  }, [])

  const toggleChat = () => {
    window.dispatchEvent(
      new CustomEvent(chatOpen ? 'dentalflow:chat:close' : 'dentalflow:chat:open'),
    )
  }

  return { chatOpen, toggleChat }
}
