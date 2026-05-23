import { ClipboardList, Cookie, ShieldAlert } from 'lucide-react'
import { useState } from 'react'

import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { cn } from '@/lib/utils'

import { AuditLogsTab } from '../components/AuditLogsTab'
import { CookieConsentLogsTab } from '../components/CookieConsentLogsTab'
import { PrivacyRequestsTab } from '../components/PrivacyRequestsTab'

type Tab = 'requests' | 'audit' | 'cookies'

const TABS: { id: Tab; label: string; icon: React.ElementType; description: string }[] = [
  {
    id: 'requests',
    label: 'Solicitações LGPD',
    icon: ShieldAlert,
    description: 'Solicitações de titulares de dados (Art. 18 LGPD)',
  },
  {
    id: 'audit',
    label: 'Auditoria',
    icon: ClipboardList,
    description: 'Registro de eventos do sistema',
  },
  {
    id: 'cookies',
    label: 'Consentimentos',
    icon: Cookie,
    description: 'Logs de aceite de cookies',
  },
]

export function CompliancePageContainer() {
  const [activeTab, setActiveTab] = useState<Tab>('requests')

  return (
    <AppPage spacing="normal">
      <AppPageHeader
        eyebrow="Administração"
        title="Compliance"
        description="Gestão de conformidade LGPD — solicitações de titulares, auditoria de acessos e consentimentos."
      />

      {/* Tab nav */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Abas de compliance">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
              )}
              aria-selected={activeTab === id}
              role="tab"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab description */}
      <p className="text-sm text-muted-foreground">
        {TABS.find((t) => t.id === activeTab)?.description}
      </p>

      {/* Tab content */}
      <div role="tabpanel">
        {activeTab === 'requests' && <PrivacyRequestsTab />}
        {activeTab === 'audit' && <AuditLogsTab />}
        {activeTab === 'cookies' && <CookieConsentLogsTab />}
      </div>
    </AppPage>
  )
}
