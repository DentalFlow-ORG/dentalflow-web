import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
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
import { formatCepBR, formatCpfCnpjBR, formatDecimalInput, formatUf } from '@/lib/field-formatters'
import { isValidCEP, isValidCNPJ, isValidUF, normalizeDigits } from '@/lib/validators/br'
import { CepNotFoundError, fetchAddressByCep } from '@/services/cep/cep.service'

import { FISCAL_PROFILE_FIELD_LIMITS, TAX_REGIME_LABEL } from '../constants/fiscal-profile'
import type { FiscalProfilePayload } from '../types/fiscal.types'
import { getMissingFiscalProfileFields } from '../utils/fiscal-profile-completeness'

type FiscalProfileErrorField =
  | 'legalName'
  | 'documentNumber'
  | 'addressZipCode'
  | 'addressState'
  | 'issRate'
  | 'cityIbgeCode'

type FiscalProfileErrors = Partial<Record<FiscalProfileErrorField, string>>

/** Identity data of a profile that was already saved; changing it needs confirmation. */
export type SavedFiscalIdentity = Pick<FiscalProfilePayload, 'documentNumber' | 'taxRegime'>

// A fiscal profile may be saved as an incomplete draft: only the legal name is
// required to save, and any filled field must be well formed. Completeness
// (CNPJ, full address, CEP, UF) is enforced before an invoice is marked ready
// or simulated — see getMissingFiscalProfileFields and the API issuing guard.
function validateFiscalProfile(form: FiscalProfilePayload): FiscalProfileErrors {
  const errors: FiscalProfileErrors = {}
  if (!form.legalName.trim()) {
    errors.legalName = 'Informe a razão social.'
  }
  if (form.documentNumber.trim() && !isValidCNPJ(form.documentNumber)) {
    errors.documentNumber = 'Informe um CNPJ válido com 14 dígitos.'
  }
  if (form.addressZipCode.trim() && !isValidCEP(form.addressZipCode)) {
    errors.addressZipCode = 'Informe um CEP com 8 dígitos.'
  }
  if (form.addressState.trim() && !isValidUF(form.addressState)) {
    errors.addressState = 'Informe uma sigla de estado válida (ex: SP, RJ).'
  }
  if (
    form.issRate != null &&
    (Number.isNaN(form.issRate) || form.issRate < 0 || form.issRate > 100)
  ) {
    errors.issRate = 'Informe uma alíquota válida entre 0 e 100.'
  }
  const ibge = form.cityIbgeCode ?? ''
  if (ibge && ibge.length !== FISCAL_PROFILE_FIELD_LIMITS.cityIbgeCode) {
    errors.cityIbgeCode = 'O código IBGE deve conter 7 dígitos.'
  }
  return errors
}

function formatIssRate(value: number | null): string {
  return value == null || Number.isNaN(value) ? '' : String(value).replace('.', ',')
}

// Accepts "2", "2," and "2,5" while typing; up to 3 integer digits and 2 decimals.
function sanitizeIssRateInput(value: string): string {
  const raw = formatDecimalInput(value).replace('.', ',')
  const [integerPart, decimalPart] = raw.split(',')
  const integer = integerPart.slice(0, 3)
  return decimalPart === undefined ? integer : `${integer},${decimalPart.slice(0, 2)}`
}

function parseIssRate(text: string): number | null {
  if (!text) return null
  return Number(text.replace(',', '.'))
}

function describeSensitiveChanges(form: FiscalProfilePayload, saved: SavedFiscalIdentity) {
  const changes: string[] = []
  if (normalizeDigits(form.documentNumber) !== normalizeDigits(saved.documentNumber)) {
    changes.push(
      `o CNPJ de ${formatCpfCnpjBR(saved.documentNumber)} para ${formatCpfCnpjBR(form.documentNumber)}`,
    )
  }
  if (form.taxRegime !== saved.taxRegime) {
    changes.push(
      `o regime tributário de ${TAX_REGIME_LABEL[saved.taxRegime]} para ${TAX_REGIME_LABEL[form.taxRegime]}`,
    )
  }
  return changes
}

type Props = {
  form: FiscalProfilePayload
  /** The profile as currently saved; null when the clinic has no fiscal profile yet. */
  savedIdentity?: SavedFiscalIdentity | null
  onChange: (form: FiscalProfilePayload) => void
  onCancel: () => void
  onSubmit: () => void
  isSaving?: boolean
}

export function FiscalProfileForm({
  form,
  savedIdentity = null,
  onChange,
  onCancel,
  onSubmit,
  isSaving,
}: Props) {
  const [errors, setErrors] = useState<FiscalProfileErrors>({})
  const [isCepLookingUp, setIsCepLookingUp] = useState(false)
  const [cepLookupError, setCepLookupError] = useState<string | null>(null)
  const [pendingChanges, setPendingChanges] = useState<string[] | null>(null)
  const [issRateDraft, setIssRateDraft] = useState(() => ({
    value: form.issRate,
    text: formatIssRate(form.issRate),
  }))
  // A draft is only trusted while it still describes the current value, so an
  // externally loaded profile replaces what was being typed.
  const issRateText = Object.is(issRateDraft.value, form.issRate)
    ? issRateDraft.text
    : formatIssRate(form.issRate)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const formRef = useRef(form)
  formRef.current = form
  // The address lookup only runs after the user edits the CEP. Hydrating a
  // saved profile must never overwrite the stored street, district or city.
  const hasEditedCepRef = useRef(false)

  const addressZipCode = form.addressZipCode
  useEffect(() => {
    setIsCepLookingUp(false)
    if (!hasEditedCepRef.current || !isValidCEP(addressZipCode)) return
    let isCurrent = true
    const timer = setTimeout(async () => {
      setIsCepLookingUp(true)
      setCepLookupError(null)
      try {
        const address = await fetchAddressByCep(addressZipCode)
        if (!isCurrent) return
        const currentForm = formRef.current
        onChangeRef.current({
          ...currentForm,
          addressStreet: address.street || currentForm.addressStreet,
          addressNeighborhood: address.neighborhood || currentForm.addressNeighborhood,
          addressCity: address.city || currentForm.addressCity,
          addressState: address.uf || currentForm.addressState,
        })
      } catch (err) {
        if (!isCurrent) return
        setCepLookupError(
          err instanceof CepNotFoundError
            ? 'CEP não encontrado.'
            : 'Não foi possível consultar o CEP.',
        )
      } finally {
        if (isCurrent) setIsCepLookingUp(false)
      }
    }, 400)
    return () => {
      isCurrent = false
      clearTimeout(timer)
    }
  }, [addressZipCode])

  function handleChange(updated: FiscalProfilePayload, field?: FiscalProfileErrorField) {
    onChange(updated)
    if (field && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (field === 'addressZipCode') {
      hasEditedCepRef.current = true
      setCepLookupError(null)
    }
  }

  function handleIssRateChange(value: string) {
    const text = sanitizeIssRateInput(value)
    const issRate = parseIssRate(text)
    setIssRateDraft({ value: issRate, text })
    handleChange({ ...form, issRate }, 'issRate')
  }

  function handleSubmit() {
    const fieldErrors = validateFiscalProfile(form)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    const changes = savedIdentity ? describeSensitiveChanges(form, savedIdentity) : []
    if (changes.length > 0) {
      setPendingChanges(changes)
      return
    }
    onSubmit()
  }

  function confirmSensitiveChanges() {
    setPendingChanges(null)
    onSubmit()
  }

  const zipCodeError = errors.addressZipCode ?? cepLookupError ?? undefined
  const missingForIssue = getMissingFiscalProfileFields(form)

  return (
    <PanelCard>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground">Dados fiscais da clínica</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirme as informações com o contador da clínica antes de ativar a emissão real.
        </p>
        {missingForIssue.length > 0 && (
          <p
            className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
            data-testid="fiscal-profile-incomplete"
          >
            Você pode salvar o perfil incompleto. Para marcar notas como prontas ou simular a
            emissão, falta preencher: {missingForIssue.join(', ')}.
          </p>
        )}
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
                placeholder="Razão social registrada no CNPJ"
                autoComplete="organization"
                value={form.legalName}
                maxLength={FISCAL_PROFILE_FIELD_LIMITS.legalName}
                onChange={(e) => handleChange({ ...form, legalName: e.target.value }, 'legalName')}
                aria-invalid={Boolean(errors.legalName)}
                aria-describedby={errors.legalName ? 'legalName-error' : undefined}
              />
            </FormField>
            <FormField label="Nome fantasia" htmlFor="tradeName" optional>
              <TextInput
                id="tradeName"
                placeholder="Nome fantasia da clínica"
                value={form.tradeName ?? ''}
                maxLength={FISCAL_PROFILE_FIELD_LIMITS.tradeName}
                onChange={(e) => handleChange({ ...form, tradeName: e.target.value })}
              />
            </FormField>
            <FormField label="CNPJ" htmlFor="documentNumber" error={errors.documentNumber}>
              <TextInput
                id="documentNumber"
                inputMode="numeric"
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
                maxLength={FISCAL_PROFILE_FIELD_LIMITS.registration}
                onChange={(e) => handleChange({ ...form, municipalRegistration: e.target.value })}
              />
            </FormField>
            <FormField label="Inscrição estadual" htmlFor="stateRegistration" optional>
              <TextInput
                id="stateRegistration"
                placeholder="Informe a inscrição estadual"
                value={form.stateRegistration ?? ''}
                maxLength={FISCAL_PROFILE_FIELD_LIMITS.registration}
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
            <FormField label="CEP" htmlFor="zipCode" error={zipCodeError}>
              <div className="relative">
                <TextInput
                  id="zipCode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="00000-000"
                  value={form.addressZipCode}
                  onChange={(e) =>
                    handleChange(
                      { ...form, addressZipCode: formatCepBR(e.target.value) },
                      'addressZipCode',
                    )
                  }
                  maxLength={9}
                  aria-invalid={Boolean(zipCodeError)}
                  aria-describedby={zipCodeError ? 'zipCode-error' : undefined}
                />
                {isCepLookingUp && (
                  <Loader2
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </div>
            </FormField>
            <FormField label="Rua" htmlFor="street" className="sm:col-span-2">
              <TextInput
                id="street"
                placeholder="Rua, avenida ou logradouro"
                value={form.addressStreet}
                maxLength={FISCAL_PROFILE_FIELD_LIMITS.addressStreet}
                onChange={(e) => handleChange({ ...form, addressStreet: e.target.value })}
              />
            </FormField>
            <FormField label="Número" htmlFor="number">
              <TextInput
                id="number"
                placeholder="Ex: 120 ou S/N"
                value={form.addressNumber}
                maxLength={FISCAL_PROFILE_FIELD_LIMITS.addressNumber}
                onChange={(e) => handleChange({ ...form, addressNumber: e.target.value })}
              />
            </FormField>
            <FormField label="Complemento" htmlFor="complement" optional>
              <TextInput
                id="complement"
                placeholder="Sala, bloco, andar"
                value={form.addressComplement ?? ''}
                maxLength={FISCAL_PROFILE_FIELD_LIMITS.addressComplement}
                onChange={(e) => handleChange({ ...form, addressComplement: e.target.value })}
              />
            </FormField>
            <FormField label="Bairro" htmlFor="neighborhood">
              <TextInput
                id="neighborhood"
                placeholder="Bairro"
                value={form.addressNeighborhood}
                maxLength={FISCAL_PROFILE_FIELD_LIMITS.addressNeighborhood}
                onChange={(e) => handleChange({ ...form, addressNeighborhood: e.target.value })}
              />
            </FormField>
            <FormField label="Cidade" htmlFor="city" className="sm:col-span-2">
              <TextInput
                id="city"
                placeholder="Cidade"
                value={form.addressCity}
                maxLength={FISCAL_PROFILE_FIELD_LIMITS.addressCity}
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
                  handleChange({ ...form, addressState: formatUf(e.target.value) }, 'addressState')
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
                  <SelectValue placeholder="Selecione o regime tributário" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TAX_REGIME_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField
              label="Alíquota de ISS (%)"
              htmlFor="issRate"
              error={errors.issRate}
              optional
            >
              <TextInput
                id="issRate"
                inputMode="decimal"
                placeholder="Ex: 2,00"
                value={issRateText}
                onChange={(e) => handleIssRateChange(e.target.value)}
                aria-invalid={Boolean(errors.issRate)}
                aria-describedby={errors.issRate ? 'issRate-error' : undefined}
              />
            </FormField>
            <FormField label="Código de serviço municipal" htmlFor="profileServiceCode" optional>
              <TextInput
                id="profileServiceCode"
                placeholder="Ex: 04.12"
                value={form.serviceCode ?? ''}
                maxLength={FISCAL_PROFILE_FIELD_LIMITS.serviceCode}
                onChange={(e) => handleChange({ ...form, serviceCode: e.target.value })}
              />
            </FormField>
            <FormField label="CNAE" htmlFor="cnae" optional>
              <TextInput
                id="cnae"
                placeholder="Ex: 8630-5/04"
                value={form.cnae ?? ''}
                maxLength={FISCAL_PROFILE_FIELD_LIMITS.cnae}
                onChange={(e) => handleChange({ ...form, cnae: e.target.value })}
              />
            </FormField>
            <FormField
              label="Código IBGE do município"
              htmlFor="ibgeCode"
              error={errors.cityIbgeCode}
              optional
            >
              <TextInput
                id="ibgeCode"
                inputMode="numeric"
                placeholder="Ex: 3550308"
                value={form.cityIbgeCode ?? ''}
                onChange={(e) =>
                  handleChange(
                    { ...form, cityIbgeCode: normalizeDigits(e.target.value) },
                    'cityIbgeCode',
                  )
                }
                maxLength={FISCAL_PROFILE_FIELD_LIMITS.cityIbgeCode}
                aria-invalid={Boolean(errors.cityIbgeCode)}
                aria-describedby={errors.cityIbgeCode ? 'ibgeCode-error' : undefined}
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
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Salvar dados fiscais
        </Button>
      </div>

      <ConfirmDialog
        open={pendingChanges !== null}
        tone="warning"
        title="Alterar dados fiscais da clínica?"
        description={
          <>
            Você está alterando {pendingChanges?.join(' e ')}. Esses dados identificam a clínica
            como emissora das notas fiscais. Confirme a alteração com o contador antes de salvar.
          </>
        }
        confirmLabel="Salvar alteração"
        cancelLabel="Revisar"
        onCancel={() => setPendingChanges(null)}
        onConfirm={confirmSensitiveChanges}
      />
    </PanelCard>
  )
}
