import type { ReactNode } from 'react'

import { render, screen, userEvent } from '@/test/render-utils'

import { FaqPage } from '@/features/marketing/pages/FaqPage'

const mockToggleChat = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={String(to)}>{children}</a>
  ),
}))

vi.mock('@/features/marketing/components/PublicLayout', () => ({
  PublicLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('@/features/marketing/hooks/useChatWidgetState', () => ({
  useChatWidgetState: () => ({ chatOpen: false, toggleChat: mockToggleChat }),
}))

vi.mock('@/features/marketing/hooks/usePageMeta', () => ({
  usePageMeta: () => {},
}))

describe('FaqPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the hero heading', () => {
    render(<FaqPage />)
    expect(
      screen.getByRole('heading', { name: /Tire suas dúvidas/i }),
    ).toBeInTheDocument()
  })

  it('renders all three FAQ group headings', () => {
    render(<FaqPage />)
    expect(screen.getByText('Planos e assinatura')).toBeInTheDocument()
    expect(screen.getByText('Funcionalidades')).toBeInTheDocument()
    expect(screen.getByText('Dados, segurança e acesso')).toBeInTheDocument()
  })

  it('renders FAQ question buttons collapsed by default', () => {
    render(<FaqPage />)
    const button = screen.getByRole('button', {
      name: 'O DentalFlow serve para clínica pequena?',
    })
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('expands a question on click and sets aria-expanded to true', async () => {
    const user = userEvent.setup()
    render(<FaqPage />)
    const button = screen.getByRole('button', {
      name: 'O DentalFlow serve para clínica pequena?',
    })
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    const panelId = button.getAttribute('aria-controls')
    expect(document.getElementById(panelId!)).toBeInTheDocument()
  })

  it('collapses an expanded question on second click', async () => {
    const user = userEvent.setup()
    render(<FaqPage />)
    const button = screen.getByRole('button', {
      name: 'O DentalFlow serve para clínica pequena?',
    })
    await user.click(button)
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('chat contact button has aria-pressed="false" and calls toggleChat on click', async () => {
    const user = userEvent.setup()
    render(<FaqPage />)
    const chatButton = screen.getByRole('button', { name: /Chat de contato/i })
    expect(chatButton).toHaveAttribute('aria-pressed', 'false')
    await user.click(chatButton)
    expect(mockToggleChat).toHaveBeenCalledTimes(1)
  })

  it('CTA links point to /acessar and /planos', () => {
    render(<FaqPage />)
    expect(
      screen.getByRole('link', { name: /Começar teste grátis/i }),
    ).toHaveAttribute('href', '/acessar')
    expect(
      screen.getByRole('link', { name: /Ver planos e preços/i }),
    ).toHaveAttribute('href', '/planos')
  })
})
