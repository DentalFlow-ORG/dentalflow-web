import { ClinicalTemplateSelectorPanel } from '@/features/clinical-records/components/ClinicalTemplateSelectorPanel'
import type { ClinicalTemplate } from '@/features/clinical-records/types/clinical-record.types'
import { renderWithProviders, screen, userEvent } from '@/test-utils/render-utils'

function template(category: ClinicalTemplate['category']): ClinicalTemplate {
  return {
    id: category,
    clinicId: 'clinic-1',
    name: `Modelo ${category}`,
    category,
    content: 'Texto clínico',
    isActive: true,
    createdByUserId: 'user-1',
    createdAt: '2026-06-01T12:00:00Z',
    updatedAt: '2026-06-01T12:00:00Z',
  }
}

it('explains the empty state without offering an apply action', () => {
  renderWithProviders(<ClinicalTemplateSelectorPanel templates={[]} onApply={vi.fn()} />)
  expect(screen.getByText('Nenhum modelo disponível')).toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

it.each(['ANAMNESIS', 'EVOLUTION', 'PRESCRIPTION', 'RECOMMENDATION', 'PROCEDURE'] as const)(
  'applies the selected %s template',
  async (category) => {
    const model = template(category)
    const onApply = vi.fn()
    renderWithProviders(<ClinicalTemplateSelectorPanel templates={[model]} onApply={onApply} />)
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(`Inserir modelo "${model.name}" em`) }),
    )
    expect(onApply).toHaveBeenCalledExactlyOnceWith(model)
  },
)

it('disables templates with no destination instead of applying them to another field', async () => {
  const onApply = vi.fn()
  renderWithProviders(
    <ClinicalTemplateSelectorPanel templates={[template('OTHER')]} onApply={onApply} />,
  )
  const button = screen.getByRole('button', { name: 'Modelo "Modelo OTHER" sem campo associado' })
  expect(button).toBeDisabled()
  await userEvent.click(button)
  expect(onApply).not.toHaveBeenCalled()
})
