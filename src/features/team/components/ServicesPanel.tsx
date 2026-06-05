import { Loader2, Plus, Stethoscope } from 'lucide-react'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'
import { parseCurrencyBRL } from '@/lib/number-formatters'
import { ApiError } from '@/services/http'
import { HomeEmptyState } from '@/features/home/components/HomeEmptyState'

import { ServiceItemCard } from './ServiceItemCard'
import { createService, deleteService, updateService } from '../services/team.service'
import type { CreateServiceDto, ServiceItem, UpdateServiceDto } from '../types/team.types'

// ── Props ─────────────────────────────────────────────────────────────────────

type ServicesPanelProps = {
  profileId: string
  services: ServiceItem[]
  onServicesChange: (services: ServiceItem[]) => void
  readOnly?: boolean
  hideTitle?: boolean
}

// ── Money conversion helpers ──────────────────────────────────────────────────

function centsToInput(cents: number | null): string {
  if (cents == null) return ''
  return (cents / 100).toFixed(2).replace('.', ',')
}

function reaisToInput(reais: number | null): string {
  if (reais == null) return ''
  return reais.toFixed(2).replace('.', ',')
}

function inputToReais(raw: string): number | undefined {
  const parsed = parseCurrencyBRL(raw)
  return parsed != null && parsed >= 0 ? parsed : undefined
}

function inputToCents(raw: string): number | undefined {
  const parsed = parseCurrencyBRL(raw)
  return parsed != null && parsed >= 0 ? Math.round(parsed * 100) : undefined
}

// ── Form state ────────────────────────────────────────────────────────────────

type ServiceFormState = {
  name: string
  description: string
  priceFrom: string
  priceTo: string
  durationMinutes: string
  estimatedDirectCostCents: string
  isActive: boolean
}

export function emptyForm(): ServiceFormState {
  return {
    name: '',
    description: '',
    priceFrom: '',
    priceTo: '',
    durationMinutes: '',
    estimatedDirectCostCents: '',
    isActive: true,
  }
}

function serviceToForm(svc: ServiceItem): ServiceFormState {
  return {
    name: svc.name,
    description: svc.description ?? '',
    priceFrom: reaisToInput(svc.priceFrom),
    priceTo: reaisToInput(svc.priceTo),
    durationMinutes: svc.durationMinutes != null ? String(svc.durationMinutes) : '',
    estimatedDirectCostCents: centsToInput(svc.estimatedDirectCostCents),
    isActive: svc.isActive,
  }
}

function validateForm(form: ServiceFormState): string | null {
  if (!form.name.trim()) return 'O nome do serviço é obrigatório.'

  if (form.priceFrom.trim()) {
    const v = parseCurrencyBRL(form.priceFrom)
    if (v == null || v < 0) return 'O preço a partir de deve ser um valor positivo.'
  }
  if (form.priceTo.trim()) {
    const v = parseCurrencyBRL(form.priceTo)
    if (v == null || v < 0) return 'O preço até deve ser um valor positivo.'
  }
  if (form.priceFrom.trim() && form.priceTo.trim()) {
    const from = parseCurrencyBRL(form.priceFrom)
    const to = parseCurrencyBRL(form.priceTo)
    if (from != null && to != null && to < from) {
      return 'O preço até não pode ser menor que o preço a partir de.'
    }
  }

  if (form.durationMinutes.trim()) {
    const dur = parseInt(form.durationMinutes, 10)
    if (isNaN(dur) || dur < 5 || dur > 480) {
      return 'A duração deve ser entre 5 e 480 minutos.'
    }
  }

  if (form.estimatedDirectCostCents.trim()) {
    const v = parseCurrencyBRL(form.estimatedDirectCostCents)
    if (v == null || v < 0) return 'O custo direto estimado deve ser um valor positivo.'
  }

  return null
}

export function toCreateDto(form: ServiceFormState): CreateServiceDto {
  return {
    name: form.name.trim(),
    ...(form.description.trim() ? { description: form.description.trim() } : {}),
    ...(form.priceFrom.trim() ? { priceFrom: inputToReais(form.priceFrom) } : {}),
    ...(form.priceTo.trim() ? { priceTo: inputToReais(form.priceTo) } : {}),
    ...(form.durationMinutes.trim()
      ? { durationMinutes: parseInt(form.durationMinutes, 10) }
      : {}),
    isActive: form.isActive,
    ...(form.estimatedDirectCostCents.trim()
      ? { estimatedDirectCostCents: inputToCents(form.estimatedDirectCostCents) }
      : {}),
  }
}

export function toUpdateDto(form: ServiceFormState): UpdateServiceDto {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    priceFrom: form.priceFrom.trim() ? inputToReais(form.priceFrom) : null,
    priceTo: form.priceTo.trim() ? inputToReais(form.priceTo) : null,
    durationMinutes: form.durationMinutes.trim()
      ? parseInt(form.durationMinutes, 10)
      : null,
    isActive: form.isActive,
    estimatedDirectCostCents: form.estimatedDirectCostCents.trim()
      ? inputToCents(form.estimatedDirectCostCents)
      : null,
  }
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function ServicesPanel({ profileId, services, onServicesChange, readOnly = false, hideTitle = false }: ServicesPanelProps) {
  const { showAlert } = useGlobalAlerts()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorIsWarning, setErrorIsWarning] = useState(false)

  function classifyError(err: unknown, fallback: string): string {
    if (err instanceof ApiError && err.status === 403) {
      return 'Você não tem permissão para gerenciar serviços.'
    }
    if (err instanceof ApiError && err.status === 409) {
      return 'Este serviço possui agendamentos ou registros vinculados e não pode ser removido.'
    }
    return err instanceof Error ? err.message : fallback
  }

  function setErrorState(err: unknown, fallback: string) {
    setErrorIsWarning(false)
    setError(classifyError(err, fallback))
  }

  function clearError() {
    setError(null)
    setErrorIsWarning(false)
  }

  async function handleCreate(dto: CreateServiceDto) {
    setLoadingId('new')
    clearError()
    try {
      const svc = await createService(profileId, dto)
      onServicesChange([...services, svc])
      setIsAdding(false)
      showAlert({ title: 'Serviço criado com sucesso', tone: 'success' })
    } catch (err) {
      setErrorState(err, 'Erro ao criar serviço.')
      showAlert({ title: 'Erro ao criar serviço', description: classifyError(err, 'Erro ao criar serviço.'), tone: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  async function handleUpdate(serviceId: string, dto: UpdateServiceDto) {
    setLoadingId(serviceId)
    clearError()
    try {
      const updated = await updateService(profileId, serviceId, dto)
      onServicesChange(services.map((s) => (s.id === serviceId ? updated : s)))
      setEditingId(null)
      showAlert({ title: 'Serviço atualizado', tone: 'success' })
    } catch (err) {
      setErrorState(err, 'Erro ao atualizar serviço.')
      showAlert({ title: 'Erro ao atualizar serviço', description: classifyError(err, 'Erro ao atualizar serviço.'), tone: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(serviceId: string) {
    setLoadingId(serviceId)
    clearError()
    try {
      await deleteService(profileId, serviceId)
      onServicesChange(services.filter((s) => s.id !== serviceId))
      setDeletingId(null)
      showAlert({ title: 'Serviço removido', tone: 'success' })
    } catch (err) {
      setDeletingId(null)
      setErrorState(err, 'Erro ao remover serviço.')
      showAlert({ title: 'Erro ao remover serviço', description: classifyError(err, 'Erro ao remover serviço.'), tone: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  const sortedServices = [...services].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
  )

  const serviceBeingDeleted = deletingId
    ? services.find((s) => s.id === deletingId)
    : null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!hideTitle && (
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground">Serviços e procedimentos</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Gerencie os procedimentos oferecidos e configure o custo direto estimado para análise de margem.
            </p>
          </div>
        )}
        {!readOnly && !isAdding && (
          <Button
            type="button"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              setIsAdding(true)
              setEditingId(null)
              clearError()
            }}
            disabled={loadingId !== null}
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Panel-level error */}
      {error && (
        <InlineFeedback tone={errorIsWarning ? 'warning' : 'error'}>{error}</InlineFeedback>
      )}

      {/* Read-only notice */}
      {readOnly && services.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Visualização apenas — gerenciamento pelo gestor da clínica.
        </p>
      )}

      {/* Add form */}
      {!readOnly && isAdding && (
        <ServiceForm
          isLoading={loadingId === 'new'}
          onSubmit={handleCreate}
          onCancel={() => {
            setIsAdding(false)
            clearError()
          }}
        />
      )}

      {sortedServices.length === 0 && !isAdding && (
        <HomeEmptyState
          compact
          icon={Stethoscope}
          title="Nenhum procedimento cadastrado"
          description="Adicione os serviços oferecidos pelo profissional."
        />
      )}

      {/* Service list */}
      {sortedServices.length > 0 && (
        <div className="grid gap-3">
          {sortedServices.map((svc) =>
            !readOnly && editingId === svc.id ? (
              <ServiceForm
                key={svc.id}
                initial={svc}
                isLoading={loadingId === svc.id}
                onSubmit={(dto) => handleUpdate(svc.id, dto)}
                onCancel={() => {
                  setEditingId(null)
                  clearError()
                }}
              />
            ) : (
              <ServiceItemCard
                key={svc.id}
                service={svc}
                readOnly={readOnly}
                isLoading={loadingId === svc.id}
                onEditStart={() => {
                  setEditingId(svc.id)
                  setIsAdding(false)
                  clearError()
                }}
                onDeleteStart={() => setDeletingId(svc.id)}
              />
            ),
          )}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deletingId}
        title="Remover serviço"
        description="Esta ação não pode ser desfeita. O serviço será removido permanentemente do perfil."
        subject={serviceBeingDeleted?.name}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        tone="destructive"
        isConfirming={loadingId === deletingId}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}

// ── ServiceForm ───────────────────────────────────────────────────────────────

type ServiceFormProps =
  | { initial?: undefined; isLoading: boolean; onSubmit: (dto: CreateServiceDto) => void; onCancel: () => void }
  | { initial: ServiceItem; isLoading: boolean; onSubmit: (dto: UpdateServiceDto) => void; onCancel: () => void }

function ServiceForm(props: ServiceFormProps) {
  const { isLoading, onCancel } = props
  const [form, setForm] = useState<ServiceFormState>(
    props.initial ? serviceToForm(props.initial) : emptyForm(),
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  function set<K extends keyof ServiceFormState>(key: K, value: ServiceFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validateForm(form)
    if (err) {
      setValidationError(err)
      return
    }
    setValidationError(null)
    if (props.initial) {
      props.onSubmit(toUpdateDto(form))
    } else {
      props.onSubmit(toCreateDto(form))
    }
  }

  const isEditing = !!props.initial

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-primary/20 bg-primary/5 p-4 dark:bg-primary/10"
    >
      {validationError && (
        <InlineFeedback tone="error">{validationError}</InlineFeedback>
      )}

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Identificação</legend>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <FormField label="Nome" htmlFor="svc-name">
            <TextInput
              id="svc-name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ex: Limpeza dental"
              required
              disabled={isLoading}
              maxLength={100}
            />
          </FormField>

          <FormField label="Descrição" htmlFor="svc-description" optional>
            <TextArea
              id="svc-description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Descreva o procedimento (opcional)"
              disabled={isLoading}
              maxLength={2000}
              className="min-h-20"
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Duração e preço</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Duração (min)" htmlFor="svc-duration" optional>
            <TextInput
              id="svc-duration"
              value={form.durationMinutes}
              onChange={(e) => set('durationMinutes', e.target.value)}
              placeholder="Ex: 60"
              disabled={isLoading}
              inputMode="numeric"
            />
          </FormField>

          <FormField label="Preço a partir de (R$)" htmlFor="svc-price-from" optional>
            <TextInput
              id="svc-price-from"
              value={form.priceFrom}
              onChange={(e) => set('priceFrom', e.target.value)}
              placeholder="0,00"
              disabled={isLoading}
              inputMode="decimal"
            />
          </FormField>

          <FormField label="Preço até (R$)" htmlFor="svc-price-to" optional>
            <TextInput
              id="svc-price-to"
              value={form.priceTo}
              onChange={(e) => set('priceTo', e.target.value)}
              placeholder="0,00"
              disabled={isLoading}
              inputMode="decimal"
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Custos internos</legend>
        <FormField
          label="Custo direto estimado (R$)"
          htmlFor="svc-cost"
          optional
          hint="Custo médio de materiais por procedimento. Não inclui mão de obra. Usado para calcular a margem real do procedimento."
        >
          <TextInput
            id="svc-cost"
            value={form.estimatedDirectCostCents}
            onChange={(e) => set('estimatedDirectCostCents', e.target.value)}
            placeholder="0,00"
            disabled={isLoading}
            inputMode="decimal"
          />
        </FormField>
      </fieldset>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <input
          id="svc-active"
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => set('isActive', e.target.checked)}
          disabled={isLoading}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <label htmlFor="svc-active" className="cursor-pointer text-sm font-medium text-foreground">
          Serviço ativo
        </label>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isLoading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Adicionar serviço'}
        </Button>
      </div>
    </form>
  )
}
