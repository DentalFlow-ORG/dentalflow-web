import { companyInfo } from '@/config/company'

import { LegalPageShell } from '../components/LegalPageShell'
import { LegalPageHeader, LegalSection, LegalList, LegalTable } from '../components/LegalSection'

const LAST_UPDATED = companyInfo.legalLastUpdatedDate

export function DataProcessingPage() {
  return (
    <LegalPageShell>
      <LegalPageHeader
        badge="Privacidade"
        title="Tratamento de Dados — DPA"
        description="Como a DentalFlow processa dados em nome das clínicas e os papéis de cada parte na cadeia de tratamento."
        lastUpdated={LAST_UPDATED}
      />

      <LegalSection id="introducao" title="1. Introdução">
        <p>
          Este documento descreve os princípios e condições do tratamento de dados
          realizado pela DentalFlow em relação aos dados de pacientes e clínicas.
          Constitui um modelo de Acordo de Processamento de Dados (DPA) e deve ser
          revisado e adaptado por advogado especializado antes de ser utilizado como
          instrumento contratual vinculante.
        </p>
      </LegalSection>

      <LegalSection id="papeis" title="2. Papéis no Tratamento">
        <div className="space-y-5">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
            <h3 className="font-semibold text-blue-900">
              Clínica como Controladora (Controlador)
            </h3>
            <p className="mt-2 text-blue-800">
              A clínica odontológica determina as finalidades e os meios do tratamento
              dos dados de seus pacientes. Como controladora, a clínica é responsável por:
            </p>
            <LegalList
              items={[
                'Ter base legal adequada para coletar e inserir dados de pacientes na plataforma.',
                'Informar os pacientes sobre o tratamento de seus dados.',
                'Atender às solicitações de exercício de direitos feitas pelos pacientes.',
                'Garantir que seus colaboradores utilizem a plataforma dentro dos limites autorizados.',
              ]}
            />
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <h3 className="font-semibold text-emerald-900">
              DentalFlow como Operadora (Operador/Processador)
            </h3>
            <p className="mt-2 text-emerald-800">
              Para os dados de pacientes e registros clínicos, a DentalFlow atua como
              operador, processando os dados conforme as instruções da clínica (controladora).
            </p>
            <LegalList
              items={[
                'Trata os dados somente conforme instruções da clínica e finalidades contratadas.',
                'Mantém medidas técnicas e administrativas de segurança adequadas.',
                'Notifica a clínica sobre incidentes de segurança relevantes.',
                'Apoia a clínica no atendimento de solicitações de titulares.',
                'Elimina ou devolve dados ao término do contrato, conforme legislação.',
              ]}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-semibold text-slate-900">
              DentalFlow como Controladora (dados próprios)
            </h3>
            <p className="mt-2 text-slate-600">
              Para dados de contas de usuários, faturamento, segurança da plataforma e
              analytics próprios, a DentalFlow atua como controladora independente.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="subprocessadores" title="3. Suboperadores (Subprocessadores)">
        <p>
          A DentalFlow utiliza os seguintes suboperadores no processamento de dados:
        </p>
        <LegalTable
          headers={['Suboperador', 'Dados', 'Finalidade', 'Localização']}
          rows={[
            ['Stripe, Inc.', 'Dados de pagamento', 'Processamento de assinaturas', 'EUA (PCI DSS)'],
            ['Supabase / PostgreSQL', 'Todos os dados da plataforma', 'Armazenamento e banco de dados', 'Verificar região configurada'],
            ['Google LLC', 'Metadados de eventos de agenda', 'Integração com Google Calendar', 'EUA (quando integração ativa)'],
            ['Provedor de e-mail transacional', 'Nome, e-mail', 'Envio de notificações', 'A definir'],
          ]}
        />
        <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-200">
          A lista de suboperadores pode ser atualizada. Requer revisão jurídica para
          assegurar adequação da transferência internacional de dados conforme Art. 33 da LGPD.
        </p>
      </LegalSection>

      <LegalSection id="medidas-seguranca" title="4. Medidas de Segurança">
        <p>
          A DentalFlow adota medidas técnicas e organizacionais proporcionais ao risco:
        </p>
        <LegalList
          items={[
            'Comunicações protegidas por TLS/HTTPS.',
            'Controle de acesso por papel com isolamento de dados por clínica.',
            'Senhas com hash seguro (bcrypt).',
            'Autenticação com JWT e rotação de tokens.',
            'Logs de auditoria para ações sensíveis.',
            'Acesso interno baseado no princípio do menor privilégio.',
            'Backups regulares com medidas de proteção.',
          ]}
        />
      </LegalSection>

      <LegalSection id="notificacao-incidentes" title="5. Notificação de Incidentes">
        <p>
          Em caso de incidente de segurança que possa impactar dados de pacientes das
          clínicas, a DentalFlow notificará a clínica (controladora) dentro de prazo
          razoável, com as informações disponíveis sobre a natureza do incidente, dados
          afetados e medidas tomadas.
        </p>
        <p>
          A clínica é responsável por notificar a ANPD e os titulares conforme exigido
          pela LGPD, quando aplicável.
        </p>
      </LegalSection>

      <LegalSection id="confidencialidade" title="6. Confidencialidade">
        <p>
          A DentalFlow e seus colaboradores com acesso a dados pessoais de clientes
          estão sujeitos a obrigações de confidencialidade. Os dados de clínicas e
          pacientes não são compartilhados entre clínicas ou com terceiros não autorizados.
        </p>
      </LegalSection>

      <LegalSection id="encerramento" title="7. Encerramento do Contrato">
        <p>
          Ao término do contrato, a DentalFlow:
        </p>
        <LegalList
          items={[
            'Disponibilizará ferramentas de exportação de dados dentro do período de carência pós-cancelamento.',
            'Procederá à exclusão ou anonimização dos dados após o período de retenção legalmente exigido.',
            'Manterá dados pelo tempo mínimo exigido por lei (ex: prontuários conforme CFO, dados fiscais conforme CTN).',
          ]}
        />
      </LegalSection>

      <LegalSection id="auditoria" title="8. Auditoria e Documentação">
        <p>
          A DentalFlow mantém registros internos das atividades de tratamento e está
          preparada para cooperar com auditorias realizadas pela clínica controladora ou
          pela ANPD, dentro dos limites legais e contratuais.
        </p>
      </LegalSection>

      <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Contato</p>
        <p className="mt-1">
          Para questões sobre tratamento de dados:{' '}
          <a
            href={`mailto:${companyInfo.privacyEmail}`}
            className="text-primary underline"
          >
            {companyInfo.privacyEmail}
          </a>
        </p>
        <p className="mt-3 text-xs text-slate-400">
          {companyInfo.legalName} — CNPJ {companyInfo.documentNumber}
        </p>
      </div>
    </LegalPageShell>
  )
}
