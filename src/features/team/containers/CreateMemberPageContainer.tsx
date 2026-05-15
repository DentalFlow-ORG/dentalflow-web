import { Link } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { FormField, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { PanelCard } from '@/components/common/PanelCard'
import { PasswordInput } from '@/components/common/PasswordInput'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { formatPhoneBR, formatUf, onlyDigits } from '@/lib/field-formatters'

import { MemberAvailabilityDraft } from '../components/MemberAvailabilityDraft'
import { MemberTypeSelector } from '../components/MemberTypeSelector'
import { SpecialtyPicker } from '../components/SpecialtyPicker'
import { useCreateMemberPage } from '../hooks/useCreateMemberPage'

export function CreateMemberPageContainer() {
  const {
    form,
    set,
    specialties,
    availability,
    setAvailability,
    isSubmitting,
    error,
    isProfessional,
    handleDisplayNameChange,
    handleSlugChange,
    handleSubmit,
  } = useCreateMemberPage()

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <AppPageHeader
        eyebrow="Equipe"
        title="Adicionar membro"
        description="Cadastre um profissional ou assistente para a sua clínica."
        action={
          <Button variant="outline" asChild>
            <Link to="/app/equipe">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <PanelCard>
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Tipo de membro
          </h2>
          <MemberTypeSelector
            value={form.role}
            onChange={(role) => set('role', role)}
          />
        </PanelCard>

        <PanelCard>
          <h2 className="mb-5 text-base font-semibold text-foreground">
            Dados pessoais
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Nome" htmlFor="firstName">
              <TextInput
                id="firstName"
                required
                minLength={2}
                maxLength={50}
                disabled={isSubmitting}
                placeholder="Ana"
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
              />
            </FormField>

            <FormField label="Sobrenome" htmlFor="lastName">
              <TextInput
                id="lastName"
                required
                minLength={2}
                maxLength={50}
                disabled={isSubmitting}
                placeholder="Martins"
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
              />
            </FormField>

            <FormField label="E-mail" htmlFor="email">
              <TextInput
                id="email"
                type="email"
                required
                maxLength={254}
                disabled={isSubmitting}
                placeholder="ana@clinica.com.br"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </FormField>

            <FormField label="Telefone" htmlFor="phone" optional>
              <TextInput
                id="phone"
                type="tel"
                maxLength={20}
                disabled={isSubmitting}
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={(e) => set('phone', formatPhoneBR(e.target.value))}
              />
            </FormField>
          </div>

          <div className="mt-5">
            <FormField
              label="Senha de acesso"
              htmlFor="password"
              hint="Mínimo de 8 caracteres. O membro poderá alterar a senha após o primeiro acesso."
            >
              <PasswordInput
                id="password"
                required
                minLength={8}
                maxLength={72}
                disabled={isSubmitting}
                placeholder="Crie uma senha inicial"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
            </FormField>
          </div>
        </PanelCard>

        {isProfessional && (
          <PanelCard>
            <h2 className="mb-5 text-base font-semibold text-foreground">
              Perfil profissional
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Nome público" htmlFor="displayName">
                <TextInput
                  id="displayName"
                  required={isProfessional}
                  minLength={2}
                  maxLength={100}
                  disabled={isSubmitting}
                  placeholder="Dra. Ana Martins"
                  value={form.displayName}
                  onChange={(e) => handleDisplayNameChange(e.target.value)}
                />
              </FormField>

              <FormField
                label="Slug"
                htmlFor="slug"
                hint="Letras minúsculas, números e hífens."
              >
                <TextInput
                  id="slug"
                  required={isProfessional}
                  minLength={3}
                  maxLength={60}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  disabled={isSubmitting}
                  placeholder="dra-ana-martins"
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                />
              </FormField>

              <FormField label="Nº do registro (CRO/CRM)" htmlFor="crmNumber" optional>
                <TextInput
                  id="crmNumber"
                  maxLength={20}
                  disabled={isSubmitting}
                  placeholder="12345"
                  value={form.crmNumber}
                  onChange={(e) => set('crmNumber', onlyDigits(e.target.value))}
                />
              </FormField>

              <FormField label="UF do registro" htmlFor="crmState" optional>
                <TextInput
                  id="crmState"
                  maxLength={2}
                  disabled={isSubmitting}
                  placeholder="SP"
                  value={form.crmState}
                  onChange={(e) => set('crmState', formatUf(e.target.value))}
                />
              </FormField>
            </div>
          </PanelCard>
        )}

        {isProfessional && (
          <PanelCard>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Especialidades
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Selecione as especialidades do profissional. Aparecem no perfil
                público da clínica.
              </p>
            </div>
            <SpecialtyPicker
              specialties={specialties}
              selected={form.specialtyIds}
              onChange={(ids) => set('specialtyIds', ids)}
              disabled={isSubmitting}
            />
          </PanelCard>
        )}

        {isProfessional && (
          <PanelCard>
            <MemberAvailabilityDraft
              value={availability}
              onChange={setAvailability}
              disabled={isSubmitting}
            />
          </PanelCard>
        )}

        {error && <InlineFeedback>{error}</InlineFeedback>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link to="/app/equipe">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting
              ? 'Cadastrando...'
              : isProfessional
                ? 'Cadastrar profissional'
                : 'Cadastrar assistente'}
          </Button>
        </div>
      </form>
    </div>
  )
}
