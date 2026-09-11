import { ImageAttachmentPanel } from '@/features/clinical-records/components/ImageAttachmentPanel'
import {
  listAttachments,
  removeAttachment,
  updateAttachmentDescription,
} from '@/features/clinical-records/services/clinical-records.service'
import type { ClinicalRecordAttachment } from '@/features/clinical-records/types/clinical-record.types'
import { makeAttachment } from '@/test-utils/factories/attachment.factory'
import {
  act,
  fireEvent,
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
  within,
} from '@/test-utils/render-utils'

const showAlert = vi.hoisted(() => vi.fn())
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert }),
}))
vi.mock('@/features/clinical-records/services/clinical-records.service', () => ({
  listAttachments: vi.fn(),
  removeAttachment: vi.fn(),
  updateAttachmentDescription: vi.fn(),
  addAttachmentMetadata: vi.fn(),
}))

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
  vi.mocked(listAttachments).mockResolvedValue([makeAttachment()])
  vi.mocked(removeAttachment).mockResolvedValue(undefined)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

async function openPanel(readOnly = false) {
  const view = renderWithProviders(<ImageAttachmentPanel recordId="record-1" readOnly={readOnly} />)
  await screen.findByRole('img', { name: 'radiografia.jpg' })
  return view
}

it('reports a failed load and settles the loading indicator', async () => {
  vi.mocked(listAttachments).mockRejectedValue(new Error('offline'))
  renderWithProviders(<ImageAttachmentPanel recordId="record-1" />)
  expect(screen.getByText('Carregando imagens...')).toBeInTheDocument()
  expect(await screen.findByText('Nenhuma imagem adicionada')).toBeInTheDocument()
  expect(showAlert).toHaveBeenCalledWith(
    expect.objectContaining({
      description: 'Não foi possível carregar as imagens.',
      tone: 'error',
    }),
  )
})

it('ignores stale data when another record finishes loading first', async () => {
  let resolveOld: (value: ClinicalRecordAttachment[]) => void = () => {}
  vi.mocked(listAttachments).mockReturnValueOnce(
    new Promise((resolve) => {
      resolveOld = resolve
    }),
  )
  const view = renderWithProviders(<ImageAttachmentPanel recordId="old-record" />)
  view.rerender(<ImageAttachmentPanel recordId="record-1" />)
  await screen.findByRole('img', { name: 'radiografia.jpg' })
  await act(async () => resolveOld([makeAttachment({ fileName: 'outro-paciente.jpg' })]))
  expect(screen.queryByRole('img', { name: 'outro-paciente.jpg' })).not.toBeInTheDocument()
})

it('does not show an alert for a request rejected after unmount', async () => {
  let rejectOld: (error: Error) => void = () => {}
  vi.mocked(listAttachments).mockReturnValueOnce(
    new Promise((_, reject) => {
      rejectOld = reject
    }),
  )
  const view = renderWithProviders(<ImageAttachmentPanel recordId="record-1" />)
  view.unmount()
  await act(async () => rejectOld(new Error('offline')))
  expect(showAlert).not.toHaveBeenCalled()
})

it.each([
  [null, '15/06/2026'],
  [0, '15/06/2026'],
  [512, '15/06/2026 · 512 B'],
  [2048, '15/06/2026 · 2.0 KB'],
  [2097152, '15/06/2026 · 2.0 MB'],
])(
  'shows size metadata for %s bytes and filters attachments without image data',
  async (sizeBytes, text) => {
    vi.mocked(listAttachments).mockResolvedValue([
      makeAttachment({ sizeBytes, thumbnailBase64: null, mimeType: null }),
      makeAttachment({ id: 'hidden', fileName: 'metadata-only.jpg', dataBase64: null }),
    ])
    await openPanel()
    expect(screen.getByText(text)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'radiografia.jpg' })).toHaveAttribute(
      'src',
      'data:image/jpeg;base64,aW1hZ2U=',
    )
    expect(screen.queryByText('metadata-only.jpg')).not.toBeInTheDocument()
  },
)

it('previews full-size image data, keeps image clicks open, and supports closing', async () => {
  const user = userEvent.setup()
  await openPanel()
  await user.click(screen.getByRole('button', { name: /Ver imagem em tela cheia/ }))
  const dialog = screen.getByRole('dialog', { name: 'Visualização de imagem' })
  const image = within(dialog).getByRole('img', { name: 'radiografia.jpg' })
  expect(image).toHaveAttribute('src', 'data:image/jpeg;base64,aW1hZ2U=')
  await user.click(image)
  expect(dialog).toBeInTheDocument()
  await user.click(within(dialog).getByRole('button', { name: 'Fechar visualização' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Ver imagem em tela cheia/ }))
  await user.click(screen.getByRole('dialog'))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('uses JPEG for a thumbnail and full preview when MIME metadata is absent', async () => {
  vi.mocked(listAttachments).mockResolvedValue([makeAttachment({ mimeType: null })])
  await openPanel()
  expect(screen.getByRole('img')).toHaveAttribute(
    'src',
    expect.stringContaining('data:image/jpeg;base64,'),
  )
  await userEvent.click(screen.getByRole('button', { name: /Ver imagem em tela cheia/ }))
  expect(within(screen.getByRole('dialog')).getByRole('img')).toHaveAttribute(
    'src',
    'data:image/jpeg;base64,aW1hZ2U=',
  )
})

it('cancels a pending caption update when the record becomes read-only', async () => {
  const view = await openPanel()
  vi.useFakeTimers()
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Legenda pendente' } })
  view.rerender(<ImageAttachmentPanel recordId="record-1" readOnly />)
  await act(async () => vi.advanceTimersByTimeAsync(800))
  expect(updateAttachmentDescription).not.toHaveBeenCalled()
  expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
  expect(screen.queryByRole('button', { name: 'Remover' })).not.toBeInTheDocument()
})

it('cancels deletion without making a request, then removes only after confirmation', async () => {
  const user = userEvent.setup()
  await openPanel()
  await user.click(screen.getByRole('button', { name: 'Remover' }))
  await user.click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(removeAttachment).not.toHaveBeenCalled()
  expect(screen.getByRole('img')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Remover' }))
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remover' }))
  await screen.findByText('Nenhuma imagem adicionada')
  expect(removeAttachment).toHaveBeenCalledWith('record-1', 'attachment-1')
  expect(showAlert).toHaveBeenCalledWith(expect.objectContaining({ title: 'Imagem removida.' }))
})

it('retains the image when deletion fails', async () => {
  vi.mocked(removeAttachment).mockRejectedValue(new Error('offline'))
  const user = userEvent.setup()
  await openPanel()
  await user.click(screen.getByRole('button', { name: 'Remover' }))
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remover' }))
  await waitFor(() =>
    expect(showAlert).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Não foi possível remover a imagem.' }),
    ),
  )
  expect(screen.getByRole('img')).toBeInTheDocument()
})

it('allows viewing but hides mutations for read-only records', async () => {
  await openPanel(true)
  expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
  expect(screen.queryByRole('button', { name: 'Remover' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Enviar imagem' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Ver imagem em tela cheia/ })).toBeInTheDocument()
  expect(updateAttachmentDescription).not.toHaveBeenCalled()
})

it('debounces captions, reports saving/saved states, and persists only the latest text', async () => {
  let resolveSave: (value: ClinicalRecordAttachment) => void = () => {}
  vi.mocked(updateAttachmentDescription).mockReturnValue(
    new Promise((resolve) => {
      resolveSave = resolve
    }),
  )
  await openPanel()
  vi.useFakeTimers()
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Primeira' } })
  await act(async () => vi.advanceTimersByTimeAsync(400))
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Radiografia final' } })
  await act(async () => vi.advanceTimersByTimeAsync(799))
  expect(updateAttachmentDescription).not.toHaveBeenCalled()
  await act(async () => vi.advanceTimersByTimeAsync(1))
  expect(screen.getByText('Salvando...')).toBeInTheDocument()
  expect(updateAttachmentDescription).toHaveBeenCalledExactlyOnceWith(
    'record-1',
    'attachment-1',
    'Radiografia final',
  )
  await act(async () => resolveSave(makeAttachment({ description: 'Radiografia final' })))
  expect(screen.getByText('Salvo')).toBeInTheDocument()
  await act(async () => vi.advanceTimersByTimeAsync(1500))
  expect(screen.queryByText('Salvo')).not.toBeInTheDocument()
})

it('retains edited text on a failed caption save and cancels pending saves on unmount', async () => {
  vi.mocked(updateAttachmentDescription).mockRejectedValue(new Error('offline'))
  const view = await openPanel()
  vi.useFakeTimers()
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Manter legenda' } })
  await act(async () => vi.advanceTimersByTimeAsync(800))
  expect(screen.getByRole('textbox')).toHaveValue('Manter legenda')
  expect(screen.queryByText('Salvando...')).not.toBeInTheDocument()
  expect(screen.queryByText('Salvo')).not.toBeInTheDocument()
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Não enviar' } })
  view.unmount()
  await act(async () => vi.advanceTimersByTimeAsync(800))
  expect(updateAttachmentDescription).toHaveBeenCalledTimes(1)
})
