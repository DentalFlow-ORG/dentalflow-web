import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

const mockUpdateAdminUserPassword = vi.fn()
vi.mock('@/features/admin/services/admin-users.service', () => ({
  updateAdminUserPassword: (...args: unknown[]) => mockUpdateAdminUserPassword(...args),
}))

import { UserPasswordModal } from '@/features/admin/components/UserPasswordModal'

beforeEach(() => {
  mockUpdateAdminUserPassword.mockReset()
  mockUpdateAdminUserPassword.mockResolvedValue(undefined)
})

describe('UserPasswordModal', () => {
  it('renders the subject name when open', () => {
    render(
      <UserPasswordModal
        open
        userId="u1"
        userName="Ana Martins"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )
    expect(screen.getByText('Ana Martins')).toBeInTheDocument()
  })

  it('submits the new password via updateAdminUserPassword for the given userId', async () => {
    const onSuccess = vi.fn()
    render(
      <UserPasswordModal
        open
        userId="u1"
        userName="Ana Martins"
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )
    await userEvent.type(screen.getByLabelText('Nova senha'), 'novaSenha123')
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'novaSenha123')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))

    expect(mockUpdateAdminUserPassword).toHaveBeenCalledWith('u1', { password: 'novaSenha123' })
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('calls onClose when cancelled', async () => {
    const onClose = vi.fn()
    render(
      <UserPasswordModal
        open
        userId="u1"
        userName="Ana Martins"
        onClose={onClose}
        onSuccess={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
