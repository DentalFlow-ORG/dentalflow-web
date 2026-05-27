import { act, render, screen, userEvent, fireEvent } from '@/test/render-utils'

import { LeadChatWidget } from '@/features/marketing/components/LeadChatWidget'

const mockSubmitPublicLead = vi.fn()

vi.mock('@/services/public-leads.service', () => ({
  submitPublicLead: (...args: unknown[]) => mockSubmitPublicLead(...args),
}))

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Abrir chat de contato' }))
}

async function advanceToProcessStep(user: ReturnType<typeof userEvent.setup>) {
  await openPanel(user)
  await user.click(screen.getByRole('button', { name: 'Quero organizar minha agenda' }))
}

async function advanceToFormStep(user: ReturnType<typeof userEvent.setup>) {
  await advanceToProcessStep(user)
  await user.click(screen.getByRole('button', { name: 'Uso papel hoje' }))
}

describe('LeadChatWidget', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
    vi.clearAllMocks()
    mockSubmitPublicLead.mockResolvedValue({ success: true, message: 'ok' })
  })

  it('renders the floating chat button and no panel initially', () => {
    render(<LeadChatWidget />)
    expect(screen.getByRole('button', { name: 'Abrir chat de contato' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the chat panel when the floating button is clicked', async () => {
    const user = userEvent.setup()
    render(<LeadChatWidget />)
    await openPanel(user)
    expect(screen.getByRole('dialog', { name: 'Chat de contato DentalFlow' })).toBeInTheDocument()
  })

  it('shows the initial bot message and situation option buttons', async () => {
    const user = userEvent.setup()
    render(<LeadChatWidget />)
    await openPanel(user)
    expect(screen.getByText('Olá! 👋 O que você quer melhorar na sua clínica?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quero organizar minha agenda' })).toBeInTheDocument()
  })

  it('advances to the process step after selecting a situation', async () => {
    const user = userEvent.setup()
    render(<LeadChatWidget />)
    await advanceToProcessStep(user)
    expect(screen.getByText('Entendido! Como você gerencia sua clínica hoje?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Uso papel hoje' })).toBeInTheDocument()
  })

  it('advances to the form step after selecting a process', async () => {
    const user = userEvent.setup()
    render(<LeadChatWidget />)
    await advanceToFormStep(user)
    expect(screen.getByLabelText(/Seu nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/WhatsApp/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Aceito ser contatado/i })).toBeInTheDocument()
  })

  it('shows required field errors when submitting an empty form', async () => {
    const user = userEvent.setup()
    render(<LeadChatWidget />)
    await advanceToFormStep(user)
    await user.click(screen.getByRole('button', { name: /Enviar mensagem/i }))
    expect(screen.getByText('Informe seu nome.')).toBeInTheDocument()
    expect(screen.getByText('Informe seu WhatsApp.')).toBeInTheDocument()
    expect(screen.getByText('Você precisa aceitar para continuar.')).toBeInTheDocument()
  })

  it('shows the success message and close button after a successful submission', async () => {
    const user = userEvent.setup()
    render(<LeadChatWidget />)
    await advanceToFormStep(user)
    await user.type(screen.getByLabelText(/Seu nome/i), 'Ana Silva')
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), {
      target: { value: '(11) 99999-9999' },
    })
    await user.click(screen.getByRole('checkbox', { name: /Aceito ser contatado/i }))
    await user.click(screen.getByRole('button', { name: /Enviar mensagem/i }))
    expect(
      await screen.findByText(
        '🎉 Recebemos seu contato! Em breve um especialista do DentalFlow falará com você pelo WhatsApp.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument()
  })

  it('shows a submit error and keeps the form when submission fails', async () => {
    mockSubmitPublicLead.mockRejectedValue(new Error('network'))
    const user = userEvent.setup()
    render(<LeadChatWidget />)
    await advanceToFormStep(user)
    await user.type(screen.getByLabelText(/Seu nome/i), 'Ana Silva')
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), {
      target: { value: '(11) 99999-9999' },
    })
    await user.click(screen.getByRole('checkbox', { name: /Aceito ser contatado/i }))
    await user.click(screen.getByRole('button', { name: /Enviar mensagem/i }))
    expect(
      await screen.findByText(
        'Não foi possível enviar. Tente novamente ou entre em contato pelo WhatsApp.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enviar mensagem/i })).toBeInTheDocument()
  })

  it('closes the panel when the header close button is clicked', async () => {
    const user = userEvent.setup()
    render(<LeadChatWidget />)
    await openPanel(user)
    await user.click(screen.getByRole('button', { name: 'Fechar chat' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the panel in response to the dentalflow:chat:open custom event', async () => {
    render(<LeadChatWidget />)
    act(() => {
      window.dispatchEvent(new CustomEvent('dentalflow:chat:open'))
    })
    expect(
      await screen.findByRole('dialog', { name: 'Chat de contato DentalFlow' }),
    ).toBeInTheDocument()
  })
})
