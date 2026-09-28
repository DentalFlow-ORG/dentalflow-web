import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { formatCepBR, formatCpfCnpjBR } from '@/lib/field-formatters'

import { FiscalProfileForm, type SavedFiscalIdentity } from '../components/FiscalProfileForm'
import { getFiscalProfile, saveFiscalProfile } from '../services/fiscal.service'
import type { FiscalProfilePayload } from '../types/fiscal.types'

const EMPTY_FORM: FiscalProfilePayload = {
  legalName: '',
  tradeName: '',
  documentType: 'CNPJ',
  documentNumber: '',
  municipalRegistration: '',
  stateRegistration: '',
  taxRegime: 'SIMPLES_NACIONAL',
  specialTaxRegime: '',
  serviceCode: '',
  cnae: '',
  issRate: null,
  addressStreet: '',
  addressNumber: '',
  addressComplement: '',
  addressNeighborhood: '',
  addressCity: '',
  addressState: '',
  addressZipCode: '',
  cityIbgeCode: '',
}

export function FiscalProfilePageContainer() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FiscalProfilePayload>(EMPTY_FORM)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedIdentity, setSavedIdentity] = useState<SavedFiscalIdentity | null>(null)

  useEffect(() => {
    getFiscalProfile()
      .then((res) => {
        const p = res.profile
        if (p) {
          setSavedIdentity({ documentNumber: p.documentNumber, taxRegime: p.taxRegime })
          setForm({
            legalName: p.legalName,
            tradeName: p.tradeName ?? '',
            documentType: p.documentType,
            documentNumber: p.documentNumber ? formatCpfCnpjBR(p.documentNumber) : '',
            municipalRegistration: p.municipalRegistration ?? '',
            stateRegistration: p.stateRegistration ?? '',
            taxRegime: p.taxRegime,
            specialTaxRegime: p.specialTaxRegime ?? '',
            serviceCode: p.serviceCode ?? '',
            cnae: p.cnae ?? '',
            issRate: p.issRate,
            addressStreet: p.addressStreet,
            addressNumber: p.addressNumber,
            addressComplement: p.addressComplement ?? '',
            addressNeighborhood: p.addressNeighborhood,
            addressCity: p.addressCity,
            addressState: p.addressState,
            addressZipCode: p.addressZipCode ? formatCepBR(p.addressZipCode) : '',
            cityIbgeCode: p.cityIbgeCode ?? '',
          })
        }
      })
      .catch(() => setLoadError('Não foi possível carregar o perfil fiscal.'))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleSubmit() {
    setIsSaving(true)
    setSaveSuccess(false)
    setSaveError(null)
    try {
      await saveFiscalProfile(form)
      setSavedIdentity({ documentNumber: form.documentNumber, taxRegime: form.taxRegime })
      setSaveSuccess(true)
    } catch (error) {
      setSaveError(
        error instanceof Error && error.message
          ? error.message
          : 'Não foi possível salvar o perfil fiscal. Tente novamente.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancel() {
    navigate({ to: '/app/configuracoes' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Carregando perfil fiscal...
      </div>
    )
  }

  if (loadError) {
    return <InlineFeedback tone="error">{loadError}</InlineFeedback>
  }

  return (
    <div className="space-y-4">
      <FiscalProfileForm
        form={form}
        savedIdentity={savedIdentity}
        onChange={setForm}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />
      {saveSuccess && (
        <InlineFeedback tone="success">Perfil fiscal atualizado com sucesso.</InlineFeedback>
      )}
      {saveError && <InlineFeedback tone="error">{saveError}</InlineFeedback>}
    </div>
  )
}
