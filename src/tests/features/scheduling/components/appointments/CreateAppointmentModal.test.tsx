import { CreateAppointmentModal } from '@/features/scheduling/components/appointments/CreateAppointmentModal'
import type { ProfileListItem } from '@/features/scheduling/types/profile.types'
import { act, fireEvent, render, screen, waitFor, within } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@/lib/brazil-timezone', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/brazil-timezone')>()
  return { ...mod, brazilTodayIso: () => '2020-01-01' }
})
vi.mock('@/features/scheduling/utils/appointment-form-utils', async (importOriginal) => {
  const mod =
    await importOriginal<typeof import('@/features/scheduling/utils/appointment-form-utils')>()
  return { ...mod, getCurrentTimeInputValue: () => '12:00' }
})

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

vi.mock('@/lib/compress-avatar', () => ({
  ALLOWED_AVATAR_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_AVATAR_INPUT_BYTES: 5 * 1024 * 1024,
  MAX_AVATAR_DIMENSION: 512,
  JPEG_QUALITY: 0.82,
}))

// Mock CameraPreviewModal to prevent webcam API calls in tests.
vi.mock('@/features/patients/components/CameraPreviewModal', () => ({
  CameraPreviewModal: () => null,
}))

// Mock the crop modal so tests can confirm crops without real canvas/image ops.
// The mock auto-exposes a "Salvar foto" button that confirms with 'base64mock'.
vi.mock('@/features/patients/components/AvatarCropModal', () => ({
  AvatarCropModal: ({
    open,
    onConfirm,
    onCancel,
  }: {
    open: boolean
    onConfirm: (base64: string) => void
    onCancel: () => void
    imageFile: File | null
    patientName?: string
    onError?: (m: string) => void
  }) =>
    open ? (
      <div data-testid="avatar-crop-modal">
        <button type="button" onClick={() => onConfirm('base64mock')}>
          Salvar foto
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    ) : null,
}))

const mockShowAlert = vi.fn()

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

// Replace the calendar-popover DatePickerInput with a plain input so tests
// can set the date with a simple fireEvent.change.
const calendarMode = vi.hoisted(() => ({ real: false }))
vi.mock('@/components/common/DatePickerInput', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/common/DatePickerInput')>()
  return {
    DatePickerInput: (props: Parameters<typeof actual.DatePickerInput>[0]) => {
      if (calendarMode.real) return <actual.DatePickerInput {...props} />
      const { id, disabled, onValueChange } = props
      return (
        <input
          id={id}
          data-testid="date-picker-input"
          disabled={disabled ?? false}
          onChange={(e) => onValueChange?.(e.target.value)}
        />
      )
    },
  }
})

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
  patientId: 'patient-created',
  patientName: 'Maria Silva',
  patientEmail: null,
  patientPhone: '11987654321',
  status: 'PENDING',
  appointmentDate: '2030-12-31',
  startTime: '10:00:00',
  endTime: '10:30:00',
}

const MOCK_SLOT = { time: '10:00', available: true, durationMinutes: 30 }

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  calendarMode.real = false
  vi.clearAllMocks()
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
    target: { value: '11987654321' },
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

describe('CreateAppointmentModal — calendar integration', () => {
  it('blocks unavailable dates and selects a working day through the real calendar', async () => {
    calendarMode.real = true
    const { onClose } = renderModal()
    await waitFor(() => expect(mockListAvailability).toHaveBeenCalled())
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Abrir calendário' }))
    expect(screen.getAllByRole('button', { name: '4' })[0]).toBeDisabled()
    await user.click(screen.getAllByRole('button', { name: '7' })[0])
    expect(screen.getByPlaceholderText('DD/MM/AAAA')).toHaveValue('07/01/2020')
    expect(await screen.findByRole('button', { name: '10:00' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('recovers from a non-Error persistence failure', async () => {
    mockCreateAppointment.mockRejectedValueOnce(null)
    const { onCreated } = renderModal()
    await fillRequiredFields()
    submitForm()
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenLastCalledWith(
        expect.objectContaining({ tone: 'error', description: undefined }),
      ),
    )
    expect(onCreated).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Criar agendamento/ })).toBeEnabled()
  })
})

// Simulates selecting an image file and confirming through the crop modal.
async function selectAvatarFile(mimeType = 'image/jpeg') {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  const file = new File(['img-data'], 'photo.jpg', { type: mimeType })
  fireEvent.change(fileInput, { target: { files: [file] } })
  // Crop modal appears — click Salvar foto to confirm
  await waitFor(() => screen.getByTestId('avatar-crop-modal'))
  fireEvent.click(screen.getByRole('button', { name: /Salvar foto/i }))
  // Wait for crop modal to close and widget to show "Alterar foto" (photo is set)
  await waitFor(() => screen.getByRole('button', { name: /Alterar foto do paciente/i }))
}

describe('CreateAppointmentModal — form lifecycle', () => {
  it('keeps the professional selector usable after a failed profile list request', async () => {
    mockListProfiles.mockRejectedValueOnce(new Error('offline'))
    render(<CreateAppointmentModal open onClose={vi.fn()} onCreated={vi.fn()} />)
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Profissional' })).toBeEnabled(),
    )
    expect(screen.getByText('Selecione um profissional para ver os horários')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar agendamento' })).toBeDisabled()
  })

  it('settles a failed service lookup without blocking manual appointment entry', async () => {
    mockGetProfile.mockRejectedValueOnce(new Error('offline'))
    renderModal()
    await fillRequiredFields()
    expect(screen.getByRole('combobox', { name: /Serviço/ })).toBeDisabled()
    fireEvent.change(screen.getByLabelText(/Observações/), { target: { value: '  Retorno  ' } })
    submitForm()
    await waitFor(() =>
      expect(mockCreateAppointment).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Retorno', serviceId: undefined }),
      ),
    )
  })

  it('handles a failed slot lookup and reloads slots for a different date', async () => {
    mockGetAvailableSlots.mockRejectedValueOnce(new Error('offline'))
    renderModal()
    fireEvent.change(screen.getByTestId('date-picker-input'), { target: { value: '2030-12-30' } })
    expect(await screen.findByText('Nenhum horário disponível para esta data.')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('date-picker-input'), { target: { value: '2030-12-31' } })
    expect(await screen.findByRole('button', { name: '10:00' })).toBeEnabled()
  })
  it('does not create an appointment for a whitespace-only patient name', async () => {
    renderModal()
    await fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/Nome do paciente/i), { target: { value: '   ' } })
    await userEvent.click(screen.getByRole('button', { name: 'Criar agendamento' }))
    expect(mockCreateAppointment).not.toHaveBeenCalled()
  })

  it.each(['11:00', '13:00'])(
    'validates a same-day slot at %s against the current time',
    async (time) => {
      renderModal()
      await fillRequiredFields()
      mockGetAvailableSlots.mockResolvedValue([{ ...MOCK_SLOT, time }])
      fireEvent.change(screen.getByTestId('date-picker-input'), { target: { value: '2020-01-01' } })
      await userEvent.click(await screen.findByRole('button', { name: time }))
      submitForm()
      if (time === '11:00') {
        expect(mockShowAlert).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'Horário inválido' }),
        )
        expect(mockCreateAppointment).not.toHaveBeenCalled()
      } else await waitFor(() => expect(mockCreateAppointment).toHaveBeenCalledOnce())
    },
  )
  it.each(['resolve', 'reject'])(
    'ignores an obsolete slot request that settles with %s after a date change',
    async (outcome) => {
      let resolveOld!: (slots: (typeof MOCK_SLOT)[]) => void
      let rejectOld!: (error: Error) => void
      mockGetAvailableSlots
        .mockImplementationOnce(
          () =>
            new Promise((resolve, reject) => {
              resolveOld = resolve
              rejectOld = reject
            }),
        )
        .mockResolvedValue([{ ...MOCK_SLOT, time: '11:00' }])
      renderModal()
      fireEvent.change(screen.getByTestId('date-picker-input'), { target: { value: '2030-12-30' } })
      await waitFor(() => expect(mockGetAvailableSlots).toHaveBeenCalledOnce())
      fireEvent.change(screen.getByTestId('date-picker-input'), { target: { value: '2030-12-31' } })
      await screen.findByRole('button', { name: '11:00' })
      await act(async () => {
        if (outcome === 'resolve') resolveOld([MOCK_SLOT])
        else rejectOld(new Error('obsolete request'))
      })
      expect(screen.getByRole('button', { name: '11:00' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '10:00' })).not.toBeInTheDocument()
    },
  )

  it('rejects an invalid phone before persisting the appointment', async () => {
    renderModal()
    await fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/Telefone/i), { target: { value: '123' } })
    submitForm()
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Telefone obrigatório' }),
    )
    expect(mockCreateAppointment).not.toHaveBeenCalled()
  })

  it('rejects a past date even when the slots service returns availability', async () => {
    renderModal()
    await fillRequiredFields()
    fireEvent.change(screen.getByTestId('date-picker-input'), { target: { value: '2000-01-01' } })
    await userEvent.click(await screen.findByRole('button', { name: '10:00' }))
    submitForm()
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ title: 'Data inválida' }))
    expect(mockCreateAppointment).not.toHaveBeenCalled()
  })

  it('keeps a failed draft available for retry and disables controls during submission', async () => {
    let rejectCreate!: (error: Error) => void
    mockCreateAppointment.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectCreate = reject
        }),
    )
    const { onCreated, onClose } = renderModal()
    await fillRequiredFields()
    submitForm()
    expect(screen.getByLabelText(/Nome do paciente/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    await act(async () => rejectCreate(new Error('Serviço indisponível')))
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Serviço indisponível', tone: 'error' }),
    )
    expect(screen.getByLabelText(/Nome do paciente/i)).toHaveValue('Maria Silva')
    expect(onCreated).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    submitForm()
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce())
    expect(mockCreateAppointment).toHaveBeenCalledTimes(2)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('discards the draft and avatar when dismissed and reopened', async () => {
    const onClose = vi.fn()
    const props = { fixedProfile: FIXED_PROFILE, onClose, onCreated: vi.fn() }
    const { rerender } = render(<CreateAppointmentModal {...props} open />)
    await fillRequiredFields()
    await selectAvatarFile()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledOnce()
    rerender(<CreateAppointmentModal {...props} open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    rerender(<CreateAppointmentModal {...props} open />)
    expect(screen.getByLabelText(/Nome do paciente/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Adicionar foto do paciente' })).toBeInTheDocument()
    expect(mockCreateAppointment).not.toHaveBeenCalled()
  })

  it('selects a dentist, suggests the service price and preserves or restores a manual estimate', async () => {
    mockGetProfile.mockResolvedValue({
      id: 'prof-1',
      services: [
        { id: 's1', name: 'Limpeza', priceFrom: 100, isActive: true },
        { id: 's2', name: 'Avaliação', priceFrom: null, isActive: true },
        { id: 'inactive', name: 'Inativo', priceFrom: 50, isActive: false },
      ],
    })
    render(<CreateAppointmentModal open onClose={vi.fn()} onCreated={vi.fn()} />)
    const profile = screen.getByRole('combobox', { name: 'Profissional' })
    await waitFor(() => expect(profile).toBeEnabled())
    await userEvent.click(profile)
    await userEvent.click(await screen.findByRole('option', { name: 'Dr. Silva' }))
    const service = screen.getByRole('combobox', { name: /Serviço/ })
    await waitFor(() => expect(service).toBeEnabled())
    await userEvent.click(service)
    expect(screen.queryByRole('option', { name: /Inativo/ })).not.toBeInTheDocument()
    await userEvent.click(await screen.findByRole('option', { name: /Limpeza/ }))
    const amount = screen.getByLabelText(/Valor previsto/)
    expect(amount).toHaveValue('100,00')
    fireEvent.change(amount, { target: { value: '80,00' } })
    await userEvent.click(service)
    await userEvent.click(await screen.findByRole('option', { name: 'Avaliação' }))
    expect(amount).toHaveValue('80,00')
    await userEvent.click(service)
    await userEvent.click(await screen.findByRole('option', { name: /Limpeza/ }))
    await userEvent.click(screen.getByRole('button', { name: /Restaurar valor do serviço/ }))
    expect(amount).toHaveValue('100,00')
    await userEvent.click(service)
    await userEvent.click(await screen.findByRole('option', { name: 'Avaliação' }))
    expect(amount).toHaveValue('')
  })
})

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
  it('shows "Remover foto" in the picker after a valid file is selected and crop is confirmed', async () => {
    const user = userEvent.setup()
    renderModal()
    await selectAvatarFile()
    // Open the picker to check "Remover foto" is available
    await user.click(screen.getByRole('button', { name: /Alterar foto do paciente/i }))
    expect(screen.getByRole('menuitem', { name: /Remover foto/i })).toBeInTheDocument()
  })

  it('changes upload button label from "Adicionar" to "Alterar" after selection', async () => {
    renderModal()
    await selectAvatarFile()
    expect(screen.getByRole('button', { name: /Alterar foto do paciente/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Adicionar foto do paciente/i }),
    ).not.toBeInTheDocument()
  })

  it('shows the confirmation hint text after selection', async () => {
    renderModal()
    await selectAvatarFile()
    expect(screen.getByText(/será vinculada ao paciente após criar/i)).toBeInTheDocument()
  })

  it('shows an error alert and no preview when an invalid MIME type is selected', async () => {
    renderModal()
    const fileInput = document.querySelector(
      'input[type="file"]:not([capture])',
    ) as HTMLInputElement
    const file = new File(['data'], 'video.mp4', { type: 'video/mp4' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Foto inválida' }),
      )
    })
    expect(screen.queryByRole('button', { name: /Remover foto/i })).not.toBeInTheDocument()
  })

  it('does not save photo when crop is cancelled', async () => {
    renderModal()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    const cropModal = await waitFor(() => screen.getByTestId('avatar-crop-modal'))
    // Use within to avoid matching the "Cancelar" button of the appointment modal
    fireEvent.click(within(cropModal).getByRole('button', { name: /Cancelar/i }))
    await waitFor(() => {
      expect(screen.queryByTestId('avatar-crop-modal')).not.toBeInTheDocument()
    })
    // Photo was not saved — still showing "Adicionar" label, not "Alterar"
    expect(
      screen.queryByRole('button', { name: /Alterar foto do paciente/i }),
    ).not.toBeInTheDocument()
  })
})

// ── Photo removal ─────────────────────────────────────────────────────────────

describe('photo removal', () => {
  it('closes picker and hides "Remover foto" after clicking it', async () => {
    const user = userEvent.setup()
    renderModal()
    await selectAvatarFile()
    // Open picker and click Remover foto
    await user.click(screen.getByRole('button', { name: /Alterar foto do paciente/i }))
    await user.click(screen.getByRole('menuitem', { name: /Remover foto/i }))
    // Picker is closed; no picker items visible
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('resets label back to "Adicionar foto" after removing via picker', async () => {
    const user = userEvent.setup()
    renderModal()
    await selectAvatarFile()
    await user.click(screen.getByRole('button', { name: /Alterar foto do paciente/i }))
    await user.click(screen.getByRole('menuitem', { name: /Remover foto/i }))
    expect(screen.getByRole('button', { name: /Adicionar foto do paciente/i })).toBeInTheDocument()
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
      expect(mockUpsertPatientAvatar).toHaveBeenCalledWith(
        'Maria Silva',
        'base64mock',
        'patient-created',
      )
    })
  })

  it('calls upsertPatientAvatar with email as identifier when email is provided', async () => {
    renderModal()
    await selectAvatarFile()
    fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'maria@example.com' } })
    await fillRequiredFields()
    submitForm()
    await waitFor(() => {
      expect(mockUpsertPatientAvatar).toHaveBeenCalledWith(
        'maria@example.com',
        'base64mock',
        'patient-created',
      )
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
