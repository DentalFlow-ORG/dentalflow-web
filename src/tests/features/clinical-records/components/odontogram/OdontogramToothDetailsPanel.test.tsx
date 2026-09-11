import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { OdontogramToothDetailsPanel } from '@/features/clinical-records/components/odontogram/OdontogramToothDetailsPanel'

describe('OdontogramToothDetailsPanel', () => {
  it('preserves notes and allows correcting an unfamiliar saved condition', async () => {
    const onSetCondition = vi.fn()
    render(
      <OdontogramToothDetailsPanel
        toothNumber={11}
        tooth={{ condition: 'legacy-condition', notes: 'Registro antigo' }}
        onSetCondition={onSetCondition}
        onSetNotes={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Observações do dente')).toHaveValue('Registro antigo')
    await userEvent.click(screen.getByRole('button', { name: 'Cárie' }))
    expect(onSetCondition).toHaveBeenCalledWith('caries')
  })
  it('shows a placeholder when no tooth is selected', () => {
    render(
      <OdontogramToothDetailsPanel
        toothNumber={null}
        tooth={null}
        onSetCondition={vi.fn()}
        onSetNotes={vi.fn()}
      />,
    )
    expect(screen.getByText('Nenhum dente selecionado')).toBeInTheDocument()
  })

  it('shows the tooth number and its condition label', () => {
    render(
      <OdontogramToothDetailsPanel
        toothNumber={11}
        tooth={{ condition: 'caries' }}
        onSetCondition={vi.fn()}
        onSetNotes={vi.fn()}
      />,
    )
    expect(screen.getByText('Dente 11')).toBeInTheDocument()
    expect(screen.getAllByText('Cárie').length).toBeGreaterThan(0)
  })

  it('falls back to a neutral label/style when the tooth has no condition', () => {
    render(
      <OdontogramToothDetailsPanel
        toothNumber={11}
        tooth={{}}
        onSetCondition={vi.fn()}
        onSetNotes={vi.fn()}
      />,
    )
    expect(screen.getByText('Dente 11')).toBeInTheDocument()
  })

  it('calls onSetCondition when a condition button is clicked', async () => {
    const onSetCondition = vi.fn()
    render(
      <OdontogramToothDetailsPanel
        toothNumber={11}
        tooth={{}}
        onSetCondition={onSetCondition}
        onSetNotes={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cárie' }))
    expect(onSetCondition).toHaveBeenCalledWith('caries')
  })

  it('hides the condition-picker buttons and notes placeholder when readOnly', () => {
    render(
      <OdontogramToothDetailsPanel
        toothNumber={11}
        tooth={{}}
        readOnly
        onSetCondition={vi.fn()}
        onSetNotes={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Cárie' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Observações do dente')).toHaveAttribute('readonly')
  })

  it('calls onSetNotes as the user types', async () => {
    const onSetNotes = vi.fn()
    render(
      <OdontogramToothDetailsPanel
        toothNumber={11}
        tooth={{}}
        onSetCondition={vi.fn()}
        onSetNotes={onSetNotes}
      />,
    )
    await userEvent.type(screen.getByLabelText('Observações do dente'), 'a')
    expect(onSetNotes).toHaveBeenCalledWith('a')
  })

  it('shows existing notes', () => {
    render(
      <OdontogramToothDetailsPanel
        toothNumber={11}
        tooth={{ notes: 'Sensibilidade ao frio' }}
        onSetCondition={vi.fn()}
        onSetNotes={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Observações do dente')).toHaveValue('Sensibilidade ao frio')
  })
})
