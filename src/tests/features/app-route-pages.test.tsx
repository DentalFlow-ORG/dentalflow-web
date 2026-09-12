import type { ReactNode } from 'react'

import { render, screen } from '@/test-utils/render-utils'

// Route pages are thin by design: they exist to attach one container (and, where
// the route is parameterised, to hand it the route parameter). Nothing else
// asserts that wiring — a page pointed at the wrong container, or one that drops
// its route parameter, renders a plausible-looking screen with the wrong data and
// only fails in the browser. Each container is stubbed so these cases test the
// wiring rather than re-testing container behavior covered elsewhere.

function stub(testId: string) {
  return () => <div data-testid={testId} />
}

vi.mock('@/features/admin/containers/AdminClinicsPageContainer', () => ({
  AdminClinicsPageContainer: stub('admin-clinics'),
}))
vi.mock('@/features/admin/containers/AdminDashboardPageContainer', () => ({
  AdminDashboardPageContainer: stub('admin-dashboard'),
}))
vi.mock('@/features/admin/containers/AdminFinancePageContainer', () => ({
  AdminFinancePageContainer: stub('admin-finance'),
}))
vi.mock('@/features/admin/containers/AdminUsersPageContainer', () => ({
  AdminUsersPageContainer: stub('admin-users'),
}))
vi.mock('@/features/billing/containers/SubscriptionPageContainer', () => ({
  SubscriptionPageContainer: stub('subscription'),
}))
vi.mock('@/features/clinical-records/containers/ClinicalRecordsListContainer', () => ({
  ClinicalRecordsListContainer: stub('clinical-records-list'),
}))
vi.mock('@/features/compliance/containers/CompliancePageContainer', () => ({
  CompliancePageContainer: stub('compliance'),
}))
vi.mock('@/features/dashboard/containers/DashboardPageContainer', () => ({
  DashboardPageContainer: stub('dashboard'),
}))
vi.mock('@/features/dashboard/containers/DentistHomePageContainer', () => ({
  DentistHomePageContainer: stub('dentist-home'),
}))
vi.mock('@/features/finance/containers/FinancePageContainer', () => ({
  FinancePageContainer: stub('finance'),
}))
vi.mock('@/features/fiscal/containers/FiscalInvoicesPageContainer', () => ({
  FiscalInvoicesPageContainer: stub('fiscal-invoices'),
}))
vi.mock('@/features/fiscal/containers/FiscalProfilePageContainer', () => ({
  FiscalProfilePageContainer: stub('fiscal-profile'),
}))
vi.mock('@/features/inventory/containers/InventoryPageContainer', () => ({
  InventoryPageContainer: stub('inventory'),
}))
vi.mock('@/features/patients/containers/PatientsAttentionContainer', () => ({
  PatientsAttentionContainer: stub('patients-attention'),
}))
vi.mock('@/features/patients/containers/PatientsPageContainer', () => ({
  PatientsPageContainer: stub('patients'),
}))
vi.mock('@/features/reports/containers/ReportsPageContainer', () => ({
  ReportsPageContainer: stub('reports'),
}))
vi.mock('@/features/scheduling/containers/AppointmentsPageContainer', () => ({
  AppointmentsPageContainer: stub('appointments'),
}))
vi.mock('@/features/scheduling/containers/SchedulePageContainer', () => ({
  SchedulePageContainer: stub('schedule'),
}))
vi.mock('@/features/settings/containers/SettingsPageContainer', () => ({
  SettingsPageContainer: stub('settings'),
}))
vi.mock('@/features/team/containers/TeamPageContainer', () => ({
  TeamPageContainer: stub('team'),
}))

// Parameterised routes: capture what the page forwards to its container.
const forwarded = { editor: '', print: '' }

vi.mock('@/features/clinical-records/containers/ClinicalRecordEditorContainer', () => ({
  ClinicalRecordEditorContainer: ({ recordId }: { recordId: string }) => {
    forwarded.editor = recordId
    return <div data-testid="clinical-record-editor" />
  },
}))
vi.mock('@/features/clinical-records/containers/ClinicalRecordPrintContainer', () => ({
  ClinicalRecordPrintContainer: ({ recordId }: { recordId: string }) => {
    forwarded.print = recordId
    return <div data-testid="clinical-record-print" />
  },
}))

const mockParams = vi.fn()
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useParams: () => mockParams(),
    // Rendered outside a RouterProvider here; keep the href so navigation
    // targets stay assertable.
    Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  }
})

import { AdminClinicsPage } from '@/features/admin/pages/AdminClinicsPage'
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'
import { AdminFinancePage } from '@/features/admin/pages/AdminFinancePage'
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage'
import { SubscriptionPage } from '@/features/billing/pages/SubscriptionPage'
import { ClinicalRecordEditorPage } from '@/features/clinical-records/pages/ClinicalRecordEditorPage'
import { ClinicalRecordPrintPage } from '@/features/clinical-records/pages/ClinicalRecordPrintPage'
import { ClinicalRecordsPage } from '@/features/clinical-records/pages/ClinicalRecordsPage'
import { CompliancePage } from '@/features/compliance/pages/CompliancePage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { DentistHomePage } from '@/features/dashboard/pages/DentistHomePage'
import { FinancePage } from '@/features/finance/pages/FinancePage'
import { FiscalInvoicesPage } from '@/features/fiscal/pages/FiscalInvoicesPage'
import { FiscalProfilePage } from '@/features/fiscal/pages/FiscalProfilePage'
import { InventoryPage } from '@/features/inventory/pages/InventoryPage'
import { PatientsAttentionPage } from '@/features/patients/pages/PatientsAttentionPage'
import { PatientsPage } from '@/features/patients/pages/PatientsPage'
import { ReportsPage } from '@/features/reports/pages/ReportsPage'
import { AppointmentsPage } from '@/features/scheduling/pages/AppointmentsPage'
import { SchedulePage } from '@/features/scheduling/pages/SchedulePage'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'
import { TeamPage } from '@/features/team/pages/TeamPage'

describe('route pages render their own container', () => {
  const PAGES = [
    ['AdminClinicsPage', AdminClinicsPage, 'admin-clinics'],
    ['AdminDashboardPage', AdminDashboardPage, 'admin-dashboard'],
    ['AdminFinancePage', AdminFinancePage, 'admin-finance'],
    ['AdminUsersPage', AdminUsersPage, 'admin-users'],
    ['SubscriptionPage', SubscriptionPage, 'subscription'],
    ['ClinicalRecordsPage', ClinicalRecordsPage, 'clinical-records-list'],
    ['CompliancePage', CompliancePage, 'compliance'],
    ['DashboardPage', DashboardPage, 'dashboard'],
    ['DentistHomePage', DentistHomePage, 'dentist-home'],
    ['FinancePage', FinancePage, 'finance'],
    ['FiscalInvoicesPage', FiscalInvoicesPage, 'fiscal-invoices'],
    ['InventoryPage', InventoryPage, 'inventory'],
    ['PatientsAttentionPage', PatientsAttentionPage, 'patients-attention'],
    ['PatientsPage', PatientsPage, 'patients'],
    ['ReportsPage', ReportsPage, 'reports'],
    ['AppointmentsPage', AppointmentsPage, 'appointments'],
    ['SchedulePage', SchedulePage, 'schedule'],
    ['SettingsPage', SettingsPage, 'settings'],
    ['TeamPage', TeamPage, 'team'],
  ] as const

  it.each(PAGES)('%s mounts the %s container', (_name, Page, testId) => {
    render(<Page />)
    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  it('wires every page to a different container', () => {
    expect(new Set(PAGES.map(([, , testId]) => testId)).size).toBe(PAGES.length)
  })
})

describe('FiscalProfilePage', () => {
  it('frames the fiscal profile container with a heading and a way back to settings', () => {
    render(<FiscalProfilePage />)
    expect(screen.getByRole('heading', { name: 'Perfil Fiscal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /configurações/i })).toHaveAttribute(
      'href',
      '/app/configuracoes',
    )
    expect(screen.getByTestId('fiscal-profile')).toBeInTheDocument()
  })
})

describe('parameterised clinical record routes', () => {
  beforeEach(() => {
    forwarded.editor = ''
    forwarded.print = ''
  })

  it('forwards the route record id to the editor container', () => {
    mockParams.mockReturnValue({ clinicalRecordId: 'record-42' })
    render(<ClinicalRecordEditorPage />)
    expect(forwarded.editor).toBe('record-42')
  })

  it('forwards the route record id to the print container', () => {
    mockParams.mockReturnValue({ clinicalRecordId: 'record-77' })
    render(<ClinicalRecordPrintPage />)
    expect(forwarded.print).toBe('record-77')
  })
})
