import { Link } from '@tanstack/react-router'
import { ArrowRight, FileCheck, Eye, Pencil, Trash2, Download, Share2, XCircle } from 'lucide-react'

import { companyInfo } from '@/config/company'

import { LegalPageShell } from '../components/LegalPageShell'
import {
  LegalPageHeader,
  LegalSection,
  LegalList,
  legalInlineLinkClass,
} from '../components/LegalSection'

const LAST_UPDATED = companyInfo.legalLastUpdatedDate

const rights = [
  {
    icon: FileCheck,
    title: 'Confirmação',
    description: 'Saber se tratamos seus dados pessoais.',
    article: 'Art. 18, I',
  },
  {
    icon: Eye,
    title: 'Acesso',
    description: 'Obter cópia dos seus dados pessoais tratados.',
    article: 'Art. 18, II',
  },
  {
    icon: Pencil,
    title: 'Correção',
    description: 'Solicitar atualização de dados incompletos, inexatos ou desatualizados.',
    article: 'Art. 18, III',
  },
  {
    icon: Trash2,
    title: 'Eliminação',
    description: 'Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade.',
    article: 'Art. 18, IV',
  },
  {
    icon: Download,
    title: 'Portabilidade',
    description: 'Receber seus dados em formato estruturado para transferência a outro fornecedor.',
    article: 'Art. 18, V',
  },
  {
    icon: Share2,
    title: 'Informação sobre Compartilhamento',
    description: 'Saber com quais entidades públicas ou privadas seus dados são compartilhados.',
    article: 'Art. 18, VII',
  },
  {
    icon: XCircle,
    title: 'Revogação de Consentimento',
    description: 'Retirar o consentimento dado para tratamento de dados.',
    article: 'Art. 18, IX',
  },
]

export function DataRightsPage() {
  return (
    <LegalPageShell>
      <LegalPageHeader
        badge="Seus Direitos"
        title="Direitos do Titular de Dados"
        description="Conheça seus direitos sob a LGPD e saiba como solicitá-los junto à DentalFlow."
        lastUpdated={LAST_UPDATED}
      />

      <LegalSection id="seus-direitos" title="1. Seus Direitos (LGPD, Art. 18)">
        <div className="grid gap-4 sm:grid-cols-2">
          {rights.map(({ icon: Icon, title, description, article }) => (
            <div key={title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex shrink-0 rounded-md bg-primary/10 p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{title}</p>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                      {article}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 leading-6">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection id="como-solicitar" title="2. Como Solicitar">
        <p>
          Para exercer seus direitos, preencha o formulário de solicitação. Todas as
          solicitações são registradas e respondidas dentro de prazo razoável.
        </p>
        <div className="mt-5">
          <Link
            to="/direitos-do-titular/solicitar"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Fazer uma solicitação
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </LegalSection>

      <LegalSection id="verificacao-identidade" title="3. Verificação de Identidade">
        <p>
          Para proteger seus dados, precisamos verificar sua identidade antes de
          atender a solicitações de acesso, portabilidade ou eliminação. Podemos solicitar:
        </p>
        <LegalList
          items={[
            'Confirmação do e-mail cadastrado.',
            'Informações que permitam confirmar a titularidade dos dados.',
            'Em casos complexos, podemos solicitar documentação adicional.',
          ]}
        />
        <p>
          Não coletaremos mais informações do que o necessário para verificar a identidade.
        </p>
      </LegalSection>

      <LegalSection id="prazos" title="4. Prazos de Resposta">
        <p>
          Nos esforçamos para responder às solicitações dentro de 15 (quinze) dias úteis.
          Em casos complexos, podemos informar a extensão do prazo com justificativa.
        </p>
      </LegalSection>

      <LegalSection id="limitacoes" title="5. Casos em que Pode Haver Limitações">
        <p>
          Em algumas situações, pode não ser possível atender integralmente a uma
          solicitação de eliminação ou portabilidade:
        </p>
        <LegalList
          items={[
            'Prontuários odontológicos: o CFO orienta retenção mínima de 10 anos após o último atendimento, mesmo após solicitação de exclusão.',
            'Dados fiscais: a legislação tributária brasileira exige retenção de dados por no mínimo 5 anos.',
            'Defesa legal: dados podem ser retidos enquanto necessários para defesa em processos judiciais ou administrativos.',
            'Obrigações legais: quando houver dever legal de manutenção dos dados.',
          ]}
        />
        <p>
          Nesses casos, informaremos o motivo e o prazo previsto de retenção.
        </p>
      </LegalSection>

      <LegalSection id="dados-pacientes" title="6. Pacientes de Clínicas">
        <p>
          Se você é paciente de uma clínica que utiliza a DentalFlow, a clínica é a
          controladora dos seus dados de saúde. Para exercer seus direitos sobre esses
          dados, recomendamos contatar diretamente a clínica.
        </p>
        <p>
          A DentalFlow cooperará com solicitações legítimas encaminhadas pela clínica
          controladora ou diretamente por titulares quando for legalmente possível.
        </p>
      </LegalSection>

      <LegalSection id="anpd" title="7. Petição à ANPD">
        <p>
          Se considerar que seus direitos não foram atendidos de forma satisfatória, você
          pode registrar reclamação junto à Autoridade Nacional de Proteção de Dados
          (ANPD) pelo portal{' '}
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

      <LegalSection id="contato" title="8. Contato">
        <p>
          Para dúvidas sobre seus direitos ou o tratamento dos seus dados, entre em
          contato com nosso encarregado:{' '}
          <a
            href={`mailto:${companyInfo.dpoEmail}`}
            className={legalInlineLinkClass}
          >
            {companyInfo.dpoEmail}
          </a>
          .
        </p>
        <p>
          Consulte também nossa{' '}
          <Link to="/encarregado" className={legalInlineLinkClass}>
            página do Encarregado de Dados
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  )
}
