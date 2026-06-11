import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { FormField, TextInput } from '@/components/common/FormField'
import { PanelCard } from '@/components/common/PanelCard'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCpfCnpjBR, formatCepBR, formatUf, formatDecimalInput, onlyDigits } from '@/lib/field-formatters'

import type { FiscalProfilePayload } from '../types/fiscal.types'

type FiscalProfileErrors = {
  legalName?: string
  documentNumber?: string
  addressZipCode?: string
  addressState?: string
  issRate?: string
}

function validateFiscalProfile(form: FiscalProfilePayload): FiscalProfileErrors {
  const errors: FiscalProfileErrors = {}
  if (!form.legalName.trim()) {
    errors.legalName = 'Informe a razão social.'
  }
  if (!form.documentNumber.trim() || onlyDigits(form.documentNumber).length !== 14) {
    errors.documentNumber = 'Informe um CNPJ com 14 dígitos.'
  }
  if (!form.addressZipCode.trim() || onlyDigits(form.addressZipCode).length !== 8) {
    errors.addressZipCode = 'Informe um CEP com 8 dígitos.'
  }
  if (!form.addressState.trim() || form.addressState.trim().length !== 2) {
    errors.addressState = 'Use a sigla do estado com 2 letras.'
  }
  if (
    form.issRate != null &&
    form.issRate !== 0 &&
    (isNaN(form.issRate) || form.issRate < 0 || form.issRate > 100)
  ) {
    errors.issRate = 'Informe uma alíquota válida entre 0 e 100.'
  }
  return errors
}

type Props = {
  form: FiscalProfilePayload
  onChange: (form: FiscalProfilePayload) => void
  onCancel: () => void
  onSubmit: () => void
  isSaving?: boolean
}

export function FiscalProfileForm({ form, onChange, onCancel, onSubmit, isSaving }: Props) {
  const [errors, setErrors] = useState<FiscalProfileErrors>({})

  function handleChange(updated: FiscalProfilePayload, field?: keyof FiscalProfileErrors) {
    onChange(updated)
    if (field && field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function handleSubmit() {
    const fieldErrors = validateFiscalProfile(form)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    onSubmit()
  }

  return (
    <PanelCard>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground">Dados fiscais da clínica</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirme as informações com o contador da clínica antes de ativar a emissão real.
        </p>
      </div>

      <div className="space-y-6">
        {/* Dados da empresa */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Dados da empresa
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              label="Razão social"
              htmlFor="legalName"
              error={errors.legalName}
              className="sm:col-span-2"
            >
              <TextInput
                id="legalName"
                value={form.legalName}
                onChange={(e) => handleChange({ ...form, legalName: e.target.value }, 'legalName')}
                aria-invalid={Boolean(errors.legalName)}
                aria-describedby={errors.legalName ? 'legalName-error' : undefined}
              />
            </FormField>
            <FormField label="Nome fantasia" htmlFor="tradeName" optional>
              <TextInput
                id="tradeName"
                value={form.tradeName ?? ''}
                onChange={(e) => handleChange({ ...form, tradeName: e.target.value })}
              />
            </FormField>
            <FormField label="CNPJ" htmlFor="documentNumber" error={errors.documentNumber}>
              <TextInput
                id="documentNumber"
                placeholder="00.000.000/0000-00"
                value={form.documentNumber}
                onChange={(e) =>
                  handleChange(
                    { ...form, documentNumber: formatCpfCnpjBR(e.target.value) },
                    'documentNumber',
                  )
                }
                maxLength={18}
                aria-invalid={Boolean(errors.documentNumber)}
                aria-describedby={errors.documentNumber ? 'documentNumber-error' : undefined}
              />
            </FormField>
            <FormField label="Inscrição municipal" htmlFor="municipalRegistration" optional>
              <TextInput
                id="municipalRegistration"
                placeholder="Informe a inscrição municipal"
                value={form.municipalRegistration ?? ''}
                onChange={(e) => handleChange({ ...form, municipalRegistration: e.target.value })}
              />
            </FormField>
            <FormField label="Inscrição estadual" htmlFor="stateRegistration" optional>
              <TextInput
                id="stateRegistration"
                placeholder="Informe a inscrição estadual"
                value={form.stateRegistration ?? ''}
                onChange={(e) => handleChange({ ...form, stateRegistration: e.target.value })}
              />
            </FormField>
          </div>
        </div>

        {/* Endereço fiscal */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Endereço fiscal
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="CEP" htmlFor="zipCode" error={errors.addressZipCode}>
              <TextInput
                id="zipCode"
                placeholder="00000-000"
                value={form.addressZipCode}
                onChange={(e) =>
                  handleChange(
                    { ...form, addressZipCode: formatCepBR(e.target.value) },
                    'addressZipCode',
                  )
                }
                maxLength={9}
                aria-invalid={Boolean(errors.addressZipCode)}
                aria-describedby={errors.addressZipCode ? 'zipCode-error' : undefined}
              />
            </FormField>
            <FormField label="Rua" htmlFor="street" className="sm:col-span-2">
              <TextInput
                id="street"
                value={form.addressStreet}
                onChange={(e) => handleChange({ ...form, addressStreet: e.target.value })}
              />
            </FormField>
            <FormField label="Número" htmlFor="number">
              <TextInput
                id="number"
                value={form.addressNumber}
                onChange={(e) => handleChange({ ...form, addressNumber: e.target.value })}
              />
            </FormField>
            <FormField label="Complemento" htmlFor="complement" optional>
              <TextInput
                id="complement"
                value={form.addressComplement ?? ''}
                onChange={(e) => handleChange({ ...form, addressComplement: e.target.value })}
              />
            </FormField>
            <FormField label="Bairro" htmlFor="neighborhood">
              <TextInput
                id="neighborhood"
                value={form.addressNeighborhood}
                onChange={(e) => handleChange({ ...form, addressNeighborhood: e.target.value })}
              />
            </FormField>
            <FormField label="Cidade" htmlFor="city" className="sm:col-span-2">
              <TextInput
                id="city"
                value={form.addressCity}
                onChange={(e) => handleChange({ ...form, addressCity: e.target.value })}
              />
            </FormField>
            <FormField label="UF" htmlFor="state" error={errors.addressState}>
              <TextInput
                id="state"
                maxLength={2}
                placeholder="SP"
                value={form.addressState}
                onChange={(e) =>
                  handleChange(
                    { ...form, addressState: formatUf(e.target.value) },
                    'addressState',
                  )
                }
                aria-invalid={Boolean(errors.addressState)}
                aria-describedby={errors.addressState ? 'state-error' : undefined}
              />
            </FormField>
          </div>
        </div>

        {/* Informações fiscais */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Informações fiscais
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Regime tributário" htmlFor="taxRegime" className="sm:col-span-2">
              <Select
                value={form.taxRegime}
                onValueChange={(value) =>
                  handleChange({ ...form, taxRegime: value as FiscalProfilePayload['taxRegime'] })
                }
              >
                <SelectTrigger id="taxRegime">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIMPLES_NACIONAL">Simples Nacional</SelectItem>
                  <SelectItem value="LUCRO_PRESUMIDO">Lucro Presumido</SelectItem>
                  <SelectItem value="LUCRO_REAL">Lucro Real</SelectItem>
                  <SelectItem value="MEI">MEI</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Alíquota de ISS (%)" htmlFor="issRate" error={errors.issRate} optional>
              <TextInput
                id="issRate"
                inputMode="decimal"
                placeholder="Ex: 2,00"
                value={form.issRate != null ? String(form.issRate).replace('.', ',') : ''}
                onChange={(e) => {
                  const raw = formatDecimalInput(e.target.value)
                  handleChange(
                    { ...form, issRate: raw ? Number(raw.replace(',', '.')) : null },
                    'issRate',
                  )
                }}
                aria-invalid={Boolean(errors.issRate)}
                aria-describedby={errors.issRate ? 'issRate-error' : undefined}
              />
            </FormField>
            <FormField label="Código de serviço municipal" htmlFor="profileServiceCode" optional>
              <TextInput
                id="profileServiceCode"
                placeholder="Ex: 04.12"
                value={form.serviceCode ?? ''}
                onChange={(e) => handleChange({ ...form, serviceCode: e.target.value })}
              />
            </FormField>
            <FormField label="CNAE" htmlFor="cnae" optional>
              <TextInput
                id="cnae"
                placeholder="Ex: 8630-5/04"
                value={form.cnae ?? ''}
                onChange={(e) => handleChange({ ...form, cnae: e.target.value })}
              />
            </FormField>
            <FormField label="Código IBGE do município" htmlFor="ibgeCode" optional>
              <TextInput
                id="ibgeCode"
                placeholder="Ex: 3550308"
                value={form.cityIbgeCode ?? ''}
                onChange={(e) =>
                  handleChange({ ...form, cityIbgeCode: e.target.value.replace(/\D/g, '') })
                }
                maxLength={7}
              />
            </FormField>
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs text-muted-foreground">
        Estes dados organizam rascunhos fiscais internos. A emissão oficial de nota fiscal depende
        de integração fiscal habilitada.
      </p>

      <div className="mt-5 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSaving} className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Salvar dados fiscais
        </Button>
      </div>
    </PanelCard>
  )
}
