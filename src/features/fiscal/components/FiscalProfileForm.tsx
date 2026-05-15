import { FormField, TextInput } from '@/components/common/FormField'
import { PanelCard } from '@/components/common/PanelCard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCpfCnpjBR, formatCepBR, formatUf, formatDecimalInput } from '@/lib/field-formatters'

import type { FiscalProfilePayload } from '../types/fiscal.types'

type Props = {
  form: FiscalProfilePayload
  onChange: (form: FiscalProfilePayload) => void
  onCancel: () => void
  onSubmit: () => void
}

export function FiscalProfileForm({ form, onChange, onCancel, onSubmit }: Props) {
  return (
    <PanelCard>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground">Dados fiscais da clínica</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirme as informações com o contador da clínica antes de ativar a emissão real.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <FormField label="Razão social" htmlFor="legalName" className="lg:col-span-2">
          <TextInput
            id="legalName"
            value={form.legalName}
            onChange={(e) => onChange({ ...form, legalName: e.target.value })}
          />
        </FormField>
        <FormField label="Nome fantasia" htmlFor="tradeName" optional>
          <TextInput
            id="tradeName"
            value={form.tradeName ?? ''}
            onChange={(e) => onChange({ ...form, tradeName: e.target.value })}
          />
        </FormField>
        <FormField label="CNPJ" htmlFor="documentNumber">
          <TextInput
            id="documentNumber"
            placeholder="00.000.000/0000-00"
            value={form.documentNumber}
            onChange={(e) => onChange({ ...form, documentNumber: formatCpfCnpjBR(e.target.value) })}
            maxLength={18}
          />
        </FormField>
        <FormField label="Inscrição municipal" htmlFor="municipalRegistration" optional>
          <TextInput
            id="municipalRegistration"
            placeholder="Informe a inscrição municipal"
            value={form.municipalRegistration ?? ''}
            onChange={(e) => onChange({ ...form, municipalRegistration: e.target.value })}
          />
        </FormField>
        <FormField label="Regime tributário" htmlFor="taxRegime">
          <Select
            value={form.taxRegime}
            onValueChange={(value) =>
              onChange({ ...form, taxRegime: value as FiscalProfilePayload['taxRegime'] })
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
        <FormField label="Código de serviço" htmlFor="profileServiceCode" optional>
          <TextInput
            id="profileServiceCode"
            placeholder="Ex: 04.12 ou código municipal"
            value={form.serviceCode ?? ''}
            onChange={(e) => onChange({ ...form, serviceCode: e.target.value })}
          />
        </FormField>
        <FormField label="CNAE" htmlFor="cnae" optional>
          <TextInput
            id="cnae"
            placeholder="Ex: 8630-5/04"
            value={form.cnae ?? ''}
            onChange={(e) => onChange({ ...form, cnae: e.target.value })}
          />
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
          />
        </FormField>
        <FormField label="CEP" htmlFor="zipCode">
          <TextInput
            id="zipCode"
            placeholder="00000-000"
            value={form.addressZipCode}
            onChange={(e) => onChange({ ...form, addressZipCode: formatCepBR(e.target.value) })}
            maxLength={9}
          />
        </FormField>
        <FormField label="Rua" htmlFor="street" className="lg:col-span-2">
          <TextInput
            id="street"
            value={form.addressStreet}
            onChange={(e) => onChange({ ...form, addressStreet: e.target.value })}
          />
        </FormField>
        <FormField label="Número" htmlFor="number">
          <TextInput
            id="number"
            value={form.addressNumber}
            onChange={(e) => onChange({ ...form, addressNumber: e.target.value })}
          />
        </FormField>
        <FormField label="Complemento" htmlFor="complement" optional>
          <TextInput
            id="complement"
            value={form.addressComplement ?? ''}
            onChange={(e) => onChange({ ...form, addressComplement: e.target.value })}
          />
        </FormField>
        <FormField label="Bairro" htmlFor="neighborhood">
          <TextInput
            id="neighborhood"
            value={form.addressNeighborhood}
            onChange={(e) => onChange({ ...form, addressNeighborhood: e.target.value })}
          />
        </FormField>
        <FormField label="Cidade" htmlFor="city">
          <TextInput
            id="city"
            value={form.addressCity}
            onChange={(e) => onChange({ ...form, addressCity: e.target.value })}
          />
        </FormField>
        <FormField label="UF" htmlFor="state">
          <TextInput
            id="state"
            maxLength={2}
            placeholder="SP"
            value={form.addressState}
            onChange={(e) => onChange({ ...form, addressState: formatUf(e.target.value) })}
          />
        </FormField>
        <FormField label="Código IBGE do município" htmlFor="ibgeCode" optional>
          <TextInput
            id="ibgeCode"
            placeholder="Ex: 3550308"
            value={form.cityIbgeCode ?? ''}
            onChange={(e) => onChange({ ...form, cityIbgeCode: e.target.value.replace(/\D/g, '') })}
            maxLength={7}
          />
        </FormField>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        A integração real com provedor fiscal ainda não está habilitada.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSubmit}>Salvar dados fiscais</Button>
      </div>
    </PanelCard>
  )
}
