import { fireEvent, render, screen, userEvent, waitFor, within } from '@/test-utils/render-utils'

import { ExceptionManager } from '@/features/scheduling/components/availability/ExceptionManager'
import {
  createAvailabilityException,
  deleteAvailabilityException,
  updateAvailabilityException,
} from '@/features/scheduling/services/scheduling.service'
import type { AvailabilityException } from '@/features/scheduling/types/scheduling.types'
import { formatDateBR } from '@/lib/date-time-formatters'

const mocks = vi.hoisted(() => ({
  brazilTodayIso: vi.fn(() => '2026-06-05'),
  showAlert: vi.fn(),
}))

vi.mock('@/lib/brazil-timezone', () => ({
  brazilTodayIso: mocks.brazilTodayIso,
  BRAZIL_TZ: 'America/Sao_Paulo',
}))

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mocks.showAlert }),
}))

vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  createAvailabilityException: vi.fn(), // needed by ExceptionManager internally
  updateAvailabilityException: vi.fn(),
  deleteAvailabilityException: vi.fn(),
}))

vi.mock('@/components/common/DatePickerInput', () => ({
  DatePickerInput: ({
    id,
    name,
    required,
    disabled,
  }: {
    id: string
    name: string
    required?: boolean
    disabled?: boolean
  }) => <input type="date" id={id} name={name} required={required} disabled={disabled} />,
}))

// Today: 2026-06-05
function makeException(overrides: Partial<AvailabilityException> = {}): AvailabilityException {
  return {
    id: 'exc-1',
    profileId: 'profile-1',
    clinicId: 'clinic-1',
    exceptionDate: '2026-06-10',
    isDayOff: true,
    startTime: null,
    endTime: null,
    reason: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// Future exceptions (>= 2026-06-05)
const FUTURE_1 = makeException({
  id: 'exc-future-1',
  exceptionDate: '2026-06-10',
  isDayOff: true,
  reason: 'Folga mensal',
})
const FUTURE_2 = makeException({
  id: 'exc-future-2',
  exceptionDate: '2026-06-20',
  isDayOff: false,
  startTime: '14:00',
  endTime: '18:00',
  reason: null,
})

// Past exceptions (< 2026-06-05)
const PAST_1 = makeException({
  id: 'exc-past-1',
  exceptionDate: '2026-05-20',
  isDayOff: true,
  reason: null,
})
const PAST_2 = makeException({
  id: 'exc-past-2',
  exceptionDate: '2026-05-10',
  isDayOff: false,
  startTime: '09:00',
  endTime: '12:00',
  reason: 'Atendimento especial',
})

function renderManager(
  exceptions: AvailabilityException[],
  props: Partial<{ title: string; hideTitle: boolean }> = {},
) {
  const onExceptionsChange = vi.fn()
  render(
    <ExceptionManager
      profileId="profile-1"
      exceptions={exceptions}
      onExceptionsChange={onExceptionsChange}
      title="Exceções de agenda"
      {...props}
    />,
  )
  return { onExceptionsChange }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(createAvailabilityException).mockReset()
  vi.mocked(updateAvailabilityException).mockReset()
  vi.mocked(deleteAvailabilityException).mockReset()
  mocks.brazilTodayIso.mockReturnValue('2026-06-05')
})

// Deletion opens a confirmation naming the date; this confirms it.
async function confirmExceptionDeletion(user: ReturnType<typeof userEvent.setup>) {
  const dialog = await screen.findByRole('dialog', { name: 'Excluir exceção de agenda?' })
  await user.click(within(dialog).getByRole('button', { name: 'Excluir exceção' }))
}

describe('ExceptionManager — mutation recovery', () => {
  it.each([new Error('Servidor indisponível'), null])(
    'preserves a new exception after rejection %s and retries',
    async (error) => {
      vi.mocked(createAvailabilityException)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(FUTURE_1)
      const { onExceptionsChange } = renderManager([FUTURE_2])
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /adicionar/i }))
      fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-06-10' } })
      await user.type(screen.getByLabelText(/Motivo/), 'Folga mensal')
      await user.click(screen.getByRole('button', { name: 'Salvar' }))
      expect(
        await screen.findByText(error?.message ?? 'Erro ao adicionar exceção.'),
      ).toBeInTheDocument()
      expect(onExceptionsChange).not.toHaveBeenCalled()
      expect(screen.getByLabelText(/Motivo/)).toHaveValue('Folga mensal')
      await user.click(screen.getByRole('button', { name: 'Salvar' }))
      await waitFor(() => expect(onExceptionsChange).toHaveBeenCalledWith([FUTURE_2, FUTURE_1]))
      expect(createAvailabilityException).toHaveBeenLastCalledWith('profile-1', {
        exceptionDate: '2026-06-10',
        isDayOff: true,
        reason: 'Folga mensal',
      })
      expect(screen.queryByLabelText('Data')).not.toBeInTheDocument()
    },
  )

  it.each([new Error('Servidor indisponível'), null])(
    'preserves edited exceptions after rejection %s and retries',
    async (error) => {
      vi.mocked(updateAvailabilityException)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(FUTURE_1)
      const { onExceptionsChange } = renderManager([FUTURE_1, FUTURE_2])
      const user = userEvent.setup()
      await user.click(
        within(screen.getByTestId('exception-row-exc-future-1')).getByRole('button', {
          name: /editar exceção/i,
        }),
      )
      await user.click(screen.getByRole('button', { name: /salvar alterações/i }))
      await waitFor(() =>
        expect(mocks.showAlert).toHaveBeenLastCalledWith(
          expect.objectContaining({
            title: error?.message ?? 'Erro ao atualizar exceção.',
            tone: 'error',
          }),
        ),
      )
      expect(onExceptionsChange).not.toHaveBeenCalled()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /salvar alterações/i }))
      await waitFor(() => expect(onExceptionsChange).toHaveBeenCalledWith([FUTURE_1, FUTURE_2]))
    },
  )

  describe.each(['modal', 'row'])('%s deletion', (origin) => {
    it.each([new Error('Servidor indisponível'), null])(
      'keeps an exception after rejection %s and retries',
      async (error) => {
        vi.mocked(deleteAvailabilityException)
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce(undefined)
        const { onExceptionsChange } = renderManager([FUTURE_1])
        const user = userEvent.setup()
        if (origin === 'modal')
          await user.click(screen.getByRole('button', { name: /editar exceção/i }))
        const buttonName = origin === 'modal' ? /excluir exceção/i : /remover exceção/i
        await user.click(screen.getByRole('button', { name: buttonName }))
        await confirmExceptionDeletion(user)
        await waitFor(() =>
          expect(mocks.showAlert).toHaveBeenLastCalledWith(
            expect.objectContaining({
              title: 'Erro ao remover exceção',
              description: error?.message,
              tone: 'error',
            }),
          ),
        )
        expect(onExceptionsChange).not.toHaveBeenCalled()
        // The confirmation stays open after the failure so the user can retry.
        await confirmExceptionDeletion(user)
        await waitFor(() => expect(onExceptionsChange).toHaveBeenCalledWith([]))
      },
    )
  })

  it('dismisses create and edit forms without persisting changes', async () => {
    renderManager([FUTURE_1])
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /adicionar/i }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByLabelText('Data')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /editar exceção/i }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(createAvailabilityException).not.toHaveBeenCalled()
    expect(updateAvailabilityException).not.toHaveBeenCalled()
  })
})

describe('ExceptionManager — filter behavior', () => {
  it('shows upcoming exceptions by default', () => {
    renderManager([FUTURE_1, PAST_1])

    expect(screen.getByTestId('exception-row-exc-future-1')).toBeInTheDocument()
    expect(screen.queryByTestId('exception-row-exc-past-1')).toBeNull()
  })

  it('shows past exceptions when Passadas filter is selected', async () => {
    const user = userEvent.setup()
    renderManager([FUTURE_1, PAST_1])

    await user.click(screen.getByRole('button', { name: 'Passadas' }))

    expect(screen.getByTestId('exception-row-exc-past-1')).toBeInTheDocument()
    expect(screen.queryByTestId('exception-row-exc-future-1')).toBeNull()
  })

  it('shows all exceptions when Todas filter is selected', async () => {
    const user = userEvent.setup()
    renderManager([FUTURE_1, PAST_1])

    await user.click(screen.getByRole('button', { name: 'Todas' }))

    expect(screen.getByTestId('exception-row-exc-future-1')).toBeInTheDocument()
    expect(screen.getByTestId('exception-row-exc-past-1')).toBeInTheDocument()
  })

  it('hides filter tabs when there are no exceptions', () => {
    renderManager([])

    expect(screen.queryByRole('button', { name: 'Próximas' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Passadas' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Todas' })).toBeNull()
  })

  it('counts today as upcoming', () => {
    const todayExc = makeException({ id: 'exc-today', exceptionDate: '2026-06-05', isDayOff: true })
    renderManager([todayExc])

    expect(screen.getByTestId('exception-row-exc-today')).toBeInTheDocument()
  })
})

describe('ExceptionManager — sort order', () => {
  it('sorts upcoming exceptions ascending by date', () => {
    renderManager([FUTURE_2, FUTURE_1])

    const body = document.body.textContent ?? ''
    expect(body.indexOf('10/06/2026')).toBeLessThan(body.indexOf('20/06/2026'))
  })

  it('sorts past exceptions descending by date', async () => {
    const user = userEvent.setup()
    renderManager([PAST_2, PAST_1])

    await user.click(screen.getByRole('button', { name: 'Passadas' }))

    const body = document.body.textContent ?? ''
    expect(body.indexOf('20/05/2026')).toBeLessThan(body.indexOf('10/05/2026'))
  })

  it('sorts all exceptions ascending by date', async () => {
    const user = userEvent.setup()
    renderManager([FUTURE_1, PAST_1])

    await user.click(screen.getByRole('button', { name: 'Todas' }))

    const body = document.body.textContent ?? ''
    expect(body.indexOf('20/05/2026')).toBeLessThan(body.indexOf('10/06/2026'))
  })
})

describe('ExceptionManager — row labels', () => {
  it('shows "Folga ocasional" for day-off exceptions', () => {
    renderManager([FUTURE_1])

    expect(screen.getByText('Folga ocasional')).toBeInTheDocument()
  })

  it('shows "Horário especial" for special hours exceptions', () => {
    renderManager([FUTURE_2])

    expect(screen.getByText('Horário especial')).toBeInTheDocument()
  })

  it('shows "Próxima" status chip for upcoming exceptions', () => {
    renderManager([FUTURE_1])

    expect(screen.getByText('Próxima')).toBeInTheDocument()
  })

  it('shows "Passada" status chip for past exceptions', async () => {
    const user = userEvent.setup()
    renderManager([PAST_1])

    await user.click(screen.getByRole('button', { name: 'Passadas' }))

    expect(screen.getByText('Passada')).toBeInTheDocument()
  })

  it('shows time range for Horário especial', () => {
    renderManager([FUTURE_2])

    const body = document.body.textContent ?? ''
    expect(body).toContain('14:00')
    expect(body).toContain('18:00')
  })
})

describe('ExceptionManager — empty states', () => {
  it('shows generic empty state when no exceptions', () => {
    renderManager([])

    expect(screen.getByText(/Nenhuma exceção cadastrada/)).toBeInTheDocument()
  })

  it('shows upcoming empty state when filter is Próximas and no future exceptions', () => {
    renderManager([PAST_1])

    expect(screen.getByText('Nenhuma exceção futura cadastrada.')).toBeInTheDocument()
  })

  it('shows past empty state when filter is Passadas and no past exceptions', async () => {
    const user = userEvent.setup()
    renderManager([FUTURE_1])

    await user.click(screen.getByRole('button', { name: 'Passadas' }))

    expect(screen.getByText('Nenhuma exceção passada no histórico.')).toBeInTheDocument()
  })
})

describe('ExceptionManager — edit modal', () => {
  it('clicking edit button opens the edit modal', async () => {
    const user = userEvent.setup()
    renderManager([FUTURE_1])

    await user.click(screen.getByRole('button', { name: /editar exceção/i }))

    expect(await screen.findByText('Editar exceção')).toBeInTheDocument()
  })

  it('modal shows the date as read-only text without a date input', async () => {
    const user = userEvent.setup()
    renderManager([FUTURE_1])

    await user.click(screen.getByRole('button', { name: /editar exceção/i }))
    await screen.findByText('Editar exceção')

    // Date is shown as text, not an editable input
    const dateInputs = document.querySelectorAll('input[type="date"]')
    expect(dateInputs).toHaveLength(0)
    expect(document.body.textContent).toContain('10/06/2026')
  })

  it('does not send exceptionDate in the update payload', async () => {
    const user = userEvent.setup()
    vi.mocked(updateAvailabilityException).mockResolvedValue(FUTURE_1)
    renderManager([FUTURE_1])

    await user.click(screen.getByRole('button', { name: /editar exceção/i }))
    await screen.findByText('Editar exceção')
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() => expect(updateAvailabilityException).toHaveBeenCalled())
    const dto = vi.mocked(updateAvailabilityException).mock.calls[0][2]
    expect(dto).not.toHaveProperty('exceptionDate')
  })

  it('submits correct payload for a day-off exception edit', async () => {
    const user = userEvent.setup()
    vi.mocked(updateAvailabilityException).mockResolvedValue(FUTURE_1)
    renderManager([FUTURE_1])

    await user.click(screen.getByRole('button', { name: /editar exceção/i }))
    await screen.findByText('Editar exceção')
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() =>
      expect(updateAvailabilityException).toHaveBeenCalledWith(
        'profile-1',
        'exc-future-1',
        expect.objectContaining({ isDayOff: true, reason: 'Folga mensal' }),
      ),
    )
  })

  it('submits correct payload for a special hours exception edit', async () => {
    const user = userEvent.setup()
    vi.mocked(updateAvailabilityException).mockResolvedValue(FUTURE_2)
    renderManager([FUTURE_2])

    await user.click(screen.getByRole('button', { name: /editar exceção/i }))
    await screen.findByText('Editar exceção')
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() =>
      expect(updateAvailabilityException).toHaveBeenCalledWith(
        'profile-1',
        'exc-future-2',
        expect.objectContaining({ isDayOff: false, startTime: '14:00', endTime: '18:00' }),
      ),
    )
  })

  it('start and end time inputs are required for special hours in edit modal', async () => {
    const user = userEvent.setup()
    renderManager([FUTURE_2])

    await user.click(screen.getByRole('button', { name: /editar exceção/i }))
    await screen.findByText('Editar exceção')

    expect(screen.getByLabelText('Início')).toHaveAttribute('required')
    expect(screen.getByLabelText('Fim')).toHaveAttribute('required')
  })

  it('delete from modal calls deleteAvailabilityException', async () => {
    const user = userEvent.setup()
    vi.mocked(deleteAvailabilityException).mockResolvedValue(undefined)
    renderManager([FUTURE_1])

    await user.click(screen.getByRole('button', { name: /editar exceção/i }))
    await screen.findByText('Editar exceção')
    await user.click(screen.getByRole('button', { name: /excluir exceção/i }))
    await confirmExceptionDeletion(user)

    await waitFor(() =>
      expect(deleteAvailabilityException).toHaveBeenCalledWith('profile-1', 'exc-future-1'),
    )
    await waitFor(() => expect(screen.queryByText('Editar exceção')).toBeNull())
  })

  it('sends null when the reason is cleared on edit', async () => {
    const user = userEvent.setup()
    vi.mocked(updateAvailabilityException).mockResolvedValue(FUTURE_1)
    renderManager([FUTURE_1])

    await user.click(screen.getByRole('button', { name: /editar exceção/i }))
    await screen.findByText('Editar exceção')
    await user.clear(screen.getByLabelText(/Motivo/))
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() =>
      expect(updateAvailabilityException).toHaveBeenCalledWith(
        'profile-1',
        FUTURE_1.id,
        expect.objectContaining({ reason: null }),
      ),
    )
  })

  it('modal closes after successful save', async () => {
    const user = userEvent.setup()
    vi.mocked(updateAvailabilityException).mockResolvedValue(FUTURE_1)
    renderManager([FUTURE_1])

    await user.click(screen.getByRole('button', { name: /editar exceção/i }))
    await screen.findByText('Editar exceção')
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() => expect(screen.queryByText('Editar exceção')).toBeNull())
  })
})

describe('ExceptionManager — row delete', () => {
  it('delete button on row calls deleteAvailabilityException', async () => {
    const user = userEvent.setup()
    vi.mocked(deleteAvailabilityException).mockResolvedValue(undefined)
    renderManager([FUTURE_1])

    await user.click(screen.getByRole('button', { name: /remover exceção/i }))
    await confirmExceptionDeletion(user)

    await waitFor(() =>
      expect(deleteAvailabilityException).toHaveBeenCalledWith('profile-1', 'exc-future-1'),
    )
  })

  it('names the date in the confirmation and keeps the exception when dismissed', async () => {
    const user = userEvent.setup()
    renderManager([FUTURE_1])

    await user.click(screen.getByRole('button', { name: /remover exceção/i }))
    const dialog = await screen.findByRole('dialog', { name: 'Excluir exceção de agenda?' })
    expect(dialog).toHaveTextContent(formatDateBR(FUTURE_1.exceptionDate))
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(deleteAvailabilityException).not.toHaveBeenCalled()
  })

  it('delete button calls onExceptionsChange with the exception removed', async () => {
    const user = userEvent.setup()
    vi.mocked(deleteAvailabilityException).mockResolvedValue(undefined)
    const { onExceptionsChange } = renderManager([FUTURE_1, FUTURE_2])

    const row1 = screen.getByTestId('exception-row-exc-future-1')
    await user.click(within(row1).getByRole('button', { name: /remover exceção/i }))
    await confirmExceptionDeletion(user)

    await waitFor(() => expect(onExceptionsChange).toHaveBeenCalledWith([FUTURE_2]))
  })
})

describe('ExceptionManager — accessibility', () => {
  it('active filter button has aria-pressed="true", others have aria-pressed="false"', () => {
    renderManager([FUTURE_1])

    expect(screen.getByRole('button', { name: 'Próximas' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Passadas' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('aria-pressed updates when a different filter is selected', async () => {
    const user = userEvent.setup()
    renderManager([FUTURE_1, PAST_1])

    await user.click(screen.getByRole('button', { name: 'Passadas' }))

    expect(screen.getByRole('button', { name: 'Passadas' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Próximas' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('Adicionar button is visible when hideTitle is true', () => {
    renderManager([FUTURE_1], { hideTitle: true })

    expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument()
  })

  it('type toggle buttons have aria-pressed reflecting current selection', async () => {
    const user = userEvent.setup()
    renderManager([])

    await user.click(screen.getByRole('button', { name: /adicionar/i }))

    // Default: isDayOff=true → "Folga ocasional" is pressed
    expect(screen.getByRole('button', { name: /folga ocasional/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /horário especial/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    await user.click(screen.getByRole('button', { name: /horário especial/i }))

    expect(screen.getByRole('button', { name: /folga ocasional/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('button', { name: /horário especial/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})

describe('ExceptionManager — no recurrence', () => {
  it('does not show any recurrence or yearly-repeat UI', () => {
    renderManager([FUTURE_1, PAST_1, FUTURE_2, PAST_2])

    expect(document.body.textContent).not.toMatch(/recorrente|recorrência|anual|todo.*ano|repete/i)
  })

  it('does not include recurrence fields in update payload', async () => {
    const user = userEvent.setup()
    vi.mocked(updateAvailabilityException).mockResolvedValue(FUTURE_1)
    renderManager([FUTURE_1])

    await user.click(screen.getByRole('button', { name: /editar exceção/i }))
    await screen.findByText('Editar exceção')
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() => expect(updateAvailabilityException).toHaveBeenCalled())
    const dto = vi.mocked(updateAvailabilityException).mock.calls[0][2]
    expect(dto).not.toHaveProperty('repeatYearly')
    expect(dto).not.toHaveProperty('isRecurring')
  })
})
