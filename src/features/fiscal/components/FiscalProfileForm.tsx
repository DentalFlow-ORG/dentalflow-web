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
import { formatCpfCnpjBR, formatCepBR, formatUf, formatDecimalInput } from '@/lib/field-formatters'

import type { FiscalProfilePayload } from '../types/fiscal.types'

type Props = {
  form: FiscalProfilePayload
  onChange: (form: FiscalProfilePayload) => void
  onCancel: () => void
  onSubmit: () => void
  isSaving?: boolean
}

export function FiscalProfileForm({ form, onChange, onCancel, onSubmit, isSaving }: Props) {
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
            <FormField label="Razão social" htmlFor="legalName" className="sm:col-span-2">
              <TextInput
                id="legalName"
                value={form.legalName}
                onChange={(e) => onChange({ ...form, legalName: e.target.value })}
                disabled={isSaving}
              />
            </FormField>
            <FormField label="Nome fantasia" htmlFor="tradeName" optional>
              <TextInput
                id="tradeName"
                value={form.tradeName ?? ''}
                onChange={(e) => onChange({ ...form, tradeName: e.target.value })}
                disabled={isSaving}
              />
            </FormField>
            <FormField label="CNPJ" htmlFor="documentNumber">
              <TextInput
                id="documentNumber"
                placeholder="00.000.000/0000-00"
                value={form.documentNumber}
                onChange={(e) =>
                  onChange({ ...form, documentNumber: formatCpfCnpjBR(e.target.value) })
                }
                maxLength={18}
                disabled={isSaving}
              />
            </FormField>
            <FormField label="Inscrição municipal" htmlFor="municipalRegistration" optional>
              <TextInput
                id="municipalRegistration"
                placeholder="Informe a inscrição municipal"
                value={form.municipalRegistration ?? ''}
                onChange={(e) => onChange({ ...form, municipalRegistration: e.target.value })}
                disabled={isSaving}
              />
            </FormField>
            <FormField label="Inscrição estadual" htmlFor="stateRegistration" optional>
              <TextInput
                id="stateRegistration"
                placeholder="Informe a inscrição estadual"
                value={form.stateRegistration ?? ''}
                onChange={(e) => onChange({ ...form, stateRegistration: e.target.value })}
                disabled={isSaving}
              />
            </FormField>
          </div>
        </div>

        {/* Endereço fiscal */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Endereço fiscal
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Rua" htmlFor="street" className="sm:col-span-2">
              <TextInput
                id="street"
                value={form.addressStreet}
                onChange={(e) => onChange({ ...form, addressStreet: e.target.value })}
                disabled={isSaving}
              />
            </FormField>
            <FormField label="CEP" htmlFor="zipCode">
              <TextInput
                id="zipCode"
                placeholder="00000-000"
                value={form.addressZipCode}
                onChange={(e) =>
                  onChange({ ...form, addressZipCode: formatCepBR(e.target.value) })
                }
                maxLength={9}
                disabled={isSaving}
              />
            </FormField>
            <FormField label="Número" htmlFor="number">
              <TextInput
                id="number"
                value={form.addressNumber}
                onChange={(e) => onChange({ ...form, addressNumber: e.target.value })}
                disabled={isSaving}
              />
            </FormField>
            <FormField label="Complemento" htmlFor="complement" optional className="sm:col-span-2">
              <TextInput
                id="complement"
                value={form.addressComplement ?? ''}
                onChange={(e) => onChange({ ...form, addressComplement: e.target.value })}
                disabled={isSaving}
              />
            </FormField>
            <FormField label="Bairro" htmlFor="neighborhood">
              <TextInput
                id="neighborhood"
                value={form.addressNeighborhood}
                onChange={(e) => onChange({ ...form, addressNeighborhood: e.target.value })}
                disabled={isSaving}
              />
            </FormField>
            <FormField label="Cidade" htmlFor="city">
              <TextInput
                id="city"
                value={form.addressCity}
                onChange={(e) => onChange({ ...form, addressCity: e.target.value })}
                disabled={isSaving}
              />
            </FormField>
            <FormField label="UF" htmlFor="state">
              <TextInput
                id="state"
                maxLength={2}
                placeholder="SP"
                value={form.addressState}
                onChange={(e) => onChange({ ...form, addressState: formatUf(e.target.value) })}
                disabled={isSaving}
              />
            </FormField>
          </div>
        </div>

        {/* Informações fiscais */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Informações fiscais
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Regime tributário" htmlFor="taxRegime" className="sm:col-span-2">
              <Select
                value={form.taxRegime}
                onValueChange={(value) =>
                  onChange({ ...form, taxRegime: value as FiscalProfilePayload['taxRegime'] })
                }
                disabled={isSaving}
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
            <FormField label="Alíquota de ISS (%)" htmlFor="issRate" optional>
              <TextInput
                id="issRate"
                inputMode="decimal"
                placeholder="Ex: 2,00"
                value={form.issRate != null ? String(form.issRate).replace('.', ',') : ''}
                onChange={(e) => {
                  const raw = formatDecimalInput(e.target.value)
                  onChange({
                    ...form,
                    issRate: raw ? Number(raw.replace(',', '.')) : null,
                  })
                }}
                disabled={isSaving}
              />
            </FormField>
            <FormField label="Código de serviço municipal" htmlFor="profileServiceCode" optional>
              <TextInput
                id="profileServiceCode"
                placeholder="Ex: 04.12"
                value={form.serviceCode ?? ''}
                onChange={(e) => onChange({ ...form, serviceCode: e.target.value })}
                disabled={isSaving}
              />
            </FormField>
            <FormField label="CNAE" htmlFor="cnae" optional>
              <TextInput
                id="cnae"
                placeholder="Ex: 8630-5/04"
                value={form.cnae ?? ''}
                onChange={(e) => onChange({ ...form, cnae: e.target.value })}
                disabled={isSaving}
              />
            </FormField>
            <FormField label="Código IBGE do município" htmlFor="ibgeCode" optional>
              <TextInput
                id="ibgeCode"
                placeholder="Ex: 3550308"
                value={form.cityIbgeCode ?? ''}
                onChange={(e) =>
                  onChange({ ...form, cityIbgeCode: e.target.value.replace(/\D/g, '') })
                }
                maxLength={7}
                disabled={isSaving}
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
        <Button onClick={onSubmit} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Salvar dados fiscais
        </Button>
      </div>
    </PanelCard>
  )
}
