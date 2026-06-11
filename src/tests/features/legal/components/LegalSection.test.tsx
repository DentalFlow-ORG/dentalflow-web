import { render, screen } from '@/test-utils/render-utils'

import {
  LegalContactBlock,
  LegalList,
  LegalPageHeader,
  LegalSection,
  LegalTOC,
  LegalTable,
  legalInlineLinkClass,
} from '@/features/legal/components/LegalSection'

// ── legalInlineLinkClass ──────────────────────────────────────────────────────

describe('legalInlineLinkClass', () => {
  it('is a non-empty string', () => {
    expect(typeof legalInlineLinkClass).toBe('string')
    expect(legalInlineLinkClass.length).toBeGreaterThan(0)
  })
})

// ── LegalPageHeader ───────────────────────────────────────────────────────────

describe('LegalPageHeader', () => {
  const props = {
    badge: 'Legal',
    title: 'Termos de Uso',
    description: 'Condições de uso da plataforma.',
    lastUpdated: '01/05/2025',
  }

  it('renders the badge text', () => {
    render(<LegalPageHeader {...props} />)
    expect(screen.getByText('Legal')).toBeInTheDocument()
  })

  it('renders the title as an h1 heading', () => {
    render(<LegalPageHeader {...props} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Termos de Uso' })).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<LegalPageHeader {...props} />)
    expect(screen.getByText('Condições de uso da plataforma.')).toBeInTheDocument()
  })

  it('renders the last updated date', () => {
    render(<LegalPageHeader {...props} />)
    expect(screen.getByText(/Última atualização: 01\/05\/2025/)).toBeInTheDocument()
  })

  it('renders the Aviso disclaimer block', () => {
    render(<LegalPageHeader {...props} />)
    expect(screen.getByText(/Aviso/i)).toBeInTheDocument()
  })
})

// ── LegalSection ──────────────────────────────────────────────────────────────

describe('LegalSection', () => {
  it('renders the heading as h2', () => {
    render(<LegalSection title="Responsabilidades">conteúdo</LegalSection>)
    expect(screen.getByRole('heading', { level: 2, name: 'Responsabilidades' })).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <LegalSection title="Seção">
        <p>Texto da seção legal.</p>
      </LegalSection>,
    )
    expect(screen.getByText('Texto da seção legal.')).toBeInTheDocument()
  })

  it('applies the id prop to the section element', () => {
    const { container } = render(
      <LegalSection id="minha-secao" title="Seção">
        conteúdo
      </LegalSection>,
    )
    expect(container.querySelector('#minha-secao')).toBeInTheDocument()
  })
})

// ── LegalList ─────────────────────────────────────────────────────────────────

describe('LegalList', () => {
  const items = ['Item A', 'Item B', 'Item C']

  it('renders an unordered list by default', () => {
    render(<LegalList items={items} />)
    expect(screen.getByRole('list').tagName).toBe('UL')
  })

  it('renders an ordered list when ordered=true', () => {
    render(<LegalList items={items} ordered />)
    expect(screen.getByRole('list').tagName).toBe('OL')
  })

  it('renders all provided items', () => {
    render(<LegalList items={items} />)
    for (const item of items) {
      expect(screen.getByText(item)).toBeInTheDocument()
    }
  })
})

// ── LegalTable ────────────────────────────────────────────────────────────────

describe('LegalTable', () => {
  const headers = ['Coluna 1', 'Coluna 2']
  const rows = [
    ['Célula A', 'Célula B'],
    ['Célula C', 'Célula D'],
  ]

  it('renders all header cells', () => {
    render(<LegalTable headers={headers} rows={rows} />)
    for (const h of headers) {
      expect(screen.getByRole('columnheader', { name: h })).toBeInTheDocument()
    }
  })

  it('renders all row cells', () => {
    render(<LegalTable headers={headers} rows={rows} />)
    for (const cell of rows.flat()) {
      expect(screen.getByText(cell)).toBeInTheDocument()
    }
  })

  it('wraps the table in a div for horizontal overflow', () => {
    render(<LegalTable headers={headers} rows={rows} />)
    const table = screen.getByRole('table')
    expect(table.parentElement?.tagName).toBe('DIV')
  })
})

// ── LegalTOC ─────────────────────────────────────────────────────────────────

describe('LegalTOC', () => {
  const entries = [
    { id: 'introducao', label: 'Introdução' },
    { id: 'privacidade', label: 'Privacidade de Dados' },
  ]

  it('renders a nav landmark with aria-label="Índice do documento"', () => {
    render(<LegalTOC entries={entries} />)
    expect(screen.getByRole('navigation', { name: 'Índice do documento' })).toBeInTheDocument()
  })

  it('renders each entry as an anchor with the correct href', () => {
    render(<LegalTOC entries={entries} />)
    for (const { id, label } of entries) {
      const link = screen.getByRole('link', { name: label })
      expect(link).toHaveAttribute('href', `#${id}`)
    }
  })
})

// ── LegalContactBlock ─────────────────────────────────────────────────────────

describe('LegalContactBlock', () => {
  it('renders the email as a mailto link', () => {
    render(<LegalContactBlock email="contato@exemplo.com" />)
    const link = screen.getByRole('link', { name: 'contato@exemplo.com' })
    expect(link).toHaveAttribute('href', 'mailto:contato@exemplo.com')
  })

  it('renders a custom message when provided', () => {
    render(
      <LegalContactBlock
        email="contato@exemplo.com"
        message="Mensagem personalizada de contato."
      />,
    )
    expect(screen.getByText('Mensagem personalizada de contato.')).toBeInTheDocument()
  })

  it('renders the default message when none is provided', () => {
    render(<LegalContactBlock email="contato@exemplo.com" />)
    expect(screen.getByText(/Se tiver dúvidas sobre este documento/i)).toBeInTheDocument()
  })
})
