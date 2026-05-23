import { useEffect, useMemo, useRef, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { ApiError } from '@/services/http'

import {
  cancelInvoice,
  createInvoice,
  getFiscalProfile,
  getFiscalSummary,
  getInvoice,
  listInvoices,
  markInvoiceReady,
  saveFiscalProfile,
  simulateInvoiceIssue,
  updateInvoice,
} from '../services/fiscal.service'
import type {
  FiscalProfilePayload,
  FiscalProfileResponse,
  FiscalSummary,
  InvoiceFilters,
  InvoicePayload,
  ServiceInvoice,
} from '../types/fiscal.types'

const PAGE_SIZE = 10

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function useFiscalInvoicesPage() {
  const { showAlert } = useGlobalAlerts()
  const [profileResponse, setProfileResponse] = useState<FiscalProfileResponse | null>(null)
  const [summary, setSummary] = useState<FiscalSummary | null>(null)
  const [invoices, setInvoices] = useState<ServiceInvoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<ServiceInvoice | null>(null)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [planBlocked, setPlanBlocked] = useState(false)
  const [filters, setFilters] = useState<InvoiceFilters>({ page: 1, limit: PAGE_SIZE })

  const isInitialLoad = useRef(true)

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / filters.limit)),
    [filters.limit, total],
  )

  function applyData([
    profile,
    summaryResponse,
    invoicesResponse,
  ]: Awaited<ReturnType<typeof loadFiscalData>>) {
    setProfileResponse(profile)
    setSummary(summaryResponse)
    setInvoices(invoicesResponse.data)
    setTotal(invoicesResponse.total)
  }

  function load() {
    setIsLoading(true)
    setLoadError(null)
    loadFiscalData(filters)
      .then(applyData)
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 403) {
          setPlanBlocked(true)
          return
        }
        const message = getErrorMessage(error, 'Não foi possível carregar as notas fiscais.')
        setLoadError(message)
        showAlert({ title: 'Erro ao carregar notas fiscais', description: message, tone: 'error' })
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    let isMounted = true
    loadFiscalData(filters)
      .then((responses) => {
        if (isMounted) applyData(responses)
      })
      .catch((error: unknown) => {
        if (!isMounted) return
        if (error instanceof ApiError && error.status === 403) {
          setPlanBlocked(true)
          return
        }
        const message = getErrorMessage(error, 'Não foi possível carregar as notas fiscais.')
        setLoadError(message)
        showAlert({ title: 'Erro ao carregar notas fiscais', description: message, tone: 'error' })
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
    // Runs once on mount; subsequent filter changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }
    listInvoices(filters)
      .then((response) => {
        setInvoices(response.data)
        setTotal(response.total)
      })
      .catch((error: unknown) => {
        showAlert({
          title: 'Erro ao carregar notas fiscais',
          description: getErrorMessage(error, 'Não foi possível carregar as notas fiscais.'),
          tone: 'error',
        })
      })
  }, [filters, showAlert])

  function handleActionError(error: unknown, fallback: string): never {
    const message = getErrorMessage(error, fallback)
    showAlert({ title: fallback, description: message, tone: 'error' })
    throw error
  }

  async function saveProfile(payload: FiscalProfilePayload) {
    try {
      await saveFiscalProfile(payload)
      showAlert({ title: 'Dados fiscais salvos.', tone: 'success' })
      load()
    } catch (error) {
      handleActionError(error, 'Não foi possível salvar os dados fiscais.')
    }
  }

  async function saveInvoice(payload: InvoicePayload, invoice?: ServiceInvoice | null) {
    try {
      if (invoice) {
        await updateInvoice(invoice.id, payload)
        showAlert({ title: 'Nota fiscal atualizada.', tone: 'success' })
      } else {
        await createInvoice(payload)
        showAlert({ title: 'Nota salva como rascunho.', tone: 'success' })
      }
      load()
    } catch (error) {
      handleActionError(error, 'Não foi possível salvar a nota fiscal.')
    }
  }

  async function markReady(invoice: ServiceInvoice) {
    try {
      await markInvoiceReady(invoice.id)
      showAlert({ title: 'Nota marcada como pronta para emissão.', tone: 'success' })
      load()
    } catch (error) {
      handleActionError(error, 'Não foi possível marcar a nota como pronta.')
    }
  }

  async function simulateIssue(invoice: ServiceInvoice) {
    try {
      const response = await simulateInvoiceIssue(invoice.id)
      showAlert({ title: 'Simulação concluída', description: response.message, tone: 'success' })
      load()
    } catch (error) {
      handleActionError(error, 'Não foi possível simular a emissão.')
    }
  }

  async function cancel(invoice: ServiceInvoice, reason: string) {
    try {
      await cancelInvoice(invoice.id, reason)
      showAlert({ title: 'Nota cancelada no controle interno.', tone: 'success' })
      load()
    } catch (error) {
      handleActionError(error, 'Não foi possível cancelar a nota fiscal.')
    }
  }

  async function loadInvoiceDetails(invoice: ServiceInvoice) {
    try {
      const detail = await getInvoice(invoice.id)
      setSelectedInvoice(detail)
    } catch (error) {
      handleActionError(error, 'Não foi possível carregar os detalhes da nota fiscal.')
    }
  }

  function setFilter<K extends keyof InvoiceFilters>(field: K, value: InvoiceFilters[K]) {
    setFilters((current) => ({ ...current, page: 1, [field]: value || undefined }))
  }

  return {
    profileResponse,
    summary,
    invoices,
    selectedInvoice,
    setSelectedInvoice,
    total,
    totalPages,
    isLoading,
    loadError,
    planBlocked,
    filters,
    setFilters,
    setFilter,
    load,
    saveProfile,
    saveInvoice,
    markReady,
    simulateIssue,
    cancel,
    loadInvoiceDetails,
  }
}

function loadFiscalData(filters: InvoiceFilters) {
  return Promise.all([getFiscalProfile(), getFiscalSummary(), listInvoices(filters)])
}
