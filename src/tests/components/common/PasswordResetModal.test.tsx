import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { PasswordResetModal } from '@/components/common/PasswordResetModal'

function renderModal(overrides: Partial<React.ComponentProps<typeof PasswordResetModal>> = {}) {
  return render(
    <PasswordResetModal
      open
      subjectName="João da Silva"
      formId="reset-form"
      newPasswordId="new-password"
      confirmPasswordId="confirm-password"
      onClose={vi.fn()}
      onSubmit={vi.fn().mockResolvedValue(undefined)}
      onSuccess={vi.fn()}
      {...overrides}
    />,
  )
}

async function fillPasswords(password: string, confirm: string) {
  await userEvent.type(screen.getByLabelText('Nova senha'), password)
  await userEvent.type(screen.getByLabelText('Confirmar senha'), confirm)
}

describe('PasswordResetModal', () => {
  it('renders nothing when closed', () => {
    renderModal({ open: false })
    expect(screen.queryByText('João da Silva')).not.toBeInTheDocument()
  })

  it('renders the default title and subjectName when open', () => {
    renderModal()
    expect(screen.getByRole('heading', { name: 'Redefinir senha' })).toBeInTheDocument()
    expect(screen.getByText('João da Silva')).toBeInTheDocument()
  })

  it('renders a custom title', () => {
    renderModal({ title: 'Trocar senha do usuário' })
    expect(screen.getByRole('heading', { name: 'Trocar senha do usuário' })).toBeInTheDocument()
  })

  it('shows an error when the password is shorter than 8 characters', async () => {
    renderModal()
    await fillPasswords('short1', 'short1')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(await screen.findByText('A senha deve ter pelo menos 8 caracteres.')).toBeInTheDocument()
  })

  it('caps typed input at 72 characters via the maxLength attribute', async () => {
    renderModal()
    const input = screen.getByLabelText('Nova senha')
    await userEvent.type(input, 'a'.repeat(80))
    expect(input).toHaveValue('a'.repeat(72))
  })

  it('shows an error when passwords do not match', async () => {
    renderModal()
    await fillPasswords('password123', 'password456')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(await screen.findByText('As senhas nao coincidem.')).toBeInTheDocument()
  })

  it('calls onSubmit and onSuccess with a valid matching password', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onSuccess = vi.fn()
    renderModal({ onSubmit, onSuccess })
    await fillPasswords('password123', 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(onSubmit).toHaveBeenCalledWith('password123')
    expect(await screen.findByRole('button', { name: 'Redefinir senha' })).toBeEnabled()
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('shows the submitted error message when onSubmit rejects with an Error', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Senha já utilizada.'))
    renderModal({ onSubmit })
    await fillPasswords('password123', 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(await screen.findByText('Senha já utilizada.')).toBeInTheDocument()
  })

  it('shows a generic error message when onSubmit rejects with a non-Error', async () => {
    const onSubmit = vi.fn().mockRejectedValue('some string error')
    renderModal({ onSubmit })
    await fillPasswords('password123', 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(await screen.findByText('Erro ao atualizar senha.')).toBeInTheDocument()
  })

  it('calls onClose when Cancelar is clicked', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('resets the form fields each time it reopens', () => {
    const { rerender } = renderModal({ open: false })
    rerender(
      <PasswordResetModal
        open
        subjectName="João da Silva"
        formId="reset-form"
        newPasswordId="new-password"
        confirmPasswordId="confirm-password"
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onSuccess={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Nova senha')).toHaveValue('')
  })
})
