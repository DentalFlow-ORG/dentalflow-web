import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { FormField } from '@/components/common/FormField'
import { DatePickerInput } from '@/components/common/DatePickerInput'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { PlanUpgradeNotice } from '@/components/common/PlanUpgradeNotice'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { getCachedBillingStatus } from '@/features/billing/services/billing-status-cache'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  defaultLast30DaysRange,
  validateReportDateRange,
} from '@/lib/date-range-rules'
import {
  exportAppointmentsReport,
  exportFinanceReport,
  exportInventoryReport,
  exportInvoicesReport,
  exportLeadsReport,
} from '../services/reports.service'
import type {
  AppointmentsReportFilters,
  FinanceReportFilters,
  InventoryReportFilters,
  InvoicesReportFilters,
  LeadsReportFilters,
} from '../types/reports.types'
import { ReportCard } from '../components/ReportCard'

function FilterRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  )
}

function ReportSectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="whitespace-nowrap text-sm font-semibold text-foreground">{label}</h2>
      <div className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  )
}

export function ReportsPageContainer() {
  const { user } = useAuth()
  const isOwner = user?.role === 'OWNER'

  const planKey = getCachedBillingStatus()?.planKey
  if (user?.role !== 'ADMIN' && planKey === 'starter') {
    return <PlanUpgradeNotice title="Relatórios" />
  }

  const [financeFilters, setFinanceFilters] = useState<FinanceReportFilters>(() => defaultLast30DaysRange())
  const [apptFilters, setApptFilters] = useState<AppointmentsReportFilters>(() => defaultLast30DaysRange())
  const [invFilters, setInvFilters] = useState<InventoryReportFilters>({})
  const [leadsFilters, setLeadsFilters] = useState<LeadsReportFilters>(() => defaultLast30DaysRange())
  const [invoiceFilters, setInvoiceFilters] = useState<InvoicesReportFilters>(() => defaultLast30DaysRange())

  const financeError = validateReportDateRange(financeFilters.startDate, financeFilters.endDate, { allowFuture: false })
  const apptError = validateReportDateRange(apptFilters.startDate, apptFilters.endDate, { allowFuture: true })
  const leadsError = validateReportDateRange(leadsFilters.startDate, leadsFilters.endDate, { allowFuture: false })
  const invoiceError = validateReportDateRange(invoiceFilters.startDate, invoiceFilters.endDate, { allowFuture: false })

  const reportCount = isOwner ? 5 : 4

  return (
    <AppPage spacing="loose">
      <AppPageHeader
        eyebrow="Dados e exportação"
        title="Relatórios"
        description="Exporte dados financeiros, agendamentos, leads, estoque e notas fiscais para analisar a clínica com segurança fora da plataforma."
      />

      <p className="text-sm text-muted-foreground">{reportCount} relatórios disponíveis</p>

      <InlineFeedback tone="info">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Os relatórios podem conter dados pessoais e financeiros da clínica. Compartilhe
            os arquivos apenas com pessoas autorizadas e mantenha os dados protegidos conforme
            a LGPD.
          </span>
        </div>
      </InlineFeedback>

      {/* ── Finance report ── */}
      <section>
        <ReportSectionHeader label="Financeiro" />
        {isOwner ? (
          <ReportCard
            title="Relatório financeiro"
            description="Receitas, despesas e resultado líquido por período."
            tone="primary"
            error={financeError}
            onExport={() => exportFinanceReport(financeFilters)}
            disabled={!!financeError}
          >
            <FilterRow>
              <FormField label="Data inicial" htmlFor="fin-start">
                <DatePickerInput
                  id="fin-start"
                  value={financeFilters.startDate ?? ''}
                  onValueChange={(v) =>
                    setFinanceFilters((f) => ({ ...f, startDate: v || undefined }))
                  }
                />
              </FormField>
              <FormField label="Data final" htmlFor="fin-end">
                <DatePickerInput
                  id="fin-end"
                  value={financeFilters.endDate ?? ''}
                  onValueChange={(v) =>
                    setFinanceFilters((f) => ({ ...f, endDate: v || undefined }))
                  }
                />
              </FormField>
              <FormField label="Tipo" htmlFor="fin-type">
                <Select
                  value={financeFilters.type ?? 'all'}
                  onValueChange={(v) =>
                    setFinanceFilters((f) => ({
                      ...f,
                      type: v === 'all' ? undefined : (v as 'INCOME' | 'EXPENSE'),
                    }))
                  }
                >
                  <SelectTrigger id="fin-type">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="INCOME">Receita</SelectItem>
                    <SelectItem value="EXPENSE">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Status" htmlFor="fin-status">
                <Select
                  value={financeFilters.status ?? 'all'}
                  onValueChange={(v) =>
                    setFinanceFilters((f) => ({
                      ...f,
                      status: v === 'all' ? undefined : (v as 'PENDING' | 'PAID' | 'CANCELED'),
                    }))
                  }
                >
                  <SelectTrigger id="fin-status">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="PAID">Pago</SelectItem>
                    <SelectItem value="CANCELED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </FilterRow>
          </ReportCard>
        ) : (
          <InlineFeedback tone="info">
            O relatório financeiro está disponível apenas para proprietários da clínica.
          </InlineFeedback>
        )}
      </section>

      {/* ── Appointments report ── */}
      <section>
        <ReportSectionHeader label="Agendamentos" />
        <ReportCard
          title="Relatório de agendamentos"
          description="Consultas por período com status e informações de pagamento. Não inclui notas clínicas."
          tone="info"
          error={apptError}
          onExport={() => exportAppointmentsReport(apptFilters)}
          disabled={!!apptError}
        >
          <FilterRow>
            <FormField label="Data inicial" htmlFor="appt-start">
              <DatePickerInput
                id="appt-start"
                value={apptFilters.startDate ?? ''}
                onValueChange={(v) =>
                  setApptFilters((f) => ({ ...f, startDate: v || undefined }))
                }
              />
            </FormField>
            <FormField label="Data final" htmlFor="appt-end">
              <DatePickerInput
                id="appt-end"
                value={apptFilters.endDate ?? ''}
                onValueChange={(v) =>
                  setApptFilters((f) => ({ ...f, endDate: v || undefined }))
                }
              />
            </FormField>
            <FormField label="Status" htmlFor="appt-status">
              <Select
                value={apptFilters.status ?? 'all'}
                onValueChange={(v) =>
                  setApptFilters((f) => ({ ...f, status: v === 'all' ? undefined : v }))
                }
              >
                <SelectTrigger id="appt-status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                  <SelectItem value="COMPLETED">Concluído</SelectItem>
                  <SelectItem value="CANCELED">Cancelado</SelectItem>
                  <SelectItem value="NO_SHOW">Não compareceu</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FilterRow>
        </ReportCard>
      </section>

      {/* ── Inventory report ── */}
      <section>
        <ReportSectionHeader label="Estoque" />
        <ReportCard
          title="Relatório de estoque"
          description="Produtos, quantidades, validade e status de criticidade."
          tone="warning"
          onExport={() => exportInventoryReport(invFilters)}
        >
          <FilterRow>
            <FormField label="Status" htmlFor="inv-status">
              <Select
                value={invFilters.status ?? 'all'}
                onValueChange={(v) =>
                  setInvFilters((f) => ({ ...f, status: v === 'all' ? undefined : v }))
                }
              >
                <SelectTrigger id="inv-status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ACTIVE">Normal</SelectItem>
                  <SelectItem value="LOW">Estoque baixo</SelectItem>
                  <SelectItem value="EMPTY">Zerado</SelectItem>
                  <SelectItem value="EXPIRING">Vencimento próximo</SelectItem>
                  <SelectItem value="EXPIRED">Vencido</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FilterRow>
        </ReportCard>
      </section>

      {/* ── Leads report ── */}
      <section>
        <ReportSectionHeader label="Leads" />
        <ReportCard
          title="Relatório de leads"
          description="Lista de leads com origem, status e informações de contato. Não inclui notas livres por padrão."
          tone="success"
          error={leadsError}
          onExport={() => exportLeadsReport(leadsFilters)}
          disabled={!!leadsError}
        >
          <FilterRow>
            <FormField label="Data inicial" htmlFor="leads-start">
              <DatePickerInput
                id="leads-start"
                value={leadsFilters.startDate ?? ''}
                onValueChange={(v) =>
                  setLeadsFilters((f) => ({ ...f, startDate: v || undefined }))
                }
              />
            </FormField>
            <FormField label="Data final" htmlFor="leads-end">
              <DatePickerInput
                id="leads-end"
                value={leadsFilters.endDate ?? ''}
                onValueChange={(v) =>
                  setLeadsFilters((f) => ({ ...f, endDate: v || undefined }))
                }
              />
            </FormField>
            <FormField label="Status" htmlFor="leads-status">
              <Select
                value={leadsFilters.status ?? 'all'}
                onValueChange={(v) =>
                  setLeadsFilters((f) => ({ ...f, status: v === 'all' ? undefined : v }))
                }
              >
                <SelectTrigger id="leads-status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="NEW">Novo</SelectItem>
                  <SelectItem value="CONTACTED">Em contato</SelectItem>
                  <SelectItem value="SCHEDULED">Agendado</SelectItem>
                  <SelectItem value="CONVERTED">Convertido</SelectItem>
                  <SelectItem value="LOST">Perdido</SelectItem>
                  <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Origem" htmlFor="leads-source">
              <Select
                value={leadsFilters.source ?? 'all'}
                onValueChange={(v) =>
                  setLeadsFilters((f) => ({ ...f, source: v === 'all' ? undefined : v }))
                }
              >
                <SelectTrigger id="leads-source">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as origens</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="WEBSITE">Site</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                  <SelectItem value="GOOGLE">Google</SelectItem>
                  <SelectItem value="REFERRAL">Indicação</SelectItem>
                  <SelectItem value="IMPORT">Importação</SelectItem>
                  <SelectItem value="OTHER">Outro</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FilterRow>
        </ReportCard>
      </section>

      {/* ── Fiscal invoices report ── */}
      <section>
        <ReportSectionHeader label="Notas fiscais" />
        <ReportCard
          title="Relatório de notas fiscais"
          description="Registros internos de notas fiscais com status, competência e valor."
          notice="Relatório interno. Não substitui documentos fiscais oficiais emitidos pela prefeitura."
          tone="neutral"
          error={invoiceError}
          onExport={() => exportInvoicesReport(invoiceFilters)}
          disabled={!!invoiceError}
        >
          <FilterRow>
            <FormField label="Competência inicial" htmlFor="inv-start">
              <DatePickerInput
                id="inv-start"
                value={invoiceFilters.startDate ?? ''}
                onValueChange={(v) =>
                  setInvoiceFilters((f) => ({ ...f, startDate: v || undefined }))
                }
              />
            </FormField>
            <FormField label="Competência final" htmlFor="inv-end">
              <DatePickerInput
                id="inv-end"
                value={invoiceFilters.endDate ?? ''}
                onValueChange={(v) =>
                  setInvoiceFilters((f) => ({ ...f, endDate: v || undefined }))
                }
              />
            </FormField>
            <FormField label="Status" htmlFor="inv-nf-status">
              <Select
                value={invoiceFilters.status ?? 'all'}
                onValueChange={(v) =>
                  setInvoiceFilters((f) => ({ ...f, status: v === 'all' ? undefined : v }))
                }
              >
                <SelectTrigger id="inv-nf-status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                  <SelectItem value="READY_TO_ISSUE">Pronto para emitir</SelectItem>
                  <SelectItem value="SIMULATED">Simulado</SelectItem>
                  <SelectItem value="ISSUED">Emitido</SelectItem>
                  <SelectItem value="FAILED">Falhou</SelectItem>
                  <SelectItem value="CANCELED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FilterRow>
        </ReportCard>
      </section>

      <InlineFeedback tone="warning">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            Os arquivos exportados respeitam os filtros aplicados e podem conter até 5.000
            registros por relatório.
          </span>
        </div>
      </InlineFeedback>
    </AppPage>
  )
}
