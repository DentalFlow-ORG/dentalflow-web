import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/legal/components/LegalPageShell', () => ({
  LegalPageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/features/legal/components/LegalSection', () => ({
  LegalPageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  LegalSection: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (v: string) => void
    children: React.ReactNode
  }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

const mockCreatePrivacyRequest = vi.fn()
vi.mock('@/features/privacy/services/privacy.service', () => ({
  createPrivacyRequest: (...args: unknown[]) => mockCreatePrivacyRequest(...args),
}))

import { PrivacyRequestFormPage } from '@/features/privacy/pages/PrivacyRequestFormPage'

async function fillRequiredFields() {
  await userEvent.type(screen.getByPlaceholderText('Seu nome completo'), 'Ana Martins')
  await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'ana@clinica.com')
  await userEvent.type(
    screen.getByPlaceholderText('Descreva sua solicitação em detalhes...'),
    'Quero acessar meus dados pessoais.',
  )
  await userEvent.click(
    screen.getByText(/entendo que a dentalflow poderá precisar verificar minha identidade/i),
  )
}

// NOTE: deliberately no beforeEach mock reset — every test that depends on
// mockCreatePrivacyRequest sets its own implementation before use. Pairing a
// mockReset()/mockClear() in beforeEach with a rejecting mock implementation
// makes Vitest misattribute the (production-code-caught) rejection as
// unhandled, failing the test even though the page's own try/catch handles it.
describe('PrivacyRequestFormPage', () => {
  it('renders the form header and all sections', () => {
    render(<PrivacyRequestFormPage />)
    expect(screen.getByText('Formulário de Solicitação')).toBeInTheDocument()
    expect(screen.getByText('1. Identificação')).toBeInTheDocument()
    expect(screen.getByText('2. Sua Solicitação')).toBeInTheDocument()
    expect(screen.getByText('3. Verificação de Identidade')).toBeInTheDocument()
  })

  it('shows a validation error when submitting without accepting identity verification', async () => {
    render(<PrivacyRequestFormPage />)
    await userEvent.type(screen.getByPlaceholderText('Seu nome completo'), 'Ana')
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'ana@clinica.com')
    await userEvent.type(
      screen.getByPlaceholderText('Descreva sua solicitação em detalhes...'),
      'Descrição',
    )
    await userEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }))
    expect(mockCreatePrivacyRequest).not.toHaveBeenCalled()
    expect(
      await screen.findByText('Você precisa aceitar a verificação de identidade para continuar.'),
    ).toBeInTheDocument()
  })

  it('submits the form and shows the success card with the request code', async () => {
    mockCreatePrivacyRequest.mockResolvedValue({ requestCode: 'REQ-123', message: 'ok' })
    render(<PrivacyRequestFormPage />)
    await fillRequiredFields()
    await userEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }))

    expect(mockCreatePrivacyRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        requesterName: 'Ana Martins',
        requesterEmail: 'ana@clinica.com',
        description: 'Quero acessar meus dados pessoais.',
        identityConfirmationAccepted: true,
      }),
    )
    expect(await screen.findByText('Solicitação registrada com sucesso')).toBeInTheDocument()
    expect(screen.getByText('REQ-123')).toBeInTheDocument()
  }, 15000)

  it('shows an error message when the submission fails', async () => {
    // mockImplementation(async () => { throw ... }) rather than mockRejectedValue:
    // avoids a Vitest/V8-coverage timing interaction that can misattribute this
    // production-code-caught rejection as unhandled.
    mockCreatePrivacyRequest.mockImplementation(async () => {
      throw new Error('network error')
    })
    render(<PrivacyRequestFormPage />)
    await fillRequiredFields()
    await userEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }))

    expect(await screen.findByText(/não foi possível enviar sua solicitação/i)).toBeInTheDocument()
  })

  it('shows "Enviando..." while the request is in flight', async () => {
    let resolveRequest: (value: { requestCode: string; message: string }) => void = () => {}
    mockCreatePrivacyRequest.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        }),
    )
    render(<PrivacyRequestFormPage />)
    await fillRequiredFields()
    await userEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }))
    expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled()
    resolveRequest({ requestCode: 'REQ-1', message: 'ok' })
    await screen.findByText('Solicitação registrada com sucesso')
  }, 15000)

  it('updates the clinic name field', async () => {
    render(<PrivacyRequestFormPage />)
    const input = screen.getByPlaceholderText('Nome da clínica relacionada (se aplicável)')
    await userEvent.type(input, 'Clínica Sorriso')
    expect(input).toHaveValue('Clínica Sorriso')
  })

  it('shows a live character count for the description field', async () => {
    render(<PrivacyRequestFormPage />)
    await userEvent.type(
      screen.getByPlaceholderText('Descreva sua solicitação em detalhes...'),
      'abc',
    )
    expect(screen.getByText('3/2000')).toBeInTheDocument()
  })

  it('changes the requester type and request type via the selects', async () => {
    render(<PrivacyRequestFormPage />)
    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[0], 'CLINIC_OWNER')
    await userEvent.selectOptions(selects[1], 'DELETE_OR_ANONYMIZE')
    expect(selects[0]).toHaveValue('CLINIC_OWNER')
    expect(selects[1]).toHaveValue('DELETE_OR_ANONYMIZE')
  })
})
