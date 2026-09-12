import { fireEvent, render, screen, userEvent, waitFor } from '@/test-utils/render-utils'

import {
  listAvailability,
  listAvailabilityExceptions,
} from '@/features/scheduling/services/scheduling.service'
import { ClinicMemberFormModal } from '@/features/team/components/ClinicMemberFormModal'
import { createMember, updateClinicMember } from '@/features/team/services/team.service'
import type { CreateMemberResponse, MemberListItem } from '@/features/team/types/team.types'

vi.mock('@/features/team/services/team.service', () => ({
  createMember: vi.fn(),
  updateClinicMember: vi.fn(),
}))

vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  listAvailability: vi.fn(),
  listAvailabilityExceptions: vi.fn(),
}))

vi.mock('@/features/scheduling/components/availability/AvailabilityManager', () => ({
  AvailabilityManager: () => <div data-testid="availability-manager" />,
}))

vi.mock('@/features/scheduling/components/availability/ExceptionManager', () => ({
  ExceptionManager: () => <div data-testid="exception-manager" />,
}))

function makeMember(overrides: Partial<MemberListItem> = {}): MemberListItem {
  return {
    id: 'member-1',
    firstName: 'Ana',
    lastName: 'Silva',
    email: 'ana@clinica.com',
    role: 'DENTIST',
    phone: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    profile: null,
    ...overrides,
  }
}

function renderModal(
  props: Partial<{
    open: boolean
    initialData: MemberListItem | undefined
    onClose: () => void
    onSuccess: (member: MemberListItem) => void
  }> = {},
) {
  const resolved = {
    open: true,
    initialData: undefined,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    ...props,
  }
  render(<ClinicMemberFormModal {...resolved} />)
  return resolved
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(listAvailability).mockResolvedValue([])
  vi.mocked(listAvailabilityExceptions).mockResolvedValue([])
})

describe('ClinicMemberFormModal — create mode', () => {
  it('renders title, description, and role selector cards', async () => {
    renderModal()

    expect(await screen.findByText('Novo membro')).toBeInTheDocument()
    expect(
      screen.getByText('Adicione um profissional ou assistente à clínica.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /profissional/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /assistente/i })).toBeInTheDocument()
  })

  it('shows section headings for Tipo de membro, Dados do membro, and Senha de acesso', async () => {
    renderModal()

    await screen.findByText('Novo membro')
    expect(screen.getByText('Tipo de membro')).toBeInTheDocument()
    expect(screen.getByText('Dados do membro')).toBeInTheDocument()
    expect(screen.getByText('Senha de acesso')).toBeInTheDocument()
  })

  it('shows password field and hides Status da conta', async () => {
    renderModal()

    await screen.findByText('Novo membro')
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.queryByText('Status da conta')).toBeNull()
  })

  it('does not show the availability section', async () => {
    renderModal()

    await screen.findByText('Novo membro')
    expect(screen.queryByTestId('availability-manager')).toBeNull()
    expect(screen.queryByTestId('exception-manager')).toBeNull()
    expect(screen.queryByText('Disponibilidade')).toBeNull()
  })

  it('calls createMember with the correct payload on valid submission', async () => {
    const user = userEvent.setup()
    const created = makeMember({ id: 'new-1', firstName: 'Carlos', lastName: 'Melo' })
    vi.mocked(createMember).mockResolvedValue({ user: created, profile: null })
    const onSuccess = vi.fn()

    renderModal({ onSuccess })

    await screen.findByText('Novo membro')
    await user.type(screen.getByLabelText('Nome'), 'Carlos')
    await user.type(screen.getByLabelText('Sobrenome'), 'Melo')
    await user.type(screen.getByLabelText('E-mail'), 'carlos@clinica.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: /criar membro/i }))

    await waitFor(() =>
      expect(createMember).toHaveBeenCalledWith({
        firstName: 'Carlos',
        lastName: 'Melo',
        email: 'carlos@clinica.com',
        password: 'senha123',
        role: 'DENTIST',
        phone: undefined,
      }),
    )
    expect(onSuccess).toHaveBeenCalledWith(created)
  })

  it('does not include specialtyIds, displayName, or crmNumber in the create payload', async () => {
    const user = userEvent.setup()
    vi.mocked(createMember).mockResolvedValue({ user: makeMember(), profile: null })

    renderModal()

    await screen.findByText('Novo membro')
    await user.type(screen.getByLabelText('Nome'), 'Carlos')
    await user.type(screen.getByLabelText('Sobrenome'), 'Melo')
    await user.type(screen.getByLabelText('E-mail'), 'carlos@clinica.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: /criar membro/i }))

    await waitFor(() => expect(createMember).toHaveBeenCalled())
    const payload = vi.mocked(createMember).mock.calls[0][0]
    expect(payload).not.toHaveProperty('specialtyIds')
    expect(payload).not.toHaveProperty('displayName')
    expect(payload).not.toHaveProperty('crmNumber')
  })
})

describe('ClinicMemberFormModal — edit mode', () => {
  it('renders title, description, and role selector cards', async () => {
    renderModal({ initialData: makeMember() })

    expect(await screen.findByText('Editar membro')).toBeInTheDocument()
    expect(screen.getByText('Atualize os dados de Ana Silva.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /profissional/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /assistente/i })).toBeInTheDocument()
  })

  it('hides password field and shows Status da conta', async () => {
    renderModal({ initialData: makeMember() })

    await screen.findByText('Editar membro')
    expect(screen.queryByLabelText('Senha')).toBeNull()
    expect(screen.getByText('Status da conta')).toBeInTheDocument()
  })

  it('pre-fills form fields from initialData', async () => {
    renderModal({ initialData: makeMember() })

    await screen.findByText('Editar membro')
    expect(screen.getByLabelText('Nome')).toHaveValue('Ana')
    expect(screen.getByLabelText('Sobrenome')).toHaveValue('Silva')
    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@clinica.com')
  })

  it('calls updateClinicMember with the correct payload on submission', async () => {
    const user = userEvent.setup()
    const member = makeMember()
    const updated = makeMember({ firstName: 'Ana' })
    vi.mocked(updateClinicMember).mockResolvedValue(updated)
    const onSuccess = vi.fn()

    renderModal({ initialData: member, onSuccess })

    await screen.findByText('Editar membro')
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() =>
      expect(updateClinicMember).toHaveBeenCalledWith('member-1', {
        firstName: 'Ana',
        lastName: 'Silva',
        email: 'ana@clinica.com',
        role: 'DENTIST',
        phone: undefined,
        isActive: true,
      }),
    )
    expect(onSuccess).toHaveBeenCalledWith(updated)
  })

  it('does not call createMember in edit mode', async () => {
    const user = userEvent.setup()
    vi.mocked(updateClinicMember).mockResolvedValue(makeMember())

    renderModal({ initialData: makeMember() })

    await screen.findByText('Editar membro')
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() => expect(updateClinicMember).toHaveBeenCalled())
    expect(createMember).not.toHaveBeenCalled()
  })
})

describe('ClinicMemberFormModal — DENTIST/ASSISTANT availability behavior', () => {
  it('shows the availability section for DENTIST with a profile in edit mode', async () => {
    const member = makeMember({
      role: 'DENTIST',
      profile: {
        id: 'profile-1',
        userId: 'member-1',
        slug: 'ana-silva',
        displayName: 'Dra. Ana Silva',
        isPublished: false,
      },
    })

    renderModal({ initialData: member })

    expect(await screen.findByTestId('availability-manager')).toBeInTheDocument()
    expect(screen.getByTestId('exception-manager')).toBeInTheDocument()
    expect(screen.getByText('Disponibilidade')).toBeInTheDocument()
  })

  it('does not show availability section for ASSISTANT in edit mode', async () => {
    const member = makeMember({
      role: 'ASSISTANT',
      profile: {
        id: 'profile-1',
        userId: 'member-1',
        slug: 'ana-silva',
        displayName: 'Ana Silva',
        isPublished: false,
      },
    })

    renderModal({ initialData: member })

    await screen.findByText('Editar membro')
    expect(screen.queryByTestId('availability-manager')).toBeNull()
    expect(screen.queryByTestId('exception-manager')).toBeNull()
    expect(screen.queryByText('Disponibilidade')).toBeNull()
  })

  it('does not show availability section for DENTIST without a profile', async () => {
    const member = makeMember({ role: 'DENTIST', profile: null })

    renderModal({ initialData: member })

    await screen.findByText('Editar membro')
    expect(screen.queryByTestId('availability-manager')).toBeNull()
    expect(screen.queryByTestId('exception-manager')).toBeNull()
  })

  it('shows no-profile notice for DENTIST without a profile', async () => {
    const member = makeMember({ role: 'DENTIST', profile: null })

    renderModal({ initialData: member })

    await screen.findByText('Editar membro')
    expect(
      screen.getByText(/disponibilidade não configurada para este profissional/i),
    ).toBeInTheDocument()
  })

  it('hides no-profile notice for DENTIST with a profile', async () => {
    const member = makeMember({
      role: 'DENTIST',
      profile: {
        id: 'profile-1',
        userId: 'member-1',
        slug: 'ana-silva',
        displayName: 'Dra. Ana Silva',
        isPublished: false,
      },
    })

    renderModal({ initialData: member })

    await screen.findByTestId('availability-manager')
    expect(screen.queryByText(/não possui perfil público/i)).toBeNull()
  })
})

describe('ClinicMemberFormModal — accessibility and layout', () => {
  it('renders the dialog title as an accessible heading element', async () => {
    renderModal()
    expect(await screen.findByRole('heading', { name: /novo membro/i })).toBeInTheDocument()
  })

  it('renders the dialog title as a heading in edit mode', async () => {
    renderModal({ initialData: makeMember() })
    expect(await screen.findByRole('heading', { name: /editar membro/i })).toBeInTheDocument()
  })

  it('renders the dialog description', async () => {
    renderModal()
    await screen.findByText('Novo membro')
    expect(
      screen.getByText('Adicione um profissional ou assistente à clínica.'),
    ).toBeInTheDocument()
  })

  it('Dialog.Content has viewport-safe layout classes', async () => {
    renderModal()
    await screen.findByText('Novo membro')
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('max-h-[calc(100dvh-2rem)]')
    expect(dialog.className).toContain('overflow-hidden')
    expect(dialog.className).toContain('flex')
  })

  it('scrollable body has internal scroll classes and app-scrollbar', async () => {
    renderModal()
    await screen.findByText('Novo membro')
    const dialog = screen.getByRole('dialog')
    const scrollableBody = dialog.querySelector('.overflow-y-auto')
    expect(scrollableBody).toBeInTheDocument()
    expect(scrollableBody!.className).toContain('min-h-0')
    expect(scrollableBody!.className).toContain('flex-1')
    expect(scrollableBody!.className).toContain('app-scrollbar')
  })

  it('footer buttons are outside the scrollable body', async () => {
    renderModal()
    await screen.findByText('Novo membro')
    const dialog = screen.getByRole('dialog')
    const scrollableBody = dialog.querySelector('.overflow-y-auto')
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i })
    const submitBtn = screen.getByRole('button', { name: /criar membro/i })
    expect(scrollableBody).not.toContainElement(cancelBtn)
    expect(scrollableBody).not.toContainElement(submitBtn)
  })
})

describe('ClinicMemberFormModal — interactions', () => {
  it('validates a phone, clears its error on editing and saves an inactive assistant', async () => {
    const member = makeMember({ isActive: false })
    vi.mocked(updateClinicMember).mockResolvedValue(member)
    renderModal({ initialData: member })
    await userEvent.type(screen.getByLabelText(/telefone/i), '123')
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(screen.getByText('Informe um telefone válido com DDD.')).toBeInTheDocument()
    expect(updateClinicMember).not.toHaveBeenCalled()
    await userEvent.clear(screen.getByLabelText(/telefone/i))
    await userEvent.type(screen.getByLabelText(/telefone/i), '11987654321')
    expect(screen.queryByText('Informe um telefone válido com DDD.')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /assistente/i }))
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: /^Ativo$/ }))
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(updateClinicMember).toHaveBeenCalledWith(
      member.id,
      expect.objectContaining({ role: 'ASSISTANT', phone: '11987654321', isActive: true }),
    )
  })

  it('shows a generic save failure and succeeds on retry', async () => {
    const member = makeMember()
    vi.mocked(updateClinicMember).mockRejectedValueOnce('offline').mockResolvedValueOnce(member)
    const { onSuccess } = renderModal({ initialData: member })
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(screen.getByText('Erro ao salvar usuário.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it.each([new Error('Horários indisponíveis'), 'offline'])(
    'presents availability load failures: %s',
    async (error) => {
      vi.mocked(listAvailability).mockRejectedValueOnce(error)
      renderModal({
        initialData: makeMember({
          profile: {
            id: 'profile-1',
            userId: 'member-1',
            slug: 'ana',
            displayName: 'Ana',
            isPublished: false,
          },
        }),
      })
      expect(
        await screen.findByText(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os horários do profissional.',
        ),
      ).toBeInTheDocument()
    },
  )

  it('dismisses exactly once with Escape', async () => {
    const { onClose } = renderModal()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('cancel button calls onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    renderModal({ onClose })

    await screen.findByText('Novo membro')
    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onClose).toHaveBeenCalled()
  })

  it('shows error feedback when submission fails', async () => {
    const user = userEvent.setup()
    vi.mocked(createMember).mockRejectedValue(new Error('E-mail já cadastrado.'))

    renderModal()

    await screen.findByText('Novo membro')
    await user.type(screen.getByLabelText('Nome'), 'Carlos')
    await user.type(screen.getByLabelText('Sobrenome'), 'Melo')
    await user.type(screen.getByLabelText('E-mail'), 'carlos@clinica.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: /criar membro/i }))

    expect(await screen.findByText('E-mail já cadastrado.')).toBeInTheDocument()
  })

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup()
    let resolve!: (value: CreateMemberResponse) => void
    vi.mocked(createMember).mockReturnValue(
      new Promise<CreateMemberResponse>((r) => {
        resolve = r
      }),
    )

    renderModal()

    await screen.findByText('Novo membro')
    await user.type(screen.getByLabelText('Nome'), 'Carlos')
    await user.type(screen.getByLabelText('Sobrenome'), 'Melo')
    await user.type(screen.getByLabelText('E-mail'), 'carlos@clinica.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: /criar membro/i }))

    expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled()

    resolve({ user: makeMember(), profile: null })
    await waitFor(() => expect(screen.queryByRole('button', { name: /salvando/i })).toBeNull())
  })

  it('shows validation error when required fields are empty', async () => {
    renderModal()

    await screen.findByText('Novo membro')
    // fireEvent.submit bypasses native HTML required-attribute validation
    // so our custom handleSubmit guard is exercised
    fireEvent.submit(document.getElementById('clinic-member-form')!)

    expect(
      await screen.findByText('Nome, sobrenome e e-mail são obrigatórios.'),
    ).toBeInTheDocument()
    expect(createMember).not.toHaveBeenCalled()
  })

  it('shows validation error when password is too short in create mode', async () => {
    const user = userEvent.setup()

    renderModal()

    await screen.findByText('Novo membro')
    await user.type(screen.getByLabelText('Nome'), 'Carlos')
    await user.type(screen.getByLabelText('Sobrenome'), 'Melo')
    await user.type(screen.getByLabelText('E-mail'), 'carlos@clinica.com')
    await user.type(screen.getByLabelText('Senha'), 'curta')
    await user.click(screen.getByRole('button', { name: /criar membro/i }))

    expect(await screen.findByText('A senha deve ter pelo menos 8 caracteres.')).toBeInTheDocument()
    expect(createMember).not.toHaveBeenCalled()
  })
})
