import {
  Lock,
  KeyRound,
  Eye,
  Server,
  AlertTriangle,
  RefreshCw,
  FileSearch,
} from 'lucide-react'

import { companyInfo } from '@/config/company'

import { LegalPageShell } from '../components/LegalPageShell'
import { LegalPageHeader, LegalSection, LegalList } from '../components/LegalSection'

const LAST_UPDATED = companyInfo.legalLastUpdatedDate

const measures = [
  {
    icon: Lock,
    title: 'Comunicações Seguras',
    description: 'Todas as comunicações entre o navegador e nossos servidores são protegidas por TLS/HTTPS.',
  },
  {
    icon: KeyRound,
    title: 'Autenticação Robusta',
    description: 'JWT com rotação automática de tokens de atualização. Senhas armazenadas com hash bcrypt.',
  },
  {
    icon: Eye,
    title: 'Controle de Acesso',
    description: 'RBAC (controle por papel) com isolamento de dados por clínica. Cada usuário acessa apenas o que seu papel permite.',
  },
  {
    icon: FileSearch,
    title: 'Logs de Auditoria',
    description: 'Ações sensíveis como acesso a prontuários, alterações de dados e eventos de autenticação são registradas.',
  },
  {
    icon: Server,
    title: 'Infraestrutura',
    description: 'Dados armazenados em infraestrutura com backups regulares. Acesso interno restrito ao princípio do menor privilégio.',
  },
  {
    icon: RefreshCw,
    title: 'Atualizações de Segurança',
    description: 'Dependências monitoradas e atualizadas regularmente para mitigar vulnerabilidades conhecidas.',
  },
]

export function SecurityPage() {
  return (
    <LegalPageShell>
      <LegalPageHeader
        badge="Segurança"
        title="Segurança da Plataforma"
        description="Medidas técnicas e organizacionais adotadas para proteger os dados da sua clínica e dos seus pacientes."
        lastUpdated={LAST_UPDATED}
      />

      <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {measures.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-6">{description}</p>
          </div>
        ))}
      </div>

      <LegalSection id="controle-acesso" title="Controle de Acesso Detalhado">
        <LegalList
          items={[
            'Isolamento por clínica: dados de uma clínica nunca são acessíveis por usuários de outra clínica.',
            'RBAC estrito: permissões verificadas no backend em cada requisição.',
            'Frontend exibe apenas o que o papel permite, mas a autorização definitiva ocorre no servidor.',
            'Sessões com expiração e revogação automática.',
          ]}
        />
      </LegalSection>

      <LegalSection id="dados-saude" title="Proteção de Dados de Saúde">
        <LegalList
          items={[
            'Prontuários acessíveis apenas por proprietários da clínica e dentistas autorizados.',
            'Logs de auditoria para acesso e modificação de registros clínicos.',
            'Dados de saúde nunca expostos em logs de sistema.',
            'Anexos clínicos com controle de tipo e tamanho de arquivo.',
          ]}
        />
      </LegalSection>

      <LegalSection id="autenticacao" title="Autenticação e Sessões">
        <LegalList
          items={[
            'Tokens de acesso JWT com curta validade.',
            'Tokens de atualização com rotação a cada uso.',
            'Tokens nunca registrados em logs ou expostos em URLs.',
            'Logout remoto invalida tokens de atualização.',
            'Tratamento gracioso de expiração de sessão no frontend.',
          ]}
        />
      </LegalSection>

      <LegalSection id="integracao-google" title="Segurança na Integração com Google Calendar">
        <LegalList
          items={[
            'Tokens OAuth do Google armazenados somente no servidor, nunca expostos ao navegador.',
            'Desconexão revoga imediatamente o acesso.',
            'Eventos criados com nível mínimo de informação de paciente por padrão.',
          ]}
        />
      </LegalSection>

      <LegalSection id="nenhuma-garantia" title="Sobre Garantias de Segurança">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">Nenhum sistema é 100% seguro</p>
              <p className="mt-2 text-amber-800 text-sm leading-6">
                Adotamos medidas técnicas e administrativas razoáveis e proporcionais ao risco,
                mas não garantimos segurança absoluta. Em caso de incidente com potencial impacto
                aos titulares, notificaremos a ANPD e os afetados conforme exigido pela LGPD.
              </p>
            </div>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="resposta-incidentes" title="Resposta a Incidentes">
        <p>
          Mantemos procedimentos internos de resposta a incidentes de segurança que incluem:
        </p>
        <LegalList
          items={[
            'Identificação e contenção do incidente.',
            'Avaliação de impacto e dados afetados.',
            'Notificação à ANPD quando houver risco relevante para titulares.',
            'Comunicação aos titulares afetados quando exigido pela LGPD.',
            'Revisão pós-incidente e melhoria de controles.',
          ]}
        />
      </LegalSection>

      <LegalSection id="divulgacao-responsavel" title="Divulgação Responsável de Vulnerabilidades">
        <p>
          Se você identificou uma vulnerabilidade de segurança na plataforma, pedimos que
          nos comunique de forma responsável antes de qualquer divulgação pública. Entre
          em contato por e-mail:{' '}
          <a href={`mailto:${companyInfo.securityEmail}`} className="text-primary underline">
            {companyInfo.securityEmail}
          </a>
          . Agradecemos a colaboração da comunidade de segurança.
        </p>
      </LegalSection>

      <LegalSection id="boas-praticas" title="Boas Práticas Recomendadas para Clínicas">
        <LegalList
          items={[
            'Utilize senhas únicas e fortes para cada membro da equipe.',
            'Não compartilhe credenciais de acesso entre colaboradores.',
            'Encerre sessões em dispositivos compartilhados.',
            'Mantenha os dispositivos utilizados para acessar a plataforma atualizados.',
            'Revise periodicamente os acessos dos membros da equipe.',
            'Relate qualquer atividade suspeita imediatamente ao suporte.',
          ]}
        />
      </LegalSection>

      <div className="mt-10">
        <a
          href="/politica-de-privacidade"
          className="text-sm text-primary underline"
        >
          Ver também: Política de Privacidade
        </a>
      </div>
    </LegalPageShell>
  )
}
