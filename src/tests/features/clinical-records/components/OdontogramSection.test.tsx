import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}))

import { OdontogramSection } from '@/features/clinical-records/components/OdontogramSection'
import type { OdontogramData } from '@/features/clinical-records/types/clinical-record.types'

function makeData(overrides: Partial<OdontogramData> = {}): OdontogramData {
  return { teeth: {}, notes: '', ...overrides }
}

describe('OdontogramSection — title and read-only description', () => {
  it('shows the title by default', () => {
    render(<OdontogramSection data={makeData()} onChange={vi.fn()} />)
    expect(screen.getByText('Odontograma')).toBeInTheDocument()
  })

  it('hides the title when showTitle is false', () => {
    render(<OdontogramSection data={makeData()} onChange={vi.fn()} showTitle={false} />)
    expect(screen.queryByText('Odontograma')).not.toBeInTheDocument()
  })

  it('shows the read-only description when readOnly', () => {
    render(<OdontogramSection data={makeData()} onChange={vi.fn()} readOnly />)
    expect(screen.getByText(/apenas para consulta/i)).toBeInTheDocument()
  })

  it('does not render the toolbar when readOnly', () => {
    render(<OdontogramSection data={makeData()} onChange={vi.fn()} readOnly />)
    expect(screen.queryByRole('button', { name: 'Selecionar todos' })).not.toBeInTheDocument()
  })
})

describe('OdontogramSection — single-tooth selection', () => {
  it('returns to permanent dentition without retaining a deciduous selection or changing saved data', async () => {
    const onChange = vi.fn()
    render(
      <OdontogramSection data={{ teeth: { '11': { condition: 'caries' } } }} onChange={onChange} />,
    )
    expect(screen.getByLabelText('Observações gerais do odontograma')).toHaveValue('')
    await userEvent.click(screen.getByRole('button', { name: 'Decídua' }))
    await userEvent.click(screen.getByRole('button', { name: /dente 51/i }))
    expect(screen.getByText('Dente 51')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Permanente' }))
    expect(screen.getByText('Nenhum dente selecionado')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /dente/i })).toHaveLength(32)
    expect(screen.getByRole('button', { name: /dente 11/i })).toHaveAccessibleName(/cárie/i)
    expect(onChange).not.toHaveBeenCalled()
  })
  it('selects a tooth on click and shows its details panel', async () => {
    render(<OdontogramSection data={makeData()} onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /dente 11/i }))
    expect(screen.getByText('Dente 11')).toBeInTheDocument()
  })

  it('deselects the tooth when clicked again', async () => {
    render(<OdontogramSection data={makeData()} onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /dente 11/i }))
    await userEvent.click(screen.getByRole('button', { name: /dente 11/i }))
    expect(screen.getByText('Nenhum dente selecionado')).toBeInTheDocument()
  })

  it('sets a condition on the selected tooth via onChange', async () => {
    const onChange = vi.fn()
    render(<OdontogramSection data={makeData()} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /dente 11/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Cárie' }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ teeth: { '11': { condition: 'caries' } } }),
    )
  })

  it('toggles the condition off when the same condition is clicked again', async () => {
    const onChange = vi.fn()
    const data = makeData({ teeth: { '11': { condition: 'caries' } } })
    render(<OdontogramSection data={data} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /dente 11/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Cárie' }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ teeth: { '11': { condition: undefined } } }),
    )
  })

  it('updates notes for the selected tooth', async () => {
    const onChange = vi.fn()
    render(<OdontogramSection data={makeData()} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /dente 11/i }))
    await userEvent.type(screen.getByLabelText('Observações do dente'), 'a')
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ teeth: { '11': { notes: 'a' } } }),
    )
  })

  it('does not mutate data when readOnly and a condition button would have been clicked', async () => {
    const onChange = vi.fn()
    render(<OdontogramSection data={makeData()} onChange={onChange} readOnly />)
    // In readOnly mode the chart itself is non-interactive
    expect(screen.getByRole('button', { name: /dente 11/i })).toBeDisabled()
  })
})

describe('OdontogramSection — general notes', () => {
  it('updates the general odontogram notes', async () => {
    const onChange = vi.fn()
    render(<OdontogramSection data={makeData()} onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('Observações gerais do odontograma'), 'a')
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ notes: 'a' }))
  })
})

describe('OdontogramSection — dentition toggle', () => {
  it('switches to deciduous dentition and shows 20 teeth', async () => {
    render(<OdontogramSection data={makeData()} onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Decídua' }))
    expect(screen.getAllByRole('button', { name: /dente/i })).toHaveLength(20)
  })

  it('clears the current selection when switching dentition mode', async () => {
    render(<OdontogramSection data={makeData()} onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /dente 11/i }))
    expect(screen.getByText('Dente 11')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Decídua' }))
    expect(screen.getByText('Nenhum dente selecionado')).toBeInTheDocument()
  })
})

describe('OdontogramSection — multi-select mode', () => {
  it('enters multi mode and toggles tooth selection', async () => {
    render(<OdontogramSection data={makeData()} onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar vários' }))
    expect(screen.getByText('Clique nos dentes para selecionar')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /dente 11/i }))
    expect(screen.getByText('1 dente selecionado')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /dente 21/i }))
    expect(screen.getByText('2 dentes selecionados')).toBeInTheDocument()

    // clicking an already-selected tooth deselects it
    await userEvent.click(screen.getByRole('button', { name: /dente 11/i }))
    expect(screen.getByText('1 dente selecionado')).toBeInTheDocument()
  })

  it('selects every tooth via "Selecionar todos"', async () => {
    render(<OdontogramSection data={makeData()} onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar todos' }))
    expect(screen.getByText('32 dentes selecionados')).toBeInTheDocument()
  })

  it('selects every remaining tooth via "Todos" and hides it once complete', async () => {
    render(<OdontogramSection data={makeData()} onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar vários' }))
    await userEvent.click(screen.getByRole('button', { name: 'Todos' }))
    expect(screen.getByText('32 dentes selecionados')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Todos' })).not.toBeInTheDocument()
  })

  it('clears the multi-selection via "Limpar"', async () => {
    render(<OdontogramSection data={makeData()} onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar todos' }))
    await userEvent.click(screen.getByRole('button', { name: 'Limpar' }))
    expect(screen.getByText('Clique nos dentes para selecionar')).toBeInTheDocument()
  })

  it('exits multi mode via "Cancelar seleção"', async () => {
    render(<OdontogramSection data={makeData()} onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar vários' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar seleção' }))
    expect(screen.getByRole('button', { name: 'Selecionar todos' })).toBeInTheDocument()
  })

  it('applies a specific condition to all selected teeth via the multi-condition panel', async () => {
    const onChange = vi.fn()
    render(<OdontogramSection data={makeData()} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar vários' }))
    await userEvent.click(screen.getByRole('button', { name: /dente 11/i }))
    await userEvent.click(screen.getByRole('button', { name: /dente 21/i }))

    const conditionButtons = screen.getAllByRole('button', { name: 'Cárie' })
    await userEvent.click(conditionButtons[conditionButtons.length - 1])

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        teeth: {
          '11': { condition: 'caries' },
          '21': { condition: 'caries' },
        },
      }),
    )
  })

  it('removes the condition from all selected teeth when they all already have it', async () => {
    const onChange = vi.fn()
    const data = makeData({
      teeth: { '11': { condition: 'caries' }, '21': { condition: 'caries' } },
    })
    render(<OdontogramSection data={data} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar vários' }))
    await userEvent.click(screen.getByRole('button', { name: /dente 11/i }))
    await userEvent.click(screen.getByRole('button', { name: /dente 21/i }))

    const conditionButtons = screen.getAllByRole('button', { name: 'Cárie' })
    await userEvent.click(conditionButtons[conditionButtons.length - 1])

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        teeth: {
          '11': { condition: undefined },
          '21': { condition: undefined },
        },
      }),
    )
  })

  it('does not show the multi-condition panel until at least one tooth is selected', async () => {
    render(<OdontogramSection data={makeData()} onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar vários' }))
    expect(screen.queryByText(/aplicar condição/i)).not.toBeInTheDocument()
  })
})

describe('OdontogramSection — general notes limit', () => {
  it('does not impose a client-only clinical notes limit', () => {
    render(<OdontogramSection data={makeData({ notes: 'a'.repeat(1700) })} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Observações gerais do odontograma')).not.toHaveAttribute(
      'maxLength',
    )
    expect(screen.queryByText(/caracteres/)).not.toBeInTheDocument()
  })

  it('does not count general notes in read-only mode', () => {
    render(
      <OdontogramSection
        data={makeData({ notes: 'a'.repeat(1700) })}
        onChange={vi.fn()}
        readOnly
      />,
    )
    expect(screen.queryByText(/caracteres/)).not.toBeInTheDocument()
  })
})
