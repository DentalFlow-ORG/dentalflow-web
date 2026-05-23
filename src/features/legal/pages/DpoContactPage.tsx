import { Mail, Clock, Shield, FileText } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { companyInfo } from '@/config/company'
import { cn } from '@/lib/utils'

import { LegalPageShell } from '../components/LegalPageShell'
import {
  LegalPageHeader,
  LegalSection,
  LegalList,
  legalInlineLinkClass,
} from '../components/LegalSection'

const LAST_UPDATED = companyInfo.legalLastUpdatedDate
const DPO_EMAIL = companyInfo.dpoEmail
const isPlaceholderCnpj = companyInfo.documentNumber === '00.000.000/0001-00'
const isPlaceholderAddress = companyInfo.address.includes('TODO')

export function DpoContactPage() {
  return (
    <LegalPageShell>
      <LegalPageHeader
        badge="DPO"
        title="Encarregado de Proteção de Dados"
        description="Canal oficial para questões relacionadas à privacidade e proteção de dados pessoais na DentalFlow."
        lastUpdated={LAST_UPDATED}
      />

      <div className="mb-10 rounded-xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-start gap-4">
          <div className="inline-flex shrink-0 rounded-lg bg-primary/10 p-3">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Encarregado de Proteção de Dados</p>
            <p className="mt-1 text-slate-600">
              {companyInfo.legalName}
            </p>
            <a
              href={`mailto:${DPO_EMAIL}`}
              className={cn('mt-2 inline-flex items-center gap-2 text-sm', legalInlineLinkClass)}
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {DPO_EMAIL}
            </a>
          </div>
        </div>
      </div>

      <LegalSection id="papel" title="1. Papel do Encarregado">
        <p>
          Conforme o Art. 41 da LGPD, o encarregado de proteção de dados (também
          conhecido como DPO — Data Protection Officer) é responsável por:
        </p>
        <LegalList
          items={[
            'Aceitar reclamações e comunicações dos titulares, prestar esclarecimentos e adotar providências.',
            'Receber comunicações da ANPD e adotar providências.',
            'Orientar os colaboradores e os contratados da empresa a respeito das práticas a serem tomadas em relação à proteção de dados pessoais.',
            'Executar as demais atribuições determinadas pelo controlador ou estabelecidas em normas complementares.',
          ]}
        />
      </LegalSection>

      <LegalSection id="quando-contatar" title="2. Quando Contatar o Encarregado">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: FileText,
              title: 'Direitos do Titular',
              items: [
                'Solicitar acesso aos seus dados',
                'Solicitar correção de dados',
                'Solicitar eliminação de dados',
                'Solicitar portabilidade',
                'Revogar consentimento',
              ],
            },
            {
              icon: Shield,
              title: 'Questões de Privacidade',
              items: [
                'Dúvidas sobre o tratamento dos seus dados',
                'Questionamentos sobre a Política de Privacidade',
                'Reportar possível violação de privacidade',
                'Solicitações de clínicas (controladoras)',
                'Questões sobre suboperadores',
              ],
            },
          ].map(({ icon: Icon, title, items }) => (
            <div key={title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <p className="font-semibold text-slate-900">{title}</p>
              </div>
              <LegalList items={items} />
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection id="como-contatar" title="3. Como Entrar em Contato">
        <p>
          Envie um e-mail para{' '}
          <a href={`mailto:${DPO_EMAIL}`} className={legalInlineLinkClass}>
            {DPO_EMAIL}
          </a>{' '}
          com as seguintes informações:
        </p>
        <LegalList
          ordered
          items={[
            'Seu nome completo.',
            'Seu e-mail de cadastro (se aplicável).',
            'Descrição clara da sua solicitação ou dúvida.',
            'Relação com a plataforma: usuário, paciente, clínica etc.',
          ]}
        />
        <p>
          Para solicitações de exercício de direitos, você também pode usar nosso{' '}
          <Link to="/direitos-do-titular/solicitar" className={legalInlineLinkClass}>
            formulário online
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection id="prazo" title="4. Prazo de Resposta">
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-slate-600">
            Nosso objetivo é responder às solicitações dentro de{' '}
            <strong>15 (quinze) dias úteis</strong>. Em casos complexos, poderemos
            informar a extensão do prazo com justificativa.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="anpd" title="5. Autoridade Nacional de Proteção de Dados (ANPD)">
        <p>
          Se sua solicitação não for atendida de forma satisfatória, você pode entrar
          em contato com a ANPD pelo portal{' '}
          <a
            href="https://www.gov.br/anpd"
            target="_blank"
            rel="noopener noreferrer"
            className={legalInlineLinkClass}
          >
            www.gov.br/anpd
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="empresa" title="6. Dados da Empresa">
        <dl className="space-y-2 text-sm">
          {(
            [
              ['Razão Social', companyInfo.legalName],
              ...(!isPlaceholderCnpj ? [['CNPJ', companyInfo.documentNumber]] : []),
              ...(!isPlaceholderAddress ? [['Endereço', companyInfo.address]] : []),
              ['E-mail geral', companyInfo.supportEmail],
              ['E-mail de privacidade', DPO_EMAIL],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label} className="flex flex-wrap gap-2">
              <dt className="font-semibold text-slate-700">{label}:</dt>
              <dd className="text-slate-600">{value}</dd>
            </div>
          ))}
        </dl>
      </LegalSection>
    </LegalPageShell>
  )
}
