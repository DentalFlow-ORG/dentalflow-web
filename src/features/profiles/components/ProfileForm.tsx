import { Save } from 'lucide-react'
import type { FormEvent } from 'react'

import { PanelCard } from '@/components/common/PanelCard'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import {
  formatCepBR,
  formatPhoneBR,
  formatSlug,
  formatUf,
  onlyDigits,
} from '@/lib/field-formatters'

import type { ProfileFormValues } from '../utils/profile-formatters'

type ProfileFormProps = {
  values: ProfileFormValues
  isSubmitting: boolean
  submitLabel: string
  error?: string | null
  onChange: (values: ProfileFormValues) => void
  onSubmit: () => void
}

export function ProfileForm({
  values,
  isSubmitting,
  submitLabel,
  error,
  onChange,
  onSubmit,
}: ProfileFormProps) {
  const updateValue = (field: keyof ProfileFormValues, value: string) => {
    onChange({ ...values, [field]: value })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <PanelCard>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Nome público" htmlFor="profile-display-name">
            <TextInput
              id="profile-display-name"
              value={values.displayName}
              placeholder="Dra. Ana Martins"
              minLength={2}
              maxLength={100}
              required
              onChange={(event) => updateValue('displayName', event.target.value)}
            />
          </FormField>

          <FormField
            label="Slug"
            htmlFor="profile-slug"
            hint="Use letras minúsculas, números e hífens."
          >
            <TextInput
              id="profile-slug"
              value={values.slug}
              placeholder="dra-ana-martins"
              minLength={3}
              maxLength={60}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
              onChange={(event) =>
                updateValue('slug', formatSlug(event.target.value))
              }
            />
          </FormField>

          <FormField label="CRO/CRM" htmlFor="profile-crm-number" optional>
            <TextInput
              id="profile-crm-number"
              value={values.crmNumber}
              placeholder="12345"
              maxLength={20}
              onChange={(event) => updateValue('crmNumber', onlyDigits(event.target.value))}
            />
          </FormField>

          <FormField label="UF do registro" htmlFor="profile-crm-state" optional>
            <TextInput
              id="profile-crm-state"
              value={values.crmState}
              placeholder="SP"
              maxLength={2}
              onChange={(event) =>
                updateValue('crmState', formatUf(event.target.value))
              }
            />
          </FormField>
        </div>

        <FormField label="Bio" htmlFor="profile-bio" className="mt-5">
          <TextArea
            id="profile-bio"
            value={values.bio}
            placeholder="Especialista em implantodontia e estética dental, com atendimento focado em previsibilidade e conforto."
            maxLength={2000}
            onChange={(event) => updateValue('bio', event.target.value)}
          />
        </FormField>
      </PanelCard>

      <PanelCard>
        <h2 className="text-lg font-semibold text-slate-950">Contato</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <FormField label="Telefone" htmlFor="profile-phone" optional>
            <TextInput
              id="profile-phone"
              value={values.phone}
              placeholder="(11) 4002-8922"
              inputMode="tel"
              maxLength={20}
              onChange={(event) =>
                updateValue('phone', formatPhoneBR(event.target.value))
              }
            />
          </FormField>

          <FormField label="WhatsApp" htmlFor="profile-whatsapp" optional>
            <TextInput
              id="profile-whatsapp"
              value={values.whatsappNumber}
              placeholder="(11) 94002-8922"
              inputMode="tel"
              maxLength={20}
              onChange={(event) =>
                updateValue('whatsappNumber', formatPhoneBR(event.target.value))
              }
            />
          </FormField>

          <FormField label="E-mail público" htmlFor="profile-public-email" optional>
            <TextInput
              id="profile-public-email"
              type="email"
              value={values.publicEmail}
              placeholder="contato@clinica.com.br"
              maxLength={254}
              onChange={(event) => updateValue('publicEmail', event.target.value)}
            />
          </FormField>

          <FormField label="Site" htmlFor="profile-website">
            <TextInput
              id="profile-website"
              value={values.websiteUrl}
              placeholder="https://clinica.com.br"
              maxLength={500}
              onChange={(event) => updateValue('websiteUrl', event.target.value)}
            />
          </FormField>
        </div>
      </PanelCard>

      <PanelCard>
        <h2 className="text-lg font-semibold text-slate-950">Presença e endereço</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <FormField label="Instagram" htmlFor="profile-instagram">
            <TextInput
              id="profile-instagram"
              value={values.instagramUrl}
              placeholder="https://instagram.com/clinica"
              maxLength={500}
              onChange={(event) => updateValue('instagramUrl', event.target.value)}
            />
          </FormField>

          <FormField label="Facebook" htmlFor="profile-facebook">
            <TextInput
              id="profile-facebook"
              value={values.facebookUrl}
              placeholder="https://facebook.com/clinica"
              maxLength={500}
              onChange={(event) => updateValue('facebookUrl', event.target.value)}
            />
          </FormField>

          <FormField label="Endereço" htmlFor="profile-address" className="md:col-span-2">
            <TextInput
              id="profile-address"
              value={values.addressLine1}
              placeholder="Av. Paulista, 1000 - Sala 1201"
              maxLength={200}
              onChange={(event) => updateValue('addressLine1', event.target.value)}
            />
          </FormField>

          <FormField label="Cidade" htmlFor="profile-city">
            <TextInput
              id="profile-city"
              value={values.city}
              placeholder="São Paulo"
              maxLength={100}
              onChange={(event) => updateValue('city', event.target.value)}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="UF" htmlFor="profile-state">
              <TextInput
                id="profile-state"
                value={values.state}
                placeholder="SP"
                maxLength={2}
                onChange={(event) =>
                  updateValue('state', formatUf(event.target.value))
                }
              />
            </FormField>

            <FormField label="CEP" htmlFor="profile-postal-code">
              <TextInput
                id="profile-postal-code"
                value={values.postalCode}
                placeholder="01310-100"
                inputMode="numeric"
                maxLength={9}
                onChange={(event) =>
                  updateValue('postalCode', formatCepBR(event.target.value))
                }
              />
            </FormField>
          </div>
        </div>
      </PanelCard>

      {error && (
        <InlineFeedback>{error}</InlineFeedback>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
