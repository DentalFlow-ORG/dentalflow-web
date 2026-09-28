import { CheckCircle2, Info } from 'lucide-react'
import { useState } from 'react'

import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LegalPageShell } from '@/features/legal/components/LegalPageShell'
import { LegalPageHeader, LegalSection } from '@/features/legal/components/LegalSection'
import {
  EMAIL_MAX_LENGTH,
  INVALID_EMAIL_MESSAGE,
  isValidEmail,
  normalizeEmail,
} from '@/lib/validators/email'
import { ApiError } from '@/services/http'

import {
  type CreatePrivacyRequestPayload,
  type PrivacyRequestType,
  type RequesterType,
  createPrivacyRequest,
} from '../services/privacy.service'

type FormState = CreatePrivacyRequestPayload

// Limits mirror the API CreatePrivacyRequestDto.
const NAME_MIN_LENGTH = 2
const NAME_MAX_LENGTH = 150
const CLINIC_MAX_LENGTH = 150
const DESCRIPTION_MIN_LENGTH = 10
const DESCRIPTION_MAX_LENGTH = 2000

type FieldErrors = Partial<
  Record<
    'requesterName' | 'requesterEmail' | 'description' | 'identityConfirmationAccepted',
    string
  >
>

function validatePrivacyRequest(form: FormState): FieldErrors {
  const errors: FieldErrors = {}
  const name = form.requesterName.trim()
  if (name.length < NAME_MIN_LENGTH) {
    errors.requesterName = 'Informe seu nome completo.'
  }
  if (!isValidEmail(form.requesterEmail)) {
    errors.requesterEmail = INVALID_EMAIL_MESSAGE
  }
  if (form.description.trim().length < DESCRIPTION_MIN_LENGTH) {
    errors.description = `Descreva sua solicitação com pelo menos ${DESCRIPTION_MIN_LENGTH} caracteres.`
  }
  if (!form.identityConfirmationAccepted) {
    errors.identityConfirmationAccepted =
      'Você precisa aceitar a verificação de identidade para continuar.'
  }
  return errors
}

const INITIAL_STATE: FormState = {
  requesterName: '',
  requesterEmail: '',
  requesterType: 'PATIENT',
  clinicName: '',
  requestType: 'ACCESS_DATA',
  description: '',
  identityConfirmationAccepted: false,
}

const REQUEST_TYPE_LABELS: Record<PrivacyRequestType, string> = {
  CONFIRM_PROCESSING: 'Confirmar se meus dados são tratados',
  ACCESS_DATA: 'Acessar meus dados',
  CORRECT_DATA: 'Corrigir meus dados',
  DELETE_OR_ANONYMIZE: 'Excluir / anonimizar / bloquear meus dados',
  PORTABILITY: 'Portabilidade / exportação de dados',
  SHARING_INFORMATION: 'Informações sobre compartilhamento de dados',
  REVOKE_CONSENT: 'Revogar consentimento dado anteriormente',
  OTHER: 'Outra solicitação',
}

const REQUESTER_TYPE_LABELS: Record<RequesterType, string> = {
  PATIENT: 'Paciente de clínica',
  CLINIC_OWNER: 'Proprietário(a) de clínica',
  CLINIC_STAFF: 'Membro da equipe de clínica',
  OTHER: 'Outro',
}

function SuccessCard({ requestCode }: { requestCode: string }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
      <h2 className="mt-4 text-xl font-semibold text-emerald-900">
        Solicitação registrada com sucesso
      </h2>
      <p className="mt-2 text-emerald-700">
        Código da solicitação: <strong className="font-mono text-lg">{requestCode}</strong>
      </p>
      <p className="mt-4 text-sm text-emerald-600">
        Entraremos em contato pelo e-mail informado após validação da sua identidade. Guarde o
        código acima para acompanhamento.
      </p>
      <a
        href="/direitos-do-titular"
        className="mt-6 inline-block text-sm text-emerald-700 underline"
      >
        Voltar para Direitos do Titular
      </a>
    </div>
  )
}

export function PrivacyRequestFormPage() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [requestCode, setRequestCode] = useState<string | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => (key in prev ? { ...prev, [key]: undefined } : prev))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const errors = validatePrivacyRequest(form)
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    setIsSubmitting(true)
    try {
      const result = await createPrivacyRequest({
        ...form,
        requesterName: form.requesterName.trim(),
        requesterEmail: normalizeEmail(form.requesterEmail),
        clinicName: form.clinicName?.trim() || undefined,
        description: form.description.trim(),
      })
      setRequestCode(result.requestCode)
    } catch (err) {
      // A 400 carries the API's pt-BR explanation of what to fix.
      if (err instanceof ApiError && err.status === 400 && err.message) {
        setError(err.message)
        return
      }
      setError(
        'Não foi possível enviar sua solicitação. Tente novamente em instantes ou entre em contato por e-mail.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <LegalPageShell>
      <LegalPageHeader
        badge="Seus Direitos"
        title="Formulário de Solicitação"
        description="Exercite seus direitos de titular de dados. Todas as solicitações são registradas e respondidas dentro do prazo."
        lastUpdated="15 de maio de 2026"
      />

      {requestCode ? (
        <SuccessCard requestCode={requestCode} />
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <LegalSection id="identificacao" title="1. Identificação">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Nome completo"
                htmlFor="privacy-name"
                error={fieldErrors.requesterName}
              >
                <TextInput
                  id="privacy-name"
                  type="text"
                  value={form.requesterName}
                  onChange={(e) => set('requesterName', e.target.value)}
                  maxLength={NAME_MAX_LENGTH}
                  aria-invalid={fieldErrors.requesterName ? true : undefined}
                  aria-describedby={fieldErrors.requesterName ? 'privacy-name-error' : undefined}
                  autoComplete="name"
                  placeholder="Seu nome completo"
                />
              </FormField>

              <FormField label="E-mail" htmlFor="privacy-email" error={fieldErrors.requesterEmail}>
                <TextInput
                  id="privacy-email"
                  type="email"
                  inputMode="email"
                  value={form.requesterEmail}
                  onChange={(e) => set('requesterEmail', e.target.value)}
                  maxLength={EMAIL_MAX_LENGTH}
                  aria-invalid={fieldErrors.requesterEmail ? true : undefined}
                  aria-describedby={fieldErrors.requesterEmail ? 'privacy-email-error' : undefined}
                  autoComplete="email"
                  placeholder="seu@email.com"
                />
              </FormField>
            </div>

            <FormField label="Minha relação com a plataforma" htmlFor="privacy-requester-type">
              <Select
                value={form.requesterType}
                onValueChange={(v) => set('requesterType', v as RequesterType)}
              >
                <SelectTrigger id="privacy-requester-type" className="h-11 w-full">
                  <SelectValue placeholder="Selecione sua relação com a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REQUESTER_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Nome da clínica" htmlFor="privacy-clinic" optional>
              <TextInput
                id="privacy-clinic"
                type="text"
                maxLength={CLINIC_MAX_LENGTH}
                autoComplete="organization"
                value={form.clinicName}
                onChange={(e) => set('clinicName', e.target.value)}
                placeholder="Nome da clínica relacionada (se aplicável)"
              />
            </FormField>
          </LegalSection>

          <LegalSection id="solicitacao" title="2. Sua Solicitação">
            <FormField label="Tipo de solicitação" htmlFor="privacy-request-type">
              <Select
                value={form.requestType}
                onValueChange={(v) => set('requestType', v as PrivacyRequestType)}
              >
                <SelectTrigger id="privacy-request-type" className="h-11 w-full">
                  <SelectValue placeholder="Selecione o tipo de solicitação" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Descrição da solicitação"
              htmlFor="privacy-description"
              error={fieldErrors.description}
            >
              <TextArea
                id="privacy-description"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                maxLength={DESCRIPTION_MAX_LENGTH}
                placeholder="Descreva sua solicitação em detalhes..."
                aria-invalid={fieldErrors.description ? true : undefined}
                aria-describedby={
                  fieldErrors.description
                    ? 'privacy-description-error privacy-description-count'
                    : 'privacy-description-count'
                }
              />
              <p
                id="privacy-description-count"
                className="mt-1 text-xs text-muted-foreground text-right"
              >
                {form.description.length}/{DESCRIPTION_MAX_LENGTH}
              </p>
            </FormField>
          </LegalSection>

          <LegalSection id="verificacao" title="3. Verificação de Identidade">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <p className="text-sm text-slate-600">
                  Para proteger seus dados, precisamos verificar sua identidade antes de processar
                  solicitações de acesso, portabilidade ou exclusão. Podemos entrar em contato pelo
                  e-mail informado para confirmar a titularidade dos dados.
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={form.identityConfirmationAccepted}
                onChange={(e) => set('identityConfirmationAccepted', e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-input accent-primary"
                aria-invalid={fieldErrors.identityConfirmationAccepted ? true : undefined}
                aria-describedby={
                  fieldErrors.identityConfirmationAccepted ? 'privacy-identity-error' : undefined
                }
              />
              <span className="text-sm text-slate-700">
                Entendo que a DentalFlow poderá precisar verificar minha identidade antes de
                responder a esta solicitação, conforme exigido para proteger os dados pessoais dos
                titulares. <strong>Campo obrigatório.</strong>
              </span>
            </label>
            {fieldErrors.identityConfirmationAccepted && (
              <span
                id="privacy-identity-error"
                role="alert"
                className="block text-xs leading-5 text-destructive"
              >
                {fieldErrors.identityConfirmationAccepted}
              </span>
            )}
          </LegalSection>

          {error && (
            <div className="mt-4">
              <InlineFeedback tone="error">{error}</InlineFeedback>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={isSubmitting} className="min-w-[200px]">
              {isSubmitting ? 'Enviando...' : 'Enviar solicitação'}
            </Button>
            <p className="text-xs text-slate-400">
              Ao enviar, seus dados serão usados exclusivamente para responder a esta solicitação.
            </p>
          </div>
        </form>
      )}
    </LegalPageShell>
  )
}
