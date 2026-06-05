import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { render, screen, userEvent, waitFor } from '@/test-utils/render-utils'

import { TeamMemberProfileContainer } from '@/features/team/containers/TeamMemberProfileContainer'
import type { AuthUser } from '@/features/auth/types'
import type { MemberListItem, ProfileDetail, ServiceItem } from '@/features/team/types/team.types'
import type { Availability } from '@/features/scheduling/types/scheduling.types'
import { makeDentistUser, makeOwnerUser } from '@/test-utils/factories/user.factory'
import { ApiError } from '@/services/http'

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

function makeService(overrides: Partial<ServiceItem> = {}): ServiceItem {
  return {
    id: 'service-1',
    profileId: 'profile-1',
    clinicId: 'clinic-1',
    name: 'Limpeza',
    description: null,
    priceFrom: null,
    priceTo: null,
    durationMinutes: 60,
    isPriceDisplayed: true,
    isActive: true,
    displayOrder: 1,
    estimatedDirectCostCents: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeAvailability(overrides: Partial<Availability> = {}): Availability {
  return {
    id: 'availability-1',
    profileId: 'profile-1',
    clinicId: 'clinic-1',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '12:00',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function setupProfile(
  profile: ProfileDetail,
  options: {
    availability?: Availability[]
  } = {},
) {
  mockGetClinicProfile.mockResolvedValue(profile)
  mockListClinicMembers.mockResolvedValue({ members: [makeMember()] })
  mockListAvailability.mockResolvedValue(options.availability ?? [])
  mockListAvailabilityExceptions.mockResolvedValue([])
}

beforeEach(() => {
  mockUser = makeOwnerUser()
  vi.clearAllMocks()
})

describe('TeamMemberProfileContainer publish controls', () => {
  it('renders the premium profile header with title, eyebrow, avatar, and badges', async () => {
    setupProfile(makeProfile({ isPublished: false }))

    render(<TeamMemberProfileContainer profileId="profile-1" />)

    expect(await screen.findByText('Perfil profissional')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /dra\. ana silva/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /ana silva/i })).toBeInTheDocument()
    expect(screen.getByText('Profissional')).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getAllByText('ana@clinica.com').length).toBeGreaterThan(0)
  })

  it('shows Publicar perfil for OWNER when profile is unpublished', async () => {
    setupProfile(makeProfile({ isPublished: false }))

    render(<TeamMemberProfileContainer profileId="profile-1" />)

    expect(await screen.findByRole('button', { name: /publicar perfil/i })).toBeInTheDocument()
    expect(screen.getAllByText('Não publicado').length).toBeGreaterThan(0)
  })

  it('shows Despublicar perfil for OWNER when profile is published', async () => {
    setupProfile(makeProfile({ isPublished: true }))

    render(<TeamMemberProfileContainer profileId="profile-1" />)

    expect(await screen.findByRole('button', { name: /despublicar perfil/i })).toBeInTheDocument()
    expect(screen.getAllByText('Publicado').length).toBeGreaterThan(0)
  })

  it('does not show publish controls for DENTIST', async () => {
    mockUser = makeDentistUser({ id: 'user-dentist-1' })
    setupProfile(makeProfile({ isPublished: false, userId: 'user-dentist-1' }))

    render(<TeamMemberProfileContainer profileId="profile-1" />)

    await screen.findByRole('heading', { name: /dra\. ana silva/i })
    expect(screen.queryByRole('button', { name: /publicar perfil/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /despublicar perfil/i })).toBeNull()
  })

  it('renders KPI cards from already loaded profile data', async () => {
    setupProfile(
      makeProfile({
        isPublished: true,
        profileSpecialties: [
          { specialty: { id: 'spec-1', name: 'Ortodontia', slug: 'ortodontia' } },
          { specialty: { id: 'spec-2', name: 'Endodontia', slug: 'endodontia' } },
        ],
        services: [
          makeService({ id: 'service-1', isActive: true }),
          makeService({ id: 'service-2', isActive: false }),
        ],
      }),
      {
        availability: [
          makeAvailability({ id: 'slot-1', dayOfWeek: 1, isActive: true }),
          makeAvailability({ id: 'slot-2', dayOfWeek: 3, isActive: true }),
          makeAvailability({ id: 'slot-3', dayOfWeek: 3, isActive: true }),
          makeAvailability({ id: 'slot-4', dayOfWeek: 5, isActive: false }),
        ],
      },
    )

    render(<TeamMemberProfileContainer profileId="profile-1" />)

    expect(await screen.findByText('Serviços ativos')).toBeInTheDocument()
    expect(screen.getAllByText('Especialidades').length).toBeGreaterThan(0)
    expect(screen.getByText('Disponibilidade')).toBeInTheDocument()
    expect(screen.getByText('Publicação')).toBeInTheDocument()
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Publicado').length).toBeGreaterThan(0)
  })

  it('renders basic info, availability, exception, and services sections', async () => {
    setupProfile(
      makeProfile({
        crmNumber: '12345',
        crmState: 'DF',
        phone: '(61) 3333-0000',
        bio: 'Especialista em reabilitação oral.',
        profileSpecialties: [
          { specialty: { id: 'spec-1', name: 'Ortodontia', slug: 'ortodontia' } },
        ],
      }),
    )

    render(<TeamMemberProfileContainer profileId="profile-1" />)

    expect(await screen.findByRole('heading', { name: /informações do profissional/i })).toBeInTheDocument()
    expect(screen.getByText('Nome profissional')).toBeInTheDocument()
    expect(screen.getByText('CRO')).toBeInTheDocument()
    expect(screen.getByText('12345 - DF')).toBeInTheDocument()
    expect(screen.getByText('Especialista em reabilitação oral.')).toBeInTheDocument()
    expect(screen.getByText('Ortodontia')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /disponibilidade semanal/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /exceções e bloqueios/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /serviços e procedimentos/i })).toBeInTheDocument()
    expect(screen.getByTestId('availability-manager')).toBeInTheDocument()
    expect(screen.getByTestId('exception-manager')).toBeInTheDocument()
    expect(screen.getByTestId('services-panel')).toBeInTheDocument()
  })

  it('does not introduce a public profile link', async () => {
    setupProfile(makeProfile({ isPublished: true }))

    render(<TeamMemberProfileContainer profileId="profile-1" />)

    await screen.findByRole('heading', { name: /dra\. ana silva/i })
    expect(screen.queryByRole('link', { name: /perfil público/i })).toBeNull()
    expect(document.querySelector('a[href*="/profiles/p/"]')).toBeNull()
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
    await waitFor(() => {
      expect(screen.getAllByText('Publicado').length).toBeGreaterThan(0)
    })
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
    expect(screen.getAllByText('Não publicado').length).toBeGreaterThan(0)
  })

  it('renders forbidden, not found, and error states', async () => {
    mockGetClinicProfile.mockRejectedValueOnce(new ApiError('Forbidden', 403, null))
    mockListAvailability.mockResolvedValue([])
    mockListAvailabilityExceptions.mockResolvedValue([])
    const { unmount } = render(<TeamMemberProfileContainer profileId="profile-1" />)

    expect(await screen.findByText('Acesso não autorizado')).toBeInTheDocument()
    unmount()

    mockGetClinicProfile.mockRejectedValueOnce(new ApiError('Not found', 404, null))
    render(<TeamMemberProfileContainer profileId="profile-1" />)
    expect(await screen.findByText('Profissional não encontrado.')).toBeInTheDocument()
  })

  it('renders generic error state with retry action', async () => {
    mockGetClinicProfile.mockRejectedValue(new Error('Network error'))
    mockListAvailability.mockResolvedValue([])
    mockListAvailabilityExceptions.mockResolvedValue([])

    render(<TeamMemberProfileContainer profileId="profile-1" />)

    expect(
      await screen.findByText('Não foi possível carregar o perfil profissional.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument()
  })
})
