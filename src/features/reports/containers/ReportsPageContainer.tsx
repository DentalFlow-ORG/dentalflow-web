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

  return (
    <AppPage spacing="loose">
      <AppPageHeader
        title="Relatórios"
        description="Exporte dados operacionais e financeiros da clínica com segurança."
      />

      {/* LGPD notice */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Exporte apenas quando necessário e compartilhe os arquivos com segurança. Os
          relatórios não incluem prontuários clínicos, diagnósticos ou dados sensíveis de
          saúde.
        </p>
      </div>

      {/* ── Finance report (OWNER only) ── */}
      {isOwner && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Financeiro
          </h2>
          <ReportCard
            title="Relatório financeiro"
            description="Receitas, despesas e resultado líquido por período."
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
            {financeError && <InlineFeedback tone="error">{financeError}</InlineFeedback>}
          </ReportCard>
        </section>
      )}

      {/* ── Appointments report ── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Agendamentos
        </h2>
        <ReportCard
          title="Relatório de agendamentos"
          description="Consultas por período com status e informações de pagamento. Não inclui notas clínicas."
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
          {apptError && <InlineFeedback tone="error">{apptError}</InlineFeedback>}
        </ReportCard>
      </section>

      {/* ── Inventory report ── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Estoque
        </h2>
        <ReportCard
          title="Relatório de estoque"
          description="Produtos, quantidades, validade e status de criticidade."
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
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Leads
        </h2>
        <ReportCard
          title="Relatório de leads"
          description="Lista de leads com origem, status e informações de contato. Não inclui notas livres por padrão."
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
          {leadsError && <InlineFeedback tone="error">{leadsError}</InlineFeedback>}
        </ReportCard>
      </section>

      {/* ── Fiscal invoices report ── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Notas fiscais internas
        </h2>
        <ReportCard
          title="Relatório de notas fiscais"
          description="Registros internos de notas fiscais com status, competência e valor."
          notice="Relatório interno. Não substitui documentos fiscais oficiais emitidos pela prefeitura."
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
          {invoiceError && <InlineFeedback tone="error">{invoiceError}</InlineFeedback>}
        </ReportCard>
      </section>

      {/* Footer notice */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Os relatórios exportam no máximo 5.000 registros por vez. Para períodos maiores,
          aplique filtros de data.
        </span>
      </div>
    </AppPage>
  )
}
