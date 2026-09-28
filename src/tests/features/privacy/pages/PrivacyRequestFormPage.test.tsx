import userEvent from '@testing-library/user-event'

import { ApiError } from '@/services/http'
import { render, screen, waitFor } from '@/test-utils/render-utils'

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
  it('clears the field error when a rejected missing name is corrected', async () => {
    render(<PrivacyRequestFormPage />)
    await userEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }))
    const name = screen.getByPlaceholderText('Seu nome completo')
    expect(name).toHaveAttribute('aria-invalid', 'true')
    await userEvent.type(name, 'Ana Martins')
    expect(name).not.toHaveAttribute('aria-invalid', 'true')
  })
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

  it('gives every text field an accessible name from its visible label', () => {
    render(<PrivacyRequestFormPage />)
    expect(screen.getByLabelText('Nome completo')).toHaveAttribute('id', 'privacy-name')
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('id', 'privacy-email')
    expect(screen.getByLabelText(/Nome da clínica/)).toHaveAttribute('id', 'privacy-clinic')
    expect(screen.getByLabelText('Descrição da solicitação')).toHaveAttribute(
      'id',
      'privacy-description',
    )
  })

  it('validates each field inline before calling the API', async () => {
    const callsBefore = mockCreatePrivacyRequest.mock.calls.length
    render(<PrivacyRequestFormPage />)
    await userEvent.type(screen.getByLabelText('Nome completo'), 'A')
    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@clinica')
    await userEvent.type(screen.getByLabelText('Descrição da solicitação'), 'Curta')
    await userEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }))

    expect(screen.getByLabelText('Nome completo')).toHaveAccessibleDescription(
      'Informe seu nome completo.',
    )
    expect(screen.getByLabelText('E-mail')).toHaveAccessibleDescription('Informe um e-mail válido.')
    expect(screen.getByLabelText('Descrição da solicitação')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(
      screen.getByText('Descreva sua solicitação com pelo menos 10 caracteres.'),
    ).toBeInTheDocument()
    expect(mockCreatePrivacyRequest.mock.calls.length).toBe(callsBefore)
  })

  it('accepts a description of exactly 10 characters', async () => {
    mockCreatePrivacyRequest.mockResolvedValue({ requestCode: 'REQ-10', message: 'ok' })
    render(<PrivacyRequestFormPage />)
    await userEvent.type(screen.getByLabelText('Nome completo'), 'Ana Martins')
    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@clinica.com')
    await userEvent.type(screen.getByLabelText('Descrição da solicitação'), '1234567890')
    await userEvent.click(
      screen.getByText(/entendo que a dentalflow poderá precisar verificar minha identidade/i),
    )
    await userEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }))
    await waitFor(() => expect(mockCreatePrivacyRequest).toHaveBeenCalled())
  })

  it('omits an empty clinic name and normalises the e-mail', async () => {
    mockCreatePrivacyRequest.mockResolvedValue({ requestCode: 'REQ-1', message: 'ok' })
    render(<PrivacyRequestFormPage />)
    await userEvent.type(screen.getByLabelText('Nome completo'), '  Ana Martins ')
    await userEvent.type(screen.getByLabelText('E-mail'), ' Ana@Clinica.COM ')
    await userEvent.type(screen.getByLabelText(/Nome da clínica/), '   ')
    await userEvent.type(
      screen.getByLabelText('Descrição da solicitação'),
      'Quero acessar meus dados pessoais.',
    )
    await userEvent.click(
      screen.getByText(/entendo que a dentalflow poderá precisar verificar minha identidade/i),
    )
    await userEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }))
    await waitFor(() => expect(mockCreatePrivacyRequest).toHaveBeenCalled())
    const payload = mockCreatePrivacyRequest.mock.calls.at(-1)?.[0]
    expect(payload.clinicName).toBeUndefined()
    expect(payload.requesterEmail).toBe('ana@clinica.com')
    expect(payload.requesterName).toBe('Ana Martins')
  })

  it('shows the API validation message instead of a generic error', async () => {
    mockCreatePrivacyRequest.mockImplementation(async () => {
      throw new ApiError('A descrição deve ter pelo menos 10 caracteres.', 400, null)
    })
    render(<PrivacyRequestFormPage />)
    await fillRequiredFields()
    await userEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }))
    expect(
      await screen.findByText('A descrição deve ter pelo menos 10 caracteres.'),
    ).toBeInTheDocument()
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
