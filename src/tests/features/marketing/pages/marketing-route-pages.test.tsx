import { featureDetailContents, roleContents } from '@/features/marketing/data/public-content'
import { AgendaFeaturePage } from '@/features/marketing/pages/AgendaFeaturePage'
import { AiFeaturePage } from '@/features/marketing/pages/AiFeaturePage'
import { ClinicalRecordsFeaturePage } from '@/features/marketing/pages/ClinicalRecordsFeaturePage'
import { FinanceFeaturePage } from '@/features/marketing/pages/FinanceFeaturePage'
import { FiscalFeaturePage } from '@/features/marketing/pages/FiscalFeaturePage'
import { ForDentistPage } from '@/features/marketing/pages/ForDentistPage'
import { ForManagerPage } from '@/features/marketing/pages/ForManagerPage'
import { ForNewClinicPage } from '@/features/marketing/pages/ForNewClinicPage'
import { ForSecretaryPage } from '@/features/marketing/pages/ForSecretaryPage'
import { InventoryFeaturePage } from '@/features/marketing/pages/InventoryFeaturePage'
import { PatientsFeaturePage } from '@/features/marketing/pages/PatientsFeaturePage'
import { ReportsFeaturePage } from '@/features/marketing/pages/ReportsFeaturePage'
import { WhatsappFeaturePage } from '@/features/marketing/pages/WhatsappFeaturePage'
import { render } from '@/test-utils/render-utils'

// These route pages carry two pieces of real behavior: the SEO title/description
// they publish, and which content record they hand to the shared presentation
// page. Both are invisible until someone opens the route in production, and a
// wrong content key silently renders another module's marketing copy.
//
// The shared presentation pages are stubbed so these cases assert the wiring
// rather than re-rendering marketing markup already covered by
// RolePage.test.tsx and FeatureDetailPage.test.tsx.

const lastContent = { role: null as unknown, feature: null as unknown }

vi.mock('@/features/marketing/pages/RolePage', () => ({
  RolePage: ({ content }: { content: unknown }) => {
    lastContent.role = content
    return <div data-testid="role-page" />
  },
}))

vi.mock('@/features/marketing/pages/FeatureDetailPage', () => ({
  FeatureDetailPage: ({ content }: { content: unknown }) => {
    lastContent.feature = content
    return <div data-testid="feature-detail-page" />
  },
}))

function describedBy() {
  return document.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''
}

beforeEach(() => {
  lastContent.role = null
  lastContent.feature = null
  document.title = ''
})

describe('marketing role route pages', () => {
  const ROLE_PAGES = [
    ['ForSecretaryPage', ForSecretaryPage, roleContents.secretaria],
    ['ForDentistPage', ForDentistPage, roleContents.dentistas],
    ['ForManagerPage', ForManagerPage, roleContents.gestores],
    ['ForNewClinicPage', ForNewClinicPage, roleContents['clinicas-em-abertura']],
  ] as const

  it.each(ROLE_PAGES)('%s renders RolePage with its own role content', (_name, Page, expected) => {
    render(<Page />)
    expect(lastContent.role).toBe(expected)
    expect(expected).toBeDefined()
  })

  it.each(ROLE_PAGES)('%s publishes a distinct page title and description', (_name, Page) => {
    render(<Page />)
    expect(document.title).toMatch(/^DentalFlow \| .+/)
    expect(describedBy().length).toBeGreaterThan(0)
  })

  it('gives every role page a different title', () => {
    const titles = ROLE_PAGES.map(([, Page]) => {
      render(<Page />)
      return document.title
    })
    expect(new Set(titles).size).toBe(ROLE_PAGES.length)
  })
})

describe('marketing feature route pages', () => {
  const FEATURE_PAGES = [
    ['AgendaFeaturePage', AgendaFeaturePage, featureDetailContents.agenda],
    ['AiFeaturePage', AiFeaturePage, featureDetailContents.ia],
    ['ClinicalRecordsFeaturePage', ClinicalRecordsFeaturePage, featureDetailContents.prontuarios],
    ['FinanceFeaturePage', FinanceFeaturePage, featureDetailContents.financeiro],
    ['FiscalFeaturePage', FiscalFeaturePage, featureDetailContents['controle-fiscal']],
    ['InventoryFeaturePage', InventoryFeaturePage, featureDetailContents.estoque],
    ['PatientsFeaturePage', PatientsFeaturePage, featureDetailContents.pacientes],
    ['ReportsFeaturePage', ReportsFeaturePage, featureDetailContents.relatorios],
    ['WhatsappFeaturePage', WhatsappFeaturePage, featureDetailContents.whatsapp],
  ] as const

  it.each(FEATURE_PAGES)(
    '%s renders FeatureDetailPage with its own feature content',
    (_name, Page, expected) => {
      render(<Page />)
      expect(lastContent.feature).toBe(expected)
      expect(expected).toBeDefined()
    },
  )

  it.each(FEATURE_PAGES)('%s publishes a page title and description', (_name, Page) => {
    render(<Page />)
    expect(document.title).toMatch(/^DentalFlow \| .+/)
    expect(describedBy().length).toBeGreaterThan(0)
  })

  it('gives every feature page a different title', () => {
    const titles = FEATURE_PAGES.map(([, Page]) => {
      render(<Page />)
      return document.title
    })
    expect(new Set(titles).size).toBe(FEATURE_PAGES.length)
  })
})
