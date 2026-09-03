import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { ClinicMemberPasswordModal } from '@/features/team/components/ClinicMemberPasswordModal'

const mockUpdateClinicMemberPassword = vi.fn()
vi.mock('@/features/team/services/team.service', () => ({
  updateClinicMemberPassword: (...args: unknown[]) => mockUpdateClinicMemberPassword(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ClinicMemberPasswordModal', () => {
  it('shows the member name as the subject', () => {
    render(
      <ClinicMemberPasswordModal
        open
        memberId="m1"
        memberName="Ana Silva"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )
    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
  })

  it('submits the new password via updateClinicMemberPassword and calls onSuccess', async () => {
    mockUpdateClinicMemberPassword.mockResolvedValue(undefined)
    const onSuccess = vi.fn()
    render(
      <ClinicMemberPasswordModal
        open
        memberId="m1"
        memberName="Ana Silva"
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )
    await userEvent.type(screen.getByLabelText('Nova senha'), 'password123')
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /redefinir senha/i }))

    expect(mockUpdateClinicMemberPassword).toHaveBeenCalledWith('m1', { password: 'password123' })
    expect(await screen.findByRole('heading', { name: /redefinir senha/i })).toBeInTheDocument()
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('calls onClose when the cancel button is clicked', async () => {
    const onClose = vi.fn()
    render(
      <ClinicMemberPasswordModal
        open
        memberId="m1"
        memberName="Ana Silva"
        onClose={onClose}
        onSuccess={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
