import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/components/layout/SiteFooter', () => ({
  SiteFooter: () => <footer>Mock footer</footer>,
}))

vi.mock('@/features/theme/useForceLightTheme', () => ({
  useForceLightTheme: () => {},
}))

vi.mock('@/components/brand/BrandLink', () => ({
  BrandLink: () => <a href="/">DentalFlow</a>,
}))

import { CookiePolicyPage } from '@/features/legal/pages/CookiePolicyPage'
import { DataProcessingPage } from '@/features/legal/pages/DataProcessingPage'
import { DataRightsPage } from '@/features/legal/pages/DataRightsPage'
import { DpoContactPage } from '@/features/legal/pages/DpoContactPage'
import { PrivacyPolicyPage } from '@/features/legal/pages/PrivacyPolicyPage'
import { SecurityPage } from '@/features/legal/pages/SecurityPage'
import { TermsOfUsePage } from '@/features/legal/pages/TermsOfUsePage'

describe('CookiePolicyPage', () => {
  it('renders the page title and key sections', () => {
    render(<CookiePolicyPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Política de Cookies' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/cookies necessários/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/dentalflow_access_token/i)).toBeInTheDocument()
  })
})

describe('DataProcessingPage', () => {
  it('renders the page title', () => {
    render(<DataProcessingPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Tratamento de Dados — DPA' }),
    ).toBeInTheDocument()
  })
})

describe('DataRightsPage', () => {
  it('renders the page title and links to the DPO contact page', () => {
    render(<DataRightsPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Direitos do Titular de Dados' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /encarregado/i })).toHaveAttribute(
      'href',
      '/encarregado',
    )
  })
})

describe('SecurityPage', () => {
  it('renders the page title and links to the privacy policy', () => {
    render(<SecurityPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Segurança da Plataforma' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /política de privacidade/i })).toHaveAttribute(
      'href',
      '/politica-de-privacidade',
    )
  })
})

describe('PrivacyPolicyPage', () => {
  it('renders the page title', () => {
    render(<PrivacyPolicyPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Política de Privacidade' }),
    ).toBeInTheDocument()
  })
})

describe('TermsOfUsePage', () => {
  it('renders the page title', () => {
    render(<TermsOfUsePage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Termos de Uso' })).toBeInTheDocument()
  })
})

describe('DpoContactPage', () => {
  it('renders the page title and DPO email', () => {
    render(<DpoContactPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Encarregado de Proteção de Dados' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('privacidade@dentalflow.com.br').length).toBeGreaterThan(0)
  })

  it('omits CNPJ and address rows when the placeholder flags are unset (current default config)', () => {
    render(<DpoContactPage />)
    expect(screen.queryByText('CNPJ:')).not.toBeInTheDocument()
    expect(screen.queryByText('Endereço:')).not.toBeInTheDocument()
  })
})

describe('legal pages — CNPJ/address disclosure once companyStatus is confirmed', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('shows the CNPJ and address rows on DpoContactPage once companyStatus flags are true', async () => {
    vi.doMock('@/config/company', async () => {
      const actual = await vi.importActual<typeof import('@/config/company')>('@/config/company')
      return {
        ...actual,
        companyStatus: {
          ...actual.companyStatus,
          hasRealDocumentNumber: true,
          hasRealAddress: true,
        },
      }
    })
    const { DpoContactPage: MockedDpoContactPage } = await import(
      '@/features/legal/pages/DpoContactPage'
    )
    render(<MockedDpoContactPage />)
    expect(screen.getByText('CNPJ:')).toBeInTheDocument()
    expect(screen.getByText('Endereço:')).toBeInTheDocument()
    vi.doUnmock('@/config/company')
  })

  it('includes the CNPJ inline on PrivacyPolicyPage once hasRealDocumentNumber is true', async () => {
    vi.doMock('@/config/company', async () => {
      const actual = await vi.importActual<typeof import('@/config/company')>('@/config/company')
      return {
        ...actual,
        companyStatus: { ...actual.companyStatus, hasRealDocumentNumber: true },
      }
    })
    const { PrivacyPolicyPage: MockedPrivacyPolicyPage } = await import(
      '@/features/legal/pages/PrivacyPolicyPage'
    )
    render(<MockedPrivacyPolicyPage />)
    expect(screen.getAllByText(/CNPJ/i).length).toBeGreaterThan(0)
    vi.doUnmock('@/config/company')
  })

  it('includes the CNPJ inline on TermsOfUsePage once hasRealDocumentNumber is true', async () => {
    vi.doMock('@/config/company', async () => {
      const actual = await vi.importActual<typeof import('@/config/company')>('@/config/company')
      return {
        ...actual,
        companyStatus: { ...actual.companyStatus, hasRealDocumentNumber: true },
      }
    })
    const { TermsOfUsePage: MockedTermsOfUsePage } = await import(
      '@/features/legal/pages/TermsOfUsePage'
    )
    render(<MockedTermsOfUsePage />)
    expect(screen.getAllByText(/CNPJ/i).length).toBeGreaterThan(0)
    vi.doUnmock('@/config/company')
  })
})
