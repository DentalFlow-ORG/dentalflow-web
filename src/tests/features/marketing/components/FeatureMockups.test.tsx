import { render, screen } from '@/test-utils/render-utils'

import { FeatureMockup } from '@/features/marketing/components/FeatureMockups'

describe('FeatureMockup', () => {
  it('renders the agenda mockup', () => {
    render(<FeatureMockup featureId="agenda" />)
    expect(screen.getByText('DentalFlow · Agenda · Hoje')).toBeInTheDocument()
  })

  it('renders the prontuarios mockup', () => {
    render(<FeatureMockup featureId="prontuarios" />)
    expect(screen.getByText('DentalFlow · Prontuário')).toBeInTheDocument()
    expect(screen.getByText('Evoluções clínicas')).toBeInTheDocument()
  })

  it('renders the financeiro mockup', () => {
    render(<FeatureMockup featureId="financeiro" />)
    expect(screen.getByText('DentalFlow · Financeiro · Este mês')).toBeInTheDocument()
  })

  it('renders the pacientes mockup', () => {
    render(<FeatureMockup featureId="pacientes" />)
    expect(screen.getByText('DentalFlow · Pacientes')).toBeInTheDocument()
  })

  it('renders the relatorios mockup', () => {
    render(<FeatureMockup featureId="relatorios" />)
    expect(screen.getByText('Consultas realizadas por semana')).toBeInTheDocument()
  })

  it('renders the ia mockup', () => {
    render(<FeatureMockup featureId="ia" />)
    expect(screen.getByText('Análise gerada · Maio 2026')).toBeInTheDocument()
  })

  it('renders the estoque mockup', () => {
    render(<FeatureMockup featureId="estoque" />)
    expect(screen.getByText('Itens do estoque')).toBeInTheDocument()
  })

  it('renders the leads mockup', () => {
    render(<FeatureMockup featureId="leads" />)
    expect(screen.getByText('DentalFlow · CRM · Pipeline de leads')).toBeInTheDocument()
  })

  it('renders the controle-fiscal mockup', () => {
    render(<FeatureMockup featureId="controle-fiscal" />)
    expect(screen.getByText('Registros fiscais')).toBeInTheDocument()
  })

  it('renders the whatsapp mockup', () => {
    render(<FeatureMockup featureId="whatsapp" />)
    expect(screen.getByText('Automações ativas')).toBeInTheDocument()
  })

  it('renders the fallback mockup for an unknown featureId', () => {
    render(<FeatureMockup featureId="unknown-feature" />)
    expect(screen.getByText('Atividade dos módulos')).toBeInTheDocument()
  })
})
