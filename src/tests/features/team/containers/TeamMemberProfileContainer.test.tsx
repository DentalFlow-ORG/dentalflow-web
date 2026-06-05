import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { render, screen, userEvent, waitFor } from '@/test-utils/render-utils'

import { TeamMemberProfileContainer } from '@/features/team/containers/TeamMemberProfileContainer'
import type { AuthUser } from '@/features/auth/types'
import type { MemberListItem, ProfileDetail } from '@/features/team/types/team.types'
import { makeDentistUser, makeOwnerUser } from '@/test-utils/factories/user.factory'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

let mockUser: AuthUser | null = makeOwnerUser()

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}))

const mockGetClinicProfile = vi.fn()
const mockListClinicMembers = vi.fn()
const mockToggleProfilePublishStatus = vi.fn()
const mockListAvailability = vi.fn()
const mockListAvailabilityExceptions = vi.fn()

vi.mock('@/features/team/services/team.service', () => ({
  getClinicProfile: (...args: unknown[]) => mockGetClinicProfile(...args),
  listClinicMembers: (...args: unknown[]) => mockListClinicMembers(...args),
  toggleProfilePublishStatus: (...args: unknown[]) =>
    mockToggleProfilePublishStatus(...args),
}))

vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  listAvailability: (...args: unknown[]) => mockListAvailability(...args),
  listAvailabilityExceptions: (...args: unknown[]) =>
    mockListAvailabilityExceptions(...args),
}))

vi.mock('@/features/scheduling/components/availability/AvailabilityManager', () => ({
  AvailabilityManager: () => <div data-testid="availability-manager" />,
}))

vi.mock('@/features/scheduling/components/availability/ExceptionManager', () => ({
  ExceptionManager: () => <div data-testid="exception-manager" />,
}))

vi.mock('@/features/team/components/ServicesPanel', () => ({
  ServicesPanel: () => <div data-testid="services-panel" />,
}))

function makeProfile(overrides: Partial<ProfileDetail> = {}): ProfileDetail {
  return {
    id: 'profile-1',
    userId: 'user-dentist-1',
    slug: 'dra-ana',
    displayName: 'Dra. Ana Silva',
    bio: null,
    crmNumber: null,
    crmState: null,
    phone: null,
    isPublished: false,
    profileSpecialties: [],
    services: [],
    ...overrides,
  }
}

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
    profile: {
      id: 'profile-1',
      userId: 'user-dentist-1',
      slug: 'dra-ana',
      displayName: 'Dra. Ana Silva',
      isPublished: false,
    },
    ...overrides,
  }
}

function setupProfile(profile: ProfileDetail) {
  mockGetClinicProfile.mockResolvedValue(profile)
  mockListClinicMembers.mockResolvedValue({ members: [makeMember()] })
  mockListAvailability.mockResolvedValue([])
  mockListAvailabilityExceptions.mockResolvedValue([])
}

beforeEach(() => {
  mockUser = makeOwnerUser()
  vi.clearAllMocks()
})

describe('TeamMemberProfileContainer publish controls', () => {
  it('shows Publicar perfil for OWNER when profile is unpublished', async () => {
    setupProfile(makeProfile({ isPublished: false }))

    render(<TeamMemberProfileContainer profileId="profile-1" />)

    expect(await screen.findByRole('button', { name: /publicar perfil/i })).toBeInTheDocument()
    expect(screen.getByText('Não publicado')).toBeInTheDocument()
  })

  it('shows Despublicar perfil for OWNER when profile is published', async () => {
    setupProfile(makeProfile({ isPublished: true }))

    render(<TeamMemberProfileContainer profileId="profile-1" />)

    expect(await screen.findByRole('button', { name: /despublicar perfil/i })).toBeInTheDocument()
    expect(screen.getByText('Publicado')).toBeInTheDocument()
  })

  it('does not show publish controls for DENTIST', async () => {
    mockUser = makeDentistUser({ id: 'user-dentist-1' })
    setupProfile(makeProfile({ isPublished: false, userId: 'user-dentist-1' }))

    render(<TeamMemberProfileContainer profileId="profile-1" />)

    await screen.findByRole('heading', { name: /test user/i })
    expect(screen.queryByRole('button', { name: /publicar perfil/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /despublicar perfil/i })).toBeNull()
  })

  it('publishes a profile and updates the badge immediately', async () => {
    const user = userEvent.setup()
    setupProfile(makeProfile({ isPublished: false }))
    mockToggleProfilePublishStatus.mockResolvedValue({
      id: 'profile-1',
      slug: 'dra-ana',
      isPublished: true,
    })

    render(<TeamMemberProfileContainer profileId="profile-1" />)

    await user.click(await screen.findByRole('button', { name: /publicar perfil/i }))

    await waitFor(() => {
      expect(mockToggleProfilePublishStatus).toHaveBeenCalledWith('profile-1')
    })
    expect(await screen.findByText('Publicado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /despublicar perfil/i })).toBeInTheDocument()
  })

  it('disables the publish button while the request is pending', async () => {
    const user = userEvent.setup()
    setupProfile(makeProfile({ isPublished: false }))
    let resolveToggle!: (value: { id: string; slug: string; isPublished: boolean }) => void
    mockToggleProfilePublishStatus.mockReturnValue(
      new Promise<{ id: string; slug: string; isPublished: boolean }>((resolve) => {
        resolveToggle = resolve
      }),
    )

    render(<TeamMemberProfileContainer profileId="profile-1" />)

    await user.click(await screen.findByRole('button', { name: /publicar perfil/i }))

    const pendingButton = screen.getByRole('button', { name: /atualizando/i })
    expect(pendingButton).toBeDisabled()

    resolveToggle({ id: 'profile-1', slug: 'dra-ana', isPublished: true })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /despublicar perfil/i })).toBeInTheDocument()
    })
  })

  it('shows an error when publish update fails', async () => {
    const user = userEvent.setup()
    setupProfile(makeProfile({ isPublished: false }))
    mockToggleProfilePublishStatus.mockRejectedValue(new Error('Falha ao publicar'))

    render(<TeamMemberProfileContainer profileId="profile-1" />)

    await user.click(await screen.findByRole('button', { name: /publicar perfil/i }))

    expect(await screen.findByText('Falha ao publicar')).toBeInTheDocument()
    expect(screen.getByText('Não publicado')).toBeInTheDocument()
  })
})
