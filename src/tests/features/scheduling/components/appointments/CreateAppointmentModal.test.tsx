import { fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'
import { CreateAppointmentModal } from '@/features/scheduling/components/appointments/CreateAppointmentModal'
import type { ProfileListItem } from '@/features/scheduling/types/profile.types'

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockCreateAppointment = vi.fn()
const mockGetAvailableSlots = vi.fn()
const mockListAvailability = vi.fn()
const mockListAvailabilityExceptions = vi.fn()

vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  createAppointment: (...args: unknown[]) => mockCreateAppointment(...args),
  getAvailableSlots: (...args: unknown[]) => mockGetAvailableSlots(...args),
  listAvailability: (...args: unknown[]) => mockListAvailability(...args),
  listAvailabilityExceptions: (...args: unknown[]) => mockListAvailabilityExceptions(...args),
}))

const mockGetProfile = vi.fn()
const mockListProfiles = vi.fn()

vi.mock('@/features/scheduling/services/profiles.service', () => ({
  getProfile: (...args: unknown[]) => mockGetProfile(...args),
  listProfiles: (...args: unknown[]) => mockListProfiles(...args),
}))

const mockUpsertPatientAvatar = vi.fn()

vi.mock('@/features/patients/services/patients.service', () => ({
  getPatientAvatar: vi.fn().mockResolvedValue({ avatarUrl: null }),
  upsertPatientAvatar: (...args: unknown[]) => mockUpsertPatientAvatar(...args),
  listPatients: vi.fn(),
  getPatientHistory: vi.fn(),
}))

const mockCompressAvatar = vi.fn()

vi.mock('@/lib/compress-avatar', () => ({
  compressAvatar: (...args: unknown[]) => mockCompressAvatar(...args),
  ALLOWED_AVATAR_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_AVATAR_INPUT_BYTES: 5 * 1024 * 1024,
  MAX_AVATAR_DIMENSION: 512,
  JPEG_QUALITY: 0.82,
}))

const mockShowAlert = vi.fn()

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

// Stub phone validation so tests don't need perfectly formatted numbers
vi.mock('@/lib/field-formatters', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/field-formatters')>()
  return { ...mod, isValidWhatsappPhoneBR: () => true }
})

// Replace the calendar-popover DatePickerInput with a plain input so tests
// can set the date with a simple fireEvent.change.
vi.mock('@/components/common/DatePickerInput', () => ({
  DatePickerInput: ({
    id,
    onValueChange,
    disabled,
  }: {
    id?: string
    onValueChange?: (v: string) => void
    disabled?: boolean
  }) => (
    <input
      id={id}
      data-testid="date-picker-input"
      disabled={disabled ?? false}
      onChange={(e) => onValueChange?.(e.target.value)}
    />
  ),
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FIXED_PROFILE: ProfileListItem = {
  id: 'prof-1',
  clinicId: 'clinic-1',
  userId: null,
  slug: 'dr-silva',
  displayName: 'Dr. Silva',
  avatarUrl: null,
  isPublished: true,
  viewsCount: 0,
  city: null,
  state: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const MOCK_APPOINTMENT = {
  id: 'appt-1',
  patientName: 'Maria Silva',
  patientEmail: null,
  patientPhone: '11999999999',
  status: 'PENDING',
  appointmentDate: '2030-12-31',
  startTime: '10:00:00',
  endTime: '10:30:00',
}

const MOCK_SLOT = { time: '10:00', available: true, durationMinutes: 30 }

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockCompressAvatar.mockResolvedValue('base64mock')
  mockCreateAppointment.mockResolvedValue(MOCK_APPOINTMENT)
  mockUpsertPatientAvatar.mockResolvedValue(undefined)
  mockGetAvailableSlots.mockResolvedValue([MOCK_SLOT])
  mockListAvailability.mockResolvedValue([])
  mockListAvailabilityExceptions.mockResolvedValue([])
  mockGetProfile.mockResolvedValue({ id: 'prof-1', services: [] })
  mockListProfiles.mockResolvedValue([FIXED_PROFILE])
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderModal(overrides: { onCreated?: () => void; onClose?: () => void } = {}) {
  const onCreated = overrides.onCreated ?? vi.fn()
  const onClose = overrides.onClose ?? vi.fn()
  render(
    <CreateAppointmentModal
      open={true}
      fixedProfile={FIXED_PROFILE}
      onCreated={onCreated}
      onClose={onClose}
    />,
  )
  return { onCreated, onClose }
}

// Fills all required fields and returns after slots have loaded.
async function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/Nome do paciente/i), {
    target: { value: 'Maria Silva' },
  })
  fireEvent.change(screen.getByLabelText(/Telefone/i), {
    target: { value: '11999999999' },
  })
  // Mocked DatePickerInput calls onValueChange directly with the typed ISO value.
  fireEvent.change(screen.getByTestId('date-picker-input'), {
    target: { value: '2030-12-31' },
  })
  // Wait for getAvailableSlots to resolve and the slot button to appear.
  await waitFor(() => screen.getByRole('button', { name: '10:00' }))
  fireEvent.click(screen.getByRole('button', { name: '10:00' }))
}

// The submit button lives in the footer with form="create-appointment-form",
// not inside the <form> element, so we target the form by ID directly.
function submitForm() {
  const form = document.getElementById('create-appointment-form')
  if (!form) throw new Error('create-appointment-form not found in DOM')
  fireEvent.submit(form)
}

// Simulates selecting an image file through the hidden avatar file input.
async function selectAvatarFile(mimeType = 'image/jpeg') {
  const fileInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement
  const file = new File(['img-data'], 'photo.jpg', { type: mimeType })
  fireEvent.change(fileInput, { target: { files: [file] } })
  // Wait for compressAvatar (async) to resolve and state to update.
  await waitFor(() => screen.getByRole('button', { name: /Remover foto/i }))
}

// ── Photo upload section — UI rendering ───────────────────────────────────────

describe('patient photo section', () => {
  it('renders the "Enviar foto" button inside the form', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /Adicionar foto/i })).toBeInTheDocument()
  })

  it('shows the optional hint text', () => {
    renderModal()
    expect(screen.getByText(/JPEG, PNG ou WebP/i)).toBeInTheDocument()
  })

  it('does not show "Remover foto" before a photo is selected', () => {
    renderModal()
    expect(screen.queryByRole('button', { name: /Remover foto/i })).not.toBeInTheDocument()
  })
})

// ── File selection ─────────────────────────────────────────────────────────────

describe('file selection', () => {
  it('calls compressAvatar when a valid file is selected', async () => {
    renderModal()
    await selectAvatarFile()
    expect(mockCompressAvatar).toHaveBeenCalledOnce()
  })

  it('shows "Remover foto" after a valid file is selected', async () => {
    renderModal()
    await selectAvatarFile()
    expect(screen.getByRole('button', { name: /Remover foto/i })).toBeInTheDocument()
  })

  it('changes upload button label from "Adicionar" to "Alterar" after selection', async () => {
    renderModal()
    await selectAvatarFile()
    // Widget switches aria-label from "Adicionar foto" to "Alterar foto" once photo is set
    expect(screen.getByRole('button', { name: /Alterar foto do paciente/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Adicionar foto do paciente/i })).not.toBeInTheDocument()
  })

  it('shows the confirmation hint text after selection', async () => {
    renderModal()
    await selectAvatarFile()
    expect(screen.getByText(/será vinculada ao paciente após criar/i)).toBeInTheDocument()
  })

  it('shows an error alert and no preview when an invalid MIME type is selected', async () => {
    renderModal()
    const fileInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement
    const file = new File(['data'], 'video.mp4', { type: 'video/mp4' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    await waitFor(() => {
      // onError passes message to showAlert with title 'Foto inválida'
      expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ title: 'Foto inválida' }))
    })
    expect(screen.queryByRole('button', { name: /Remover foto/i })).not.toBeInTheDocument()
  })

  it('shows an error alert when compressAvatar throws', async () => {
    mockCompressAvatar.mockRejectedValueOnce(new Error('canvas fail'))
    renderModal()
    const fileInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    await waitFor(() => {
      // onError passes message to showAlert with title 'Foto inválida'
      expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ title: 'Foto inválida' }))
    })
    expect(screen.queryByRole('button', { name: /Remover foto/i })).not.toBeInTheDocument()
  })
})

// ── Photo removal ─────────────────────────────────────────────────────────────

describe('photo removal', () => {
  it('hides "Remover foto" after clicking it', async () => {
    const user = userEvent.setup()
    renderModal()
    await selectAvatarFile()
    await user.click(screen.getByRole('button', { name: /Remover foto/i }))
    expect(screen.queryByRole('button', { name: /Remover foto/i })).not.toBeInTheDocument()
  })

  it('resets label back to "Enviar foto" after removing', async () => {
    const user = userEvent.setup()
    renderModal()
    await selectAvatarFile()
    await user.click(screen.getByRole('button', { name: /Remover foto/i }))
    expect(screen.getByRole('button', { name: /Adicionar foto/i })).toBeInTheDocument()
  })
})

// ── Form submission — avatar upload ───────────────────────────────────────────

describe('avatar upload on appointment creation', () => {
  it('calls upsertPatientAvatar with patientName as identifier when no email is given', async () => {
    renderModal()
    await selectAvatarFile()
    await fillRequiredFields()
    submitForm()
    await waitFor(() => {
      expect(mockUpsertPatientAvatar).toHaveBeenCalledWith('Maria Silva', 'base64mock')
    })
  })

  it('calls upsertPatientAvatar with email as identifier when email is provided', async () => {
    renderModal()
    await selectAvatarFile()
    fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'maria@example.com' } })
    await fillRequiredFields()
    submitForm()
    await waitFor(() => {
      expect(mockUpsertPatientAvatar).toHaveBeenCalledWith('maria@example.com', 'base64mock')
    })
  })

  it('does NOT call upsertPatientAvatar when no photo is selected', async () => {
    renderModal()
    await fillRequiredFields()
    submitForm()
    await waitFor(() => expect(mockCreateAppointment).toHaveBeenCalledOnce())
    // Give the async path time to settle
    await new Promise((r) => setTimeout(r, 50))
    expect(mockUpsertPatientAvatar).not.toHaveBeenCalled()
  })

  it('still calls onCreated when upsertPatientAvatar fails', async () => {
    mockUpsertPatientAvatar.mockRejectedValueOnce(new Error('network'))
    const { onCreated } = renderModal()
    await selectAvatarFile()
    await fillRequiredFields()
    submitForm()
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(MOCK_APPOINTMENT))
  })

  it('shows a warning alert when upsertPatientAvatar fails', async () => {
    mockUpsertPatientAvatar.mockRejectedValueOnce(new Error('network'))
    renderModal()
    await selectAvatarFile()
    await fillRequiredFields()
    submitForm()
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Atenção', tone: 'warning' }),
      )
    })
  })

  it('shows success alert and calls onCreated even when avatar upload fails', async () => {
    mockUpsertPatientAvatar.mockRejectedValueOnce(new Error('net'))
    const { onCreated } = renderModal()
    await selectAvatarFile()
    await fillRequiredFields()
    submitForm()
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Agendamento criado', tone: 'success' }),
      )
    })
    expect(onCreated).toHaveBeenCalledOnce()
  })
})
