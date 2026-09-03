import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

// Radix Select does not work reliably in JSDOM — stub with a native <select>,
// mirroring the pattern used across feature toolbar tests.
vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (v: string) => void
    children: React.ReactNode
  }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

import { ListToolbar } from '@/components/common/ListToolbar'
import type { FilterDef } from '@/components/common/ListToolbar'

const FILTER_DEFS: FilterDef[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Ativo' },
      { value: 'inactive', label: 'Inativo' },
    ],
  },
]

describe('ListToolbar', () => {
  it('renders the search input with the default placeholder', () => {
    render(
      <ListToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        activeFilters={{}}
        onFilterChange={vi.fn()}
        onClearAll={vi.fn()}
      />,
    )
    expect(screen.getByPlaceholderText('Pesquisar...')).toBeInTheDocument()
  })

  it('renders a custom search placeholder', () => {
    render(
      <ListToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        searchPlaceholder="Buscar pacientes..."
        activeFilters={{}}
        onFilterChange={vi.fn()}
        onClearAll={vi.fn()}
      />,
    )
    expect(screen.getByPlaceholderText('Buscar pacientes...')).toBeInTheDocument()
  })

  it('calls onSearchChange as the user types', async () => {
    const onSearchChange = vi.fn()
    render(
      <ListToolbar
        searchQuery=""
        onSearchChange={onSearchChange}
        activeFilters={{}}
        onFilterChange={vi.fn()}
        onClearAll={vi.fn()}
      />,
    )
    await userEvent.type(screen.getByPlaceholderText('Pesquisar...'), 'ana')
    expect(onSearchChange).toHaveBeenCalled()
  })

  it('shows a clear-search button only when there is a query, and clears it on click', async () => {
    const onSearchChange = vi.fn()
    const { rerender } = render(
      <ListToolbar
        searchQuery=""
        onSearchChange={onSearchChange}
        activeFilters={{}}
        onFilterChange={vi.fn()}
        onClearAll={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Limpar pesquisa' })).not.toBeInTheDocument()

    rerender(
      <ListToolbar
        searchQuery="ana"
        onSearchChange={onSearchChange}
        activeFilters={{}}
        onFilterChange={vi.fn()}
        onClearAll={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Limpar pesquisa' }))
    expect(onSearchChange).toHaveBeenCalledWith('')
  })

  it('does not render the filter button when there are no filterDefs', () => {
    render(
      <ListToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        activeFilters={{}}
        onFilterChange={vi.fn()}
        onClearAll={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /filtros/i })).not.toBeInTheDocument()
  })

  it('renders the filter button and a badge with the active filter count', () => {
    render(
      <ListToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        filterDefs={FILTER_DEFS}
        activeFilters={{ status: 'active' }}
        onFilterChange={vi.fn()}
        onClearAll={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /filtros/i })).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('opens the filter popover and changes a filter value', async () => {
    const onFilterChange = vi.fn()
    render(
      <ListToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        filterDefs={FILTER_DEFS}
        activeFilters={{}}
        onFilterChange={onFilterChange}
        onClearAll={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    const select = await screen.findByRole('combobox')
    await userEvent.selectOptions(select, 'active')
    expect(onFilterChange).toHaveBeenCalledWith('status', 'active')
  })

  it('maps the sentinel "all" value back to null', async () => {
    const onFilterChange = vi.fn()
    render(
      <ListToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        filterDefs={FILTER_DEFS}
        activeFilters={{ status: 'active' }}
        onFilterChange={onFilterChange}
        onClearAll={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    const select = await screen.findByRole('combobox')
    await userEvent.selectOptions(select, 'Todos')
    expect(onFilterChange).toHaveBeenCalledWith('status', null)
  })

  it('renders a "Limpar filtros" link inside the popover when filters are active, and clears them', async () => {
    const onFilterChange = vi.fn()
    render(
      <ListToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        filterDefs={FILTER_DEFS}
        activeFilters={{ status: 'active' }}
        onFilterChange={onFilterChange}
        onClearAll={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    await userEvent.click(await screen.findByText('Limpar filtros'))
    expect(onFilterChange).toHaveBeenCalledWith('status', null)
  })

  it('renders an active-filter badge and removes it on click', async () => {
    const onFilterChange = vi.fn()
    render(
      <ListToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        filterDefs={FILTER_DEFS}
        activeFilters={{ status: 'active' }}
        onFilterChange={onFilterChange}
        onClearAll={vi.fn()}
      />,
    )
    const badge = screen.getByRole('button', { name: /status:\s*ativo/i })
    await userEvent.click(badge)
    expect(onFilterChange).toHaveBeenCalledWith('status', null)
  })

  it('falls back to the raw key/value when no matching filterDef/option is found', () => {
    render(
      <ListToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        activeFilters={{ unknownKey: 'unknownValue' }}
        onFilterChange={vi.fn()}
        onClearAll={vi.fn()}
      />,
    )
    expect(screen.getByText('unknownKey:')).toBeInTheDocument()
    expect(screen.getByText('unknownValue')).toBeInTheDocument()
  })

  it('calls onClearAll when "Limpar tudo" is clicked', async () => {
    const onClearAll = vi.fn()
    render(
      <ListToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        filterDefs={FILTER_DEFS}
        activeFilters={{ status: 'active' }}
        onFilterChange={vi.fn()}
        onClearAll={onClearAll}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Limpar tudo' }))
    expect(onClearAll).toHaveBeenCalledOnce()
  })

  it('shows "Nenhum resultado" when filteredCount is 0', () => {
    render(
      <ListToolbar
        searchQuery="xyz"
        onSearchChange={vi.fn()}
        activeFilters={{}}
        onFilterChange={vi.fn()}
        onClearAll={vi.fn()}
        filteredCount={0}
        totalCount={10}
      />,
    )
    expect(screen.getByText('Nenhum resultado')).toBeInTheDocument()
  })

  it('shows the result count summary (plural)', () => {
    render(
      <ListToolbar
        searchQuery="ana"
        onSearchChange={vi.fn()}
        activeFilters={{}}
        onFilterChange={vi.fn()}
        onClearAll={vi.fn()}
        filteredCount={3}
        totalCount={10}
      />,
    )
    expect(screen.getByText('3 de 10 resultados')).toBeInTheDocument()
  })

  it('shows the result count summary (singular)', () => {
    render(
      <ListToolbar
        searchQuery="ana"
        onSearchChange={vi.fn()}
        activeFilters={{}}
        onFilterChange={vi.fn()}
        onClearAll={vi.fn()}
        filteredCount={1}
        totalCount={1}
      />,
    )
    expect(screen.getByText('1 de 1 resultado')).toBeInTheDocument()
  })

  it('does not show the result row when nothing is filtered and there are no badges', () => {
    render(
      <ListToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        activeFilters={{}}
        onFilterChange={vi.fn()}
        onClearAll={vi.fn()}
        filteredCount={10}
        totalCount={10}
      />,
    )
    expect(screen.queryByText(/de 10 resultado/)).not.toBeInTheDocument()
  })
})
