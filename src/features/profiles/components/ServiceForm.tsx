import { Plus } from 'lucide-react'
import type { FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { formatDecimalInput, onlyDigits } from '@/lib/field-formatters'

import type { ServiceFormValues } from '../utils/profile-formatters'

type ServiceFormProps = {
  values: ServiceFormValues
  isSubmitting: boolean
  submitLabel?: string
  onCancel?: () => void
  onChange: (values: ServiceFormValues) => void
  onSubmit: () => void
}

export function ServiceForm({
  values,
  isSubmitting,
  submitLabel = 'Adicionar serviço',
  onCancel,
  onChange,
  onSubmit,
}: ServiceFormProps) {
  const updateValue = (
    field: keyof ServiceFormValues,
    value: string | boolean,
  ) => {
    onChange({ ...values, [field]: value })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Serviço" htmlFor="service-name">
          <TextInput
            id="service-name"
            value={values.name}
            placeholder="Clareamento dental"
            maxLength={100}
            required
            onChange={(event) => updateValue('name', event.target.value)}
          />
        </FormField>

        <FormField label="Duração em minutos" htmlFor="service-duration" optional>
          <TextInput
            id="service-duration"
            type="number"
            min={5}
            max={480}
            value={values.durationMinutes}
            placeholder="60"
            onChange={(event) =>
              updateValue('durationMinutes', onlyDigits(event.target.value))
            }
          />
        </FormField>

        <FormField label="Preço inicial" htmlFor="service-price-from" optional>
          <TextInput
            id="service-price-from"
            inputMode="decimal"
            value={values.priceFrom}
            placeholder="350,00"
            onChange={(event) =>
              updateValue('priceFrom', formatDecimalInput(event.target.value))
            }
          />
        </FormField>

        <FormField label="Preço final" htmlFor="service-price-to" optional>
          <TextInput
            id="service-price-to"
            inputMode="decimal"
            value={values.priceTo}
            placeholder="600,00"
            onChange={(event) =>
              updateValue('priceTo', formatDecimalInput(event.target.value))
            }
          />
        </FormField>

        <FormField label="Ordem de exibição" htmlFor="service-display-order" optional>
          <TextInput
            id="service-display-order"
            type="number"
            min={0}
            value={values.displayOrder}
            placeholder="0"
            onChange={(event) =>
              updateValue('displayOrder', onlyDigits(event.target.value))
            }
          />
        </FormField>

        <div className="flex items-end gap-4">
          <label
            htmlFor="service-is-price-displayed"
            className="flex h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <input
              id="service-is-price-displayed"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary"
              checked={values.isPriceDisplayed}
              onChange={(event) =>
                updateValue('isPriceDisplayed', event.target.checked)
              }
            />
            Exibir preço
          </label>
          <label
            htmlFor="service-is-active"
            className="flex h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <input
              id="service-is-active"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary"
              checked={values.isActive}
              onChange={(event) => updateValue('isActive', event.target.checked)}
            />
            Ativo
          </label>
        </div>
      </div>

      <FormField label="Descrição" htmlFor="service-description" optional>
        <TextArea
          id="service-description"
          value={values.description}
          placeholder="Indicado para pacientes que buscam um sorriso mais claro com acompanhamento profissional."
          maxLength={2000}
          onChange={(event) => updateValue('description', event.target.value)}
        />
      </FormField>

      <div className="flex flex-wrap gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="outline" disabled={isSubmitting}>
          <Plus className="h-4 w-4" />
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
