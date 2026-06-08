import { FormField, TextInput } from '@/components/common/FormField'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { ProfileService } from '../../types/profile.types'

// Sentinel used internally to represent "no service selected" in edit mode,
// where the Select needs an explicit "Sem serviço" option to clear the value.
const NO_SERVICE_SENTINEL = '__NO_SERVICE__'

type AppointmentServiceValueSectionProps = {
  /** Available services for the selected professional. */
  services: ProfileService[]
  /** Currently selected service id. Empty string means no service selected. */
  serviceId: string
  /** Disables the service select (e.g. no profile, loading, submitting, past appointment). */
  isSelectDisabled: boolean
  /** Disables the estimated amount input (typically just `isSubmitting`). */
  isSubmitting: boolean
  /** Shows a loading placeholder in the service select. */
  isLoading?: boolean
  /**
   * When true, adds a "Sem serviço" option at the top of the select list.
   * Used in edit mode where the appointment may already have a service that needs clearing.
   */
  showNoServiceOption?: boolean
  /**
   * When true, shows "Selecione um profissional primeiro" as the placeholder.
   * Used in create mode before a professional is selected.
   */
  noProfessionalHint?: boolean
  /** When false, hides the estimated amount field entirely. Defaults to true. */
  showEstimatedAmount?: boolean
  estimatedAmount: string
  /** Whether the user has manually overridden the service-derived price. */
  estimateManuallyEdited: boolean
  onServiceChange: (serviceId: string) => void
  onAmountChange: (amount: string) => void
  /** Called when user manually edits the amount field. */
  onAmountManuallyEdited: () => void
  /** Called when user clicks the "Restaurar valor" button. */
  onAmountRestored: () => void
}

export function AppointmentServiceValueSection({
  services,
  serviceId,
  isSelectDisabled,
  isSubmitting,
  isLoading = false,
  showNoServiceOption = false,
  noProfessionalHint = false,
  showEstimatedAmount = true,
  estimatedAmount,
  estimateManuallyEdited,
  onServiceChange,
  onAmountChange,
  onAmountManuallyEdited,
  onAmountRestored,
}: AppointmentServiceValueSectionProps) {
  const currentService = services.find((s) => s.id === serviceId)
  const restoredPrice =
    currentService?.priceFrom != null
      ? (Math.round(currentService.priceFrom * 100) / 100).toFixed(2).replace('.', ',')
      : null

  // Sentinel handling: edit mode uses a sentinel so the select always has a value
  const selectValue = showNoServiceOption ? serviceId || NO_SERVICE_SENTINEL : serviceId

  function handleServiceChange(value: string) {
    onServiceChange(showNoServiceOption && value === NO_SERVICE_SENTINEL ? '' : value)
  }

  function handleRestoreAmount() {
    if (!restoredPrice) return
    onAmountChange(restoredPrice)
    onAmountRestored()
  }

  const selectPlaceholder = isLoading
    ? 'Carregando...'
    : noProfessionalHint
      ? 'Selecione um profissional primeiro'
      : services.length === 0
        ? 'Nenhum serviço cadastrado'
        : 'Selecione um serviço'

  return (
    <>
      <FormField label="Serviço" htmlFor="appt-serviceId" optional>
        <Select
          disabled={isSelectDisabled || isLoading}
          value={selectValue}
          onValueChange={handleServiceChange}
        >
          <SelectTrigger id="appt-serviceId">
            <SelectValue placeholder={selectPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {showNoServiceOption && (
              <SelectItem value={NO_SERVICE_SENTINEL}>Sem serviço</SelectItem>
            )}
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
                {s.durationMinutes ? ` (${s.durationMinutes} min)` : ''}
                {s.priceFrom != null
                  ? ` — R$ ${s.priceFrom.toFixed(2).replace('.', ',')}`
                  : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      {showEstimatedAmount && (
        <FormField
          label="Valor previsto (R$)"
          htmlFor="appt-estimatedAmount"
          optional
          hint="Preenchido pelo serviço selecionado. Ajuste para desconto ou negociação."
        >
          <TextInput
            id="appt-estimatedAmount"
            inputMode="decimal"
            disabled={isSubmitting}
            placeholder="Ex: 250,00"
            value={estimatedAmount}
            onChange={(e) => {
              onAmountChange(e.target.value)
              onAmountManuallyEdited()
            }}
          />
          {estimateManuallyEdited && serviceId && restoredPrice != null && (
            <button
              type="button"
              className="mt-1 text-xs text-primary hover:underline"
              onClick={handleRestoreAmount}
            >
              Restaurar valor do serviço (R$ {restoredPrice})
            </button>
          )}
        </FormField>
      )}
    </>
  )
}
