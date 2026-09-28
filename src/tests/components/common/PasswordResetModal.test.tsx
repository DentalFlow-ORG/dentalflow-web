import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { PasswordResetModal } from '@/components/common/PasswordResetModal'
import { PASSWORD_POLICY_MESSAGE } from '@/lib/validators/password'

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
    await fillPasswords('Sen@12', 'Sen@12')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(await screen.findByText(PASSWORD_POLICY_MESSAGE)).toBeInTheDocument()
  })

  it('rejects a long password missing the complexity rules the API enforces', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderModal({ onSubmit })
    await fillPasswords('password123', 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(await screen.findByText(PASSWORD_POLICY_MESSAGE)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows the password requirements checklist while typing', async () => {
    renderModal()
    await userEvent.type(screen.getByLabelText('Nova senha'), 'abc')
    expect(screen.getByRole('list', { name: 'Requisitos de senha' })).toBeInTheDocument()
  })

  it('cannot be dismissed with Escape while the request is pending', async () => {
    const onClose = vi.fn()
    const onSubmit = vi.fn(() => new Promise<void>(() => {}))
    renderModal({ onClose, onSubmit })
    await fillPasswords('Senha@123', 'Senha@123')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(await screen.findByRole('button', { name: /salvando/i })).toBeDisabled()
    await userEvent.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('caps typed input at 72 characters via the maxLength attribute', async () => {
    renderModal()
    const input = screen.getByLabelText('Nova senha')
    await userEvent.type(input, 'a'.repeat(80), { delay: null })
    expect(input).toHaveValue('a'.repeat(72))
  }, 15000)

  it('shows an error when passwords do not match', async () => {
    renderModal()
    await fillPasswords('Senha@123', 'Senha@456')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(await screen.findByText('As senhas não coincidem.')).toBeInTheDocument()
  })

  it('calls onSubmit and onSuccess with a valid matching password', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onSuccess = vi.fn()
    renderModal({ onSubmit, onSuccess })
    await fillPasswords('Senha@123', 'Senha@123')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(onSubmit).toHaveBeenCalledWith('Senha@123')
    expect(await screen.findByRole('button', { name: 'Redefinir senha' })).toBeEnabled()
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('shows the submitted error message when onSubmit rejects with an Error', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Senha já utilizada.'))
    renderModal({ onSubmit })
    await fillPasswords('Senha@123', 'Senha@123')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(await screen.findByText('Senha já utilizada.')).toBeInTheDocument()
  })

  it('shows a generic error message when onSubmit rejects with a non-Error', async () => {
    const onSubmit = vi.fn().mockRejectedValue('some string error')
    renderModal({ onSubmit })
    await fillPasswords('Senha@123', 'Senha@123')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(await screen.findByText('Erro ao atualizar senha.')).toBeInTheDocument()
  })

  it('calls onClose when Cancelar is clicked', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('dismisses exactly once with Escape', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    await userEvent.keyboard('{Escape}')
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
