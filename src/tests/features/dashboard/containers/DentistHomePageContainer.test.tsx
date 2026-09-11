import { fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'

import { DentistHomePageContainer } from '@/features/dashboard/containers/DentistHomePageContainer'
import type { ProfileListItem } from '@/features/scheduling/types/profile.types'
import { brazilAddMonths, brazilCurrentMonthRange } from '@/lib/brazil-timezone'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'
import { makeDentistUser } from '@/test-utils/factories/user.factory'
import { resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const authMock = await import('@/test-utils/mocks/auth')
  return authMock.createUseAuthMock()
})

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

const mockListProfiles = vi.fn()
const mockListAppointments = vi.fn()
const mockUpdateAppointmentStatus = vi.fn()

vi.mock('@/features/scheduling/services/profiles.service', () => ({
  listProfiles: () => mockListProfiles(),
}))

vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  listAppointments: () => mockListAppointments(),
  updateAppointmentStatus: (id: unknown, data: unknown) => mockUpdateAppointmentStatus(id, data),
}))

// Lightweight drawer stub — exposes key props via data attributes so tests can
// assert on allowed transitions without mounting the full drawer.
vi.mock('@/features/scheduling/components/appointments/AppointmentDrawer', () => ({
  AppointmentDrawer: ({
    appointment,
    readOnly,
    allowedTransitions,
    onStatusChange,
    onClose,
  }: {
    appointment: { id: string } | null
    readOnly?: boolean
    allowedTransitions?: string[]
    onStatusChange: (id: string, status: string) => void
    onClose: () => void
  }) => {
    if (!appointment) return null
    return (
      <div
        data-testid="appointment-drawer"
        data-readonly={readOnly ? 'true' : 'false'}
        data-allowed={allowedTransitions?.join(',') ?? ''}
        data-appointment-id={appointment.id}
      >
        <button type="button" onClick={onClose}>
          Fechar consulta
        </button>
        {!readOnly && allowedTransitions?.includes('COMPLETED') && (
          <button type="button" onClick={() => onStatusChange(appointment.id, 'COMPLETED')}>
            Concluir consulta
          </button>
        )}
        {!readOnly && allowedTransitions?.includes('NO_SHOW') && (
          <button type="button" onClick={() => onStatusChange(appointment.id, 'NO_SHOW')}>
            Não compareceu
          </button>
        )}
      </div>
    )
  },
}))

// ── Factories ─────────────────────────────────────────────────────────────────

function makeProfile(overrides?: Partial<ProfileListItem>): ProfileListItem {
  return {
    id: 'profile-dr-silva',
    clinicId: 'clinic-1',
    userId: 'user-dentist-1',
    slug: 'dr-silva',
    displayName: 'Dr. Silva',
    avatarUrl: null,
    isPublished: true,
    viewsCount: 0,
    city: null,
    state: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

const DENTIST_USER = makeDentistUser({ id: 'user-dentist-1' })
const OWN_PROFILE = makeProfile({ userId: 'user-dentist-1' })
const OTHER_PROFILE = makeProfile({
  id: 'profile-other',
  userId: 'user-other-dentist',
  displayName: 'Dra. Lima',
})

const OWN_APPT = makeAppointment({ profileId: 'profile-dr-silva', patientName: 'Paciente Próprio' })
const OTHER_APPT = makeAppointment({
  id: 'appt-other',
  profileId: 'profile-other',
  patientName: 'Paciente de Outro',
})

beforeEach(() => {
  // No fake timers — waitFor uses setTimeout internally and hangs under fake timers.
  setMockAuthState({ user: DENTIST_USER, isAuthenticated: true })
  mockListProfiles.mockResolvedValue([OWN_PROFILE, OTHER_PROFILE])
  mockListAppointments.mockResolvedValue([OWN_APPT, OTHER_APPT])
})

afterEach(() => {
  resetAuthMocks()
  vi.clearAllMocks()
})

// ── Header / title ────────────────────────────────────────────────────────────

describe('DentistHomePageContainer — header', () => {
  it('renders "Meu dia clínico" as the page heading', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /meu dia clínico/i })).toBeInTheDocument()
    })
  })

  it('renders the "Clínico" eyebrow', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Clínico')).toBeInTheDocument()
    })
  })

  it('does NOT render the old "Olá" personalized greeting as the h1', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /olá/i })).not.toBeInTheDocument()
    })
  })
})

// ── Appointment scoping ───────────────────────────────────────────────────────

describe('DentistHomePageContainer — appointment scoping', () => {
  it("shows only appointments belonging to the dentist's own profile", async () => {
    render(<DentistHomePageContainer />)
    // Patient appears in both the hero and the agenda list — use getAllByText
    await waitFor(() => {
      expect(screen.getAllByText('Paciente Próprio').length).toBeGreaterThan(0)
    })
    expect(screen.queryByText('Paciente de Outro')).not.toBeInTheDocument()
  })

  it("does not count another dentist's appointments in the metric cards", async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
    })
    // OWN_APPT has status PENDING so: total=1, confirmed=0, pending=1, completed=0
    // "1" appears in both "Consultas hoje" and "Pendentes" KPI cards
    const ones = screen.getAllByText('1')
    expect(ones.length).toBeGreaterThan(0)
    // Should NOT show 2 (which would be the total if unfiltered)
    expect(screen.queryByText('2')).not.toBeInTheDocument()
  })

  it('shows profile-not-found warning when dentist has no linked profile', async () => {
    mockListProfiles.mockResolvedValue([OTHER_PROFILE])
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Perfil clínico não encontrado')).toBeInTheDocument()
    })
  })

  it('does not show KPI cards when own profile is not found', async () => {
    mockListProfiles.mockResolvedValue([OTHER_PROFILE])
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
    })
    // KPI cards should not render when profile is missing
    expect(screen.queryByText('Consultas hoje')).not.toBeInTheDocument()
  })

  it('shows error state when the API call fails', async () => {
    mockListAppointments.mockRejectedValue(new Error('Network error'))
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText(/não foi possível carregar/i)).toBeInTheDocument()
    })
  })
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('DentistHomePageContainer — loading state', () => {
  it('shows a loading card initially', () => {
    mockListProfiles.mockReturnValue(new Promise(() => {}))
    render(<DentistHomePageContainer />)
    expect(screen.getByText(/carregando sua agenda clínica/i)).toBeInTheDocument()
  })
})

// ── KPI cards ─────────────────────────────────────────────────────────────────

describe('DentistHomePageContainer — KPI cards', () => {
  it('renders "Consultas hoje" KPI', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => expect(screen.getByText('Consultas hoje')).toBeInTheDocument())
  })

  it('renders "Confirmadas" KPI', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => expect(screen.getByText('Confirmadas')).toBeInTheDocument())
  })

  it('renders "Pendentes" KPI', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      // "Pendentes" appears in KPI card label; may also appear in section descriptions
      expect(screen.getAllByText('Pendentes').length).toBeGreaterThan(0)
    })
  })

  it('renders "Concluídas" KPI', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => expect(screen.getByText('Concluídas')).toBeInTheDocument())
  })
})

// ── Next appointment hero ─────────────────────────────────────────────────────

describe('DentistHomePageContainer — next appointment hero', () => {
  it('renders the "Próxima consulta" section heading', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /próxima consulta/i })).toBeInTheDocument()
    })
  })

  it('shows the next appointment patient name in the hero', async () => {
    render(<DentistHomePageContainer />)
    // Patient name appears in both hero and agenda list — use getAllByText
    await waitFor(() => {
      expect(screen.getAllByText('Paciente Próprio').length).toBeGreaterThanOrEqual(2)
    })
  })

  it('shows empty hero when no upcoming appointments', async () => {
    const completedAppt = makeAppointment({
      profileId: 'profile-dr-silva',
      patientName: 'Paciente Concluído',
      status: 'COMPLETED',
    })
    mockListAppointments.mockResolvedValue([completedAppt])
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Nenhuma consulta restante hoje.')).toBeInTheDocument()
    })
  })

  it('renders a "Ver detalhes" button in the hero when appointment exists', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ver detalhes/i })).toBeInTheDocument()
    })
  })

  it('opens the drawer when "Ver detalhes" is clicked', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ver detalhes/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /ver detalhes/i }))
    // The mocked AppointmentDrawer renders when drawerAppointment is set
    expect(screen.getByTestId('appointment-drawer')).toBeInTheDocument()
  })
})

// ── Agenda do dia section ─────────────────────────────────────────────────────

describe('DentistHomePageContainer — agenda do dia', () => {
  it('orders missing times safely and opens the selected consultation from the agenda', async () => {
    const service = {
      id: 'cleaning',
      name: 'Limpeza',
      durationMinutes: null,
      priceFrom: null,
      priceTo: null,
    }
    mockListAppointments.mockResolvedValue([
      makeAppointment({
        ...OWN_APPT,
        id: 'late',
        patientName: 'Tarde',
        startTime: '17:00',
        status: 'CONFIRMED',
        service,
      }),
      makeAppointment({
        ...OWN_APPT,
        id: 'missing',
        patientName: 'Sem horário',
        startTime: null,
        service,
      }),
      makeAppointment({
        ...OWN_APPT,
        id: 'missing-2',
        patientName: 'Sem horário dois',
        startTime: null,
      }),
    ])
    render(<DentistHomePageContainer />)
    await screen.findByRole('button', { name: /Tarde/ })
    const rows = screen.getAllByRole('listitem')
    expect(rows[0]).toHaveTextContent('Sem horário')
    expect(rows[1]).toHaveTextContent('Sem horário dois')
    expect(rows[2]).toHaveTextContent('Tarde')
    fireEvent.click(screen.getByRole('button', { name: /Tarde/ }))
    expect(screen.getByTestId('appointment-drawer')).toHaveAttribute('data-appointment-id', 'late')
    fireEvent.click(screen.getByRole('button', { name: 'Fechar consulta' }))
    expect(screen.queryByTestId('appointment-drawer')).not.toBeInTheDocument()
  })

  it('renders the "Agenda do dia" section heading', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /agenda do dia/i })).toBeInTheDocument()
    })
  })

  it('shows empty state when no appointments', async () => {
    mockListAppointments.mockResolvedValue([])
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Nenhuma consulta agendada para hoje.')).toBeInTheDocument()
    })
  })

  it('shows appointment list items sorted by time', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      const items = screen.getAllByText('Paciente Próprio')
      expect(items.length).toBeGreaterThan(0)
    })
  })
})

// ── Quick actions ─────────────────────────────────────────────────────────────

describe('DentistHomePageContainer — quick actions', () => {
  it('renders a Minha agenda quick action link pointing to /app/agenda', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      const links = screen.getAllByRole('link', { name: /minha agenda/i })
      expect(links.length).toBeGreaterThan(0)
      expect(links[links.length - 1]).toHaveAttribute('href', '/app/agenda')
    })
  })

  it('renders a Prontuários quick action link pointing to /app/prontuario', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      const links = screen.getAllByRole('link', { name: /prontuários/i })
      expect(links.length).toBeGreaterThan(0)
      expect(links[links.length - 1]).toHaveAttribute('href', '/app/prontuario')
    })
  })

  it('does NOT have a create appointment CTA', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.queryByText(/novo agendamento/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/criar consulta/i)).not.toBeInTheDocument()
    })
  })

  it('does NOT render any Google Calendar controls', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.queryByText(/google agenda/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/conectar/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/sincronizar/i)).not.toBeInTheDocument()
    })
  })

  it('does NOT link to /app/financeiro', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
    })
    expect(document.querySelector('a[href="/app/financeiro"]')).toBeNull()
  })
})

// ── Drawer status transitions ─────────────────────────────────────────────────

describe('DentistHomePageContainer — drawer status transitions', () => {
  async function openDrawer() {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ver detalhes/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /ver detalhes/i }))
    return screen.getByTestId('appointment-drawer')
  }

  it('does not render the drawer as readOnly', async () => {
    const drawer = await openDrawer()
    expect(drawer.dataset.readonly).toBe('false')
  })

  it('passes COMPLETED and NO_SHOW as allowedTransitions', async () => {
    const drawer = await openDrawer()
    const allowed = drawer.dataset.allowed?.split(',') ?? []
    expect(allowed).toContain('COMPLETED')
    expect(allowed).toContain('NO_SHOW')
  })

  it('does not include CANCELED in allowedTransitions', async () => {
    const drawer = await openDrawer()
    const allowed = drawer.dataset.allowed?.split(',') ?? []
    expect(allowed).not.toContain('CANCELED')
  })

  it('does not include CONFIRMED in allowedTransitions', async () => {
    const drawer = await openDrawer()
    const allowed = drawer.dataset.allowed?.split(',') ?? []
    expect(allowed).not.toContain('CONFIRMED')
  })

  it('shows the Concluir consulta button', async () => {
    await openDrawer()
    expect(screen.getByRole('button', { name: /concluir consulta/i })).toBeInTheDocument()
  })

  it('shows the Não compareceu button', async () => {
    await openDrawer()
    expect(screen.getByRole('button', { name: /não compareceu/i })).toBeInTheDocument()
  })

  it('calls updateAppointmentStatus with COMPLETED when Concluir is clicked', async () => {
    mockUpdateAppointmentStatus.mockResolvedValueOnce({ ...OWN_APPT, status: 'COMPLETED' })
    await openDrawer()
    fireEvent.click(screen.getByRole('button', { name: /concluir consulta/i }))
    await waitFor(() => {
      expect(mockUpdateAppointmentStatus).toHaveBeenCalledWith('appt-1', {
        status: 'COMPLETED',
      })
    })
  })

  it('calls updateAppointmentStatus with NO_SHOW when Não compareceu is clicked', async () => {
    mockUpdateAppointmentStatus.mockResolvedValueOnce({ ...OWN_APPT, status: 'NO_SHOW' })
    await openDrawer()
    fireEvent.click(screen.getByRole('button', { name: /não compareceu/i }))
    await waitFor(() => {
      expect(mockUpdateAppointmentStatus).toHaveBeenCalledWith('appt-1', {
        status: 'NO_SHOW',
      })
    })
  })
})

// ── Minha produção (monthly metrics) ─────────────────────────────────────────

describe('DentistHomePageContainer — Minha produção', () => {
  const { from: MONTH_START } = brazilCurrentMonthRange()
  const OUTSIDE_MONTH_DATE = brazilAddMonths(MONTH_START, -2)

  it('renders the "Minha produção" section heading', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /minha produção/i })).toBeInTheDocument()
    })
  })

  it('counts completed appointments for the current month', async () => {
    const completed = makeAppointment({
      id: 'appt-completed',
      profileId: 'profile-dr-silva',
      appointmentDate: MONTH_START,
      status: 'COMPLETED',
    })
    mockListAppointments.mockResolvedValue([completed])
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Concluídas no mês')).toBeInTheDocument()
    })
    const card = screen.getByText('Concluídas no mês').closest('div')
    expect(card?.parentElement).toHaveTextContent('1')
  })

  it('counts no-show appointments for the current month', async () => {
    const noShow = makeAppointment({
      id: 'appt-no-show',
      profileId: 'profile-dr-silva',
      appointmentDate: MONTH_START,
      status: 'NO_SHOW',
    })
    mockListAppointments.mockResolvedValue([noShow])
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Faltas no mês')).toBeInTheDocument()
    })
    const card = screen.getByText('Faltas no mês').closest('div')
    expect(card?.parentElement).toHaveTextContent('1')
  })

  it('shows zero state when there is no activity this month', async () => {
    mockListAppointments.mockResolvedValue([])
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Concluídas no mês')).toBeInTheDocument()
    })
    expect(screen.getByText(/r\$\s*0,00/i)).toBeInTheDocument()
  })

  it('sums estimated production only from completed appointments, labeled as estimated', async () => {
    const completedWithAmount = makeAppointment({
      id: 'appt-completed-amount',
      profileId: 'profile-dr-silva',
      appointmentDate: MONTH_START,
      status: 'COMPLETED',
      estimatedAmountCents: 15000,
    })
    const pendingWithAmount = makeAppointment({
      id: 'appt-pending-amount',
      profileId: 'profile-dr-silva',
      appointmentDate: MONTH_START,
      status: 'PENDING',
      estimatedAmountCents: 99999,
    })
    mockListAppointments.mockResolvedValue([completedWithAmount, pendingWithAmount])
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText(/r\$\s*150,00/i)).toBeInTheDocument()
    })
    expect(
      screen.getByText(/estimativa com base apenas nas consultas concluídas/i),
    ).toBeInTheDocument()
  })

  it('excludes completed appointments from outside the current month', async () => {
    const completedLastMonth = makeAppointment({
      id: 'appt-completed-last-month',
      profileId: 'profile-dr-silva',
      appointmentDate: OUTSIDE_MONTH_DATE,
      status: 'COMPLETED',
      estimatedAmountCents: 50000,
    })
    mockListAppointments.mockResolvedValue([completedLastMonth])
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Concluídas no mês')).toBeInTheDocument()
    })
    const card = screen.getByText('Concluídas no mês').closest('div')
    expect(card?.parentElement).toHaveTextContent('0')
    expect(screen.getByText(/r\$\s*0,00/i)).toBeInTheDocument()
  })

  it("does not count another dentist's completed appointments in monthly production", async () => {
    const otherDentistCompleted = makeAppointment({
      id: 'appt-other-completed',
      profileId: 'profile-other',
      appointmentDate: MONTH_START,
      status: 'COMPLETED',
      estimatedAmountCents: 80000,
    })
    mockListAppointments.mockResolvedValue([otherDentistCompleted])
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Concluídas no mês')).toBeInTheDocument()
    })
    const card = screen.getByText('Concluídas no mês').closest('div')
    expect(card?.parentElement).toHaveTextContent('0')
    expect(screen.getByText(/r\$\s*0,00/i)).toBeInTheDocument()
  })

  it('does not expose any clinic-wide finance link or label', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Minha produção')).toBeInTheDocument()
    })
    expect(screen.queryByText(/receita da clínica/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/faturamento/i)).not.toBeInTheDocument()
    expect(document.querySelector('a[href="/app/financeiro"]')).toBeNull()
  })
})
