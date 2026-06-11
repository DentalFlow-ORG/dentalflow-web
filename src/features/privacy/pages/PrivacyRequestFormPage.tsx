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
  type CreatePrivacyRequestPayload,
  type PrivacyRequestType,
  type RequesterType,
  createPrivacyRequest,
} from '../services/privacy.service'

type FormState = CreatePrivacyRequestPayload

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
  const [requestCode, setRequestCode] = useState<string | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.identityConfirmationAccepted) {
      setError('Você precisa aceitar a verificação de identidade para continuar.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await createPrivacyRequest(form)
      setRequestCode(result.requestCode)
    } catch {
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
              <FormField label="Nome completo">
                <TextInput
                  type="text"
                  value={form.requesterName}
                  onChange={(e) => set('requesterName', e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Seu nome completo"
                />
              </FormField>

              <FormField label="E-mail">
                <TextInput
                  type="email"
                  value={form.requesterEmail}
                  onChange={(e) => set('requesterEmail', e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                />
              </FormField>
            </div>

            <FormField label="Minha relação com a plataforma">
              <Select
                value={form.requesterType}
                onValueChange={(v) => set('requesterType', v as RequesterType)}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
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

            <FormField label="Nome da clínica" optional>
              <TextInput
                type="text"
                value={form.clinicName}
                onChange={(e) => set('clinicName', e.target.value)}
                placeholder="Nome da clínica relacionada (se aplicável)"
              />
            </FormField>
          </LegalSection>

          <LegalSection id="solicitacao" title="2. Sua Solicitação">
            <FormField label="Tipo de solicitação">
              <Select
                value={form.requestType}
                onValueChange={(v) => set('requestType', v as PrivacyRequestType)}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
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

            <FormField label="Descrição da solicitação">
              <TextArea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                required
                maxLength={2000}
                placeholder="Descreva sua solicitação em detalhes..."
              />
              <p className="mt-1 text-xs text-muted-foreground text-right">
                {form.description.length}/2000
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
                required
              />
              <span className="text-sm text-slate-700">
                Entendo que a DentalFlow poderá precisar verificar minha identidade antes de
                responder a esta solicitação, conforme exigido para proteger os dados pessoais dos
                titulares. <strong>Campo obrigatório.</strong>
              </span>
            </label>
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
