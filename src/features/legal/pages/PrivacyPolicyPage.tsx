import { Link } from '@tanstack/react-router'

import { companyInfo } from '@/config/company'

import { LegalPageShell } from '../components/LegalPageShell'
import {
  LegalPageHeader,
  LegalSection,
  LegalList,
  LegalTable,
  LegalTOC,
  LegalContactBlock,
  legalInlineLinkClass,
} from '../components/LegalSection'

const LAST_UPDATED = companyInfo.legalLastUpdatedDate
const DPO_EMAIL = companyInfo.dpoEmail
const isPlaceholderCnpj = companyInfo.documentNumber === '00.000.000/0001-00'

const TOC_ENTRIES = [
  { id: 'quem-somos', label: '1. Quem Somos' },
  { id: 'escopo', label: '2. Âmbito desta Política' },
  { id: 'dados-coletados', label: '3. Dados que Coletamos' },
  { id: 'como-coletamos', label: '4. Como Coletamos os Dados' },
  { id: 'finalidades', label: '5. Para que Usamos os Dados' },
  { id: 'dados-sensiveis', label: '6. Dados de Saúde — Sensíveis' },
  { id: 'controlador-operador', label: '7. Clínica como Controladora' },
  { id: 'compartilhamento', label: '8. Compartilhamento de Dados' },
  { id: 'stripe', label: '9. Pagamentos via Stripe' },
  { id: 'google-calendar', label: '10. Integração com Google Calendar' },
  { id: 'cookies', label: '11. Cookies e Tecnologias Similares' },
  { id: 'seguranca', label: '12. Medidas de Segurança' },
  { id: 'retencao', label: '13. Retenção de Dados' },
  { id: 'transferencia', label: '14. Transferência Internacional' },
  { id: 'direitos', label: '15. Seus Direitos como Titular' },
  { id: 'encarregado', label: '16. Contato com o Encarregado (DPO)' },
  { id: 'anpd', label: '17. Reclamação à ANPD' },
  { id: 'atualizacoes', label: '18. Atualizações desta Política' },
]

export function PrivacyPolicyPage() {
  return (
    <LegalPageShell>
      <LegalPageHeader
        badge="Legal"
        title="Política de Privacidade"
        description="Saiba como coletamos, usamos e protegemos seus dados pessoais na plataforma DentalFlow."
        lastUpdated={LAST_UPDATED}
      />

      <LegalTOC entries={TOC_ENTRIES} />

      <LegalSection id="quem-somos" title="1. Quem Somos">
        <p>
          {companyInfo.tradeName} ({companyInfo.legalName}{!isPlaceholderCnpj && `, CNPJ ${companyInfo.documentNumber}`}) é uma
          plataforma SaaS para gestão de clínicas odontológicas. Nosso papel em relação aos
          dados pessoais depende do contexto:
        </p>
        <LegalList
          items={[
            `Atuamos como controlador para dados de contas, faturamento, segurança e analytics da própria plataforma.`,
            `Atuamos como operador (processador) para dados de pacientes e registros clínicos inseridos pelas clínicas, que são as controladoras desses dados.`,
          ]}
        />
      </LegalSection>

      <LegalSection id="escopo" title="2. Âmbito desta Política">
        <p>
          Esta política se aplica ao uso da plataforma DentalFlow por clínicas, profissionais
          de saúde, equipes administrativas e, quando aplicável, pacientes. Abrange todas as
          funcionalidades disponíveis no sistema, incluindo agendamentos, prontuários
          digitais, faturamento e integrações.
        </p>
      </LegalSection>

      <LegalSection id="dados-coletados" title="3. Dados que Coletamos">
        <p>Coletamos as seguintes categorias de dados:</p>
        <LegalList
          items={[
            'Dados de cadastro: nome, e-mail, telefone e informações de perfil dos usuários da plataforma.',
            'Dados da clínica: razão social, CNPJ, endereço e informações de contato.',
            'Dados de pacientes: nome, contato e histórico de agendamentos (inseridos pela clínica).',
            'Dados de saúde (sensíveis): prontuários, anotações clínicas, diagnósticos, anamneses, prescrições e imagens inseridos pela clínica.',
            'Dados financeiros: informações de pagamento e assinatura processadas pela Stripe.',
            'Dados técnicos: endereços IP (quando necessário para segurança), navegador, logs de acesso e metadados de sessão.',
            'Dados de integração: metadados de conexão com o Google Calendar.',
            'Dados de consentimento: suas escolhas sobre cookies e comunicações.',
          ]}
        />
      </LegalSection>

      <LegalSection id="como-coletamos" title="4. Como Coletamos os Dados">
        <LegalList
          items={[
            'Diretamente, quando você preenche formulários de cadastro ou usa a plataforma.',
            'Automaticamente, via cookies e tecnologias similares (conforme sua escolha de consentimento).',
            'Via integrações autorizadas por você, como o Google Calendar.',
            'Pela clínica, quando ela registra dados de pacientes na plataforma.',
          ]}
        />
      </LegalSection>

      <LegalSection id="finalidades" title="5. Para que Usamos os Dados">
        <LegalTable
          headers={['Finalidade', 'Dados Envolvidos', 'Base Legal (preliminar)']}
          rows={[
            ['Autenticação e controle de acesso', 'E-mail, senha, sessão', 'Execução de contrato'],
            ['Prestação dos serviços contratados', 'Todos os dados do sistema', 'Execução de contrato'],
            ['Processamento de pagamento', 'Dados de faturamento (via Stripe)', 'Execução de contrato'],
            ['Atendimento ao suporte', 'Dados de conta e contexto do problema', 'Execução de contrato'],
            ['Prontuário e registros clínicos', 'Dados de saúde inseridos pela clínica', 'Tutela da saúde (Art. 11, II, f LGPD)'],
            ['Segurança e prevenção de fraudes', 'Logs, IP, metadados', 'Legítimo interesse'],
            ['Cumprimento de obrigações legais', 'Dados fiscais e financeiros', 'Obrigação legal'],
            ['Consentimento de cookies e preferências', 'Categorias aceitas, timestamp', 'Consentimento'],
          ]}
        />
        <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-200">
          As bases legais listadas são preliminares e requerem validação jurídica especializada.
        </p>
      </LegalSection>

      <LegalSection id="dados-sensiveis" title="6. Dados de Saúde — Dados Sensíveis">
        <p>
          Os prontuários e registros clínicos inseridos pelas clínicas constituem dados
          sensíveis nos termos do Art. 11 da LGPD. Adotamos medidas técnicas e
          administrativas especiais para esses dados:
        </p>
        <LegalList
          items={[
            'Controle de acesso restrito: somente usuários com papel autorizado (proprietário da clínica e dentistas vinculados) podem acessar prontuários.',
            'Logs de auditoria para rastreabilidade de acessos e alterações.',
            'Criptografia em trânsito (HTTPS) e em repouso onde aplicável.',
            'A clínica é responsável pela gestão do consentimento de seus pacientes para o tratamento dos dados clínicos.',
          ]}
        />
      </LegalSection>

      <LegalSection id="controlador-operador" title="7. Clínica como Controladora e DentalFlow como Operador">
        <p>
          Para dados de pacientes e registros clínicos, a clínica odontológica é a
          controladora dos dados e DentalFlow atua como operador, processando os dados
          conforme as instruções da clínica e as condições do contrato de prestação de
          serviços.
        </p>
        <p>
          O paciente deve exercer seus direitos sobre esses dados primariamente junto à
          clínica que realiza o atendimento. DentalFlow cooperará com solicitações legítimas
          conforme obrigações contratuais e legais.
        </p>
      </LegalSection>

      <LegalSection id="compartilhamento" title="8. Compartilhamento de Dados">
        <p>Não vendemos dados pessoais. Compartilhamos dados somente nas seguintes situações:</p>
        <LegalList
          items={[
            'Stripe (pagamentos): para processamento de assinaturas e pagamentos. A Stripe mantém certificação PCI DSS.',
            'Google (Calendar): quando você autoriza a integração, metadados de eventos são compartilhados com o Google. Os termos de privacidade do Google se aplicam aos dados sincronizados.',
            'Provedores de infraestrutura: para hospedagem e armazenamento dos dados (com obrigações contratuais de confidencialidade).',
            'Autoridades públicas: quando exigido por lei, ordem judicial ou regulação aplicável.',
          ]}
        />
      </LegalSection>

      <LegalSection id="stripe" title="9. Pagamentos via Stripe">
        <p>
          Os dados de cartão de crédito e informações de pagamento são processados
          exclusivamente pela Stripe, Inc. A DentalFlow não armazena dados completos de
          cartão. A Stripe é certificada PCI DSS Nível 1. Consulte a{' '}
          <a
            href="https://stripe.com/br/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className={legalInlineLinkClass}
          >
            Política de Privacidade da Stripe
          </a>{' '}
          para mais informações.
        </p>
      </LegalSection>

      <LegalSection id="google-calendar" title="10. Integração com Google Calendar">
        <p>
          Quando você conecta sua conta do Google Calendar, eventos de agendamento podem
          ser sincronizados. Importante:
        </p>
        <LegalList
          items={[
            'A conexão é opcional e pode ser revogada a qualquer momento.',
            'Por padrão, os eventos são criados com informações mínimas para preservar a privacidade dos pacientes.',
            'Eventos sincronizados ficam sujeitos às configurações e políticas de compartilhamento da conta Google conectada.',
            'Tokens de autenticação do Google são armazenados somente no servidor, nunca expostos ao navegador.',
          ]}
        />
      </LegalSection>

      <LegalSection id="cookies" title="11. Cookies e Tecnologias Similares">
        <p>
          Utilizamos cookies e tecnologias similares para autenticação, preferências e,
          com seu consentimento, análise de uso. Você pode gerenciar suas preferências de
          cookies a qualquer momento clicando em "Preferências de cookies" no rodapé.
          Consulte nossa{' '}
          <Link to="/politica-de-cookies" className={legalInlineLinkClass}>
            Política de Cookies
          </Link>{' '}
          para detalhes completos.
        </p>
      </LegalSection>

      <LegalSection id="seguranca" title="12. Medidas de Segurança">
        <p>
          Adotamos medidas técnicas e administrativas razoáveis e proporcionais ao risco
          para proteger os dados pessoais, incluindo:
        </p>
        <LegalList
          items={[
            'Comunicações protegidas por HTTPS/TLS.',
            'Senhas armazenadas com hash seguro (bcrypt).',
            'Autenticação por JWT com rotação de tokens de atualização.',
            'Controle de acesso por papel (RBAC) com isolamento por clínica.',
            'Logs de auditoria para ações sensíveis.',
            'Acesso interno restrito ao princípio do menor privilégio.',
          ]}
        />
        <p>
          Nenhum sistema é 100% seguro. Em caso de incidente de segurança com potencial
          impacto aos titulares, notificaremos a ANPD e os afetados conforme exigido pela
          LGPD.
        </p>
      </LegalSection>

      <LegalSection id="retencao" title="13. Retenção de Dados">
        <p>
          Mantemos os dados pelo tempo necessário para as finalidades descritas, observando
          obrigações legais:
        </p>
        <LegalList
          items={[
            'Dados de conta: enquanto a conta estiver ativa e por período adicional para defesa legal.',
            'Prontuários odontológicos: conforme orientação do CFO, mínimo de 10 anos após o último atendimento.',
            'Dados fiscais: mínimo de 5 anos conforme legislação tributária.',
            'Logs de auditoria: conforme necessidade de segurança e defesa legal (tipicamente 1-3 anos).',
            'Dados de cookies e consentimento: conforme necessidade de comprovação de conformidade.',
          ]}
        />
      </LegalSection>

      <LegalSection id="transferencia" title="14. Transferência Internacional de Dados">
        <p>
          Alguns de nossos subprocessadores (Stripe, Google) têm operações nos Estados
          Unidos. Essas transferências são realizadas com base em mecanismos de adequação
          reconhecidos ou cláusulas contratuais padrão, conforme orientação da ANPD.
          Esta questão requer validação jurídica específica.
        </p>
      </LegalSection>

      <LegalSection id="direitos" title="15. Seus Direitos como Titular">
        <p>Você tem os seguintes direitos sobre seus dados pessoais (Art. 18, LGPD):</p>
        <LegalList
          items={[
            'Confirmação: saber se tratamos seus dados.',
            'Acesso: obter cópia dos seus dados.',
            'Correção: atualizar dados incorretos ou desatualizados.',
            'Anonimização, bloqueio ou eliminação: quando aplicável e legalmente possível.',
            'Portabilidade: receber seus dados em formato estruturado.',
            'Informação sobre compartilhamento: saber com quem compartilhamos seus dados.',
            'Revogação de consentimento: quando o tratamento se basear em consentimento.',
            'Petição à ANPD: caso considere que seus direitos não foram atendidos.',
          ]}
        />
        <p>
          Para exercer seus direitos, acesse nossa{' '}
          <Link to="/direitos-do-titular" className={legalInlineLinkClass}>
            página de Direitos do Titular
          </Link>{' '}
          ou entre em contato com nosso encarregado de dados.
        </p>
      </LegalSection>

      <LegalSection id="encarregado" title="16. Contato com o Encarregado (DPO)">
        <p>
          Nosso encarregado de proteção de dados pode ser contatado pelo e-mail{' '}
          <a href={`mailto:${DPO_EMAIL}`} className={legalInlineLinkClass}>
            {DPO_EMAIL}
          </a>
          . Consulte nossa{' '}
          <Link to="/encarregado" className={legalInlineLinkClass}>
            página do Encarregado
          </Link>{' '}
          para mais informações sobre canais de contato.
        </p>
      </LegalSection>

      <LegalSection id="anpd" title="17. Reclamação à ANPD">
        <p>
          Caso suas solicitações não sejam atendidas de forma satisfatória, você pode
          registrar reclamação junto à Autoridade Nacional de Proteção de Dados (ANPD),
          por meio do portal{' '}
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

      <LegalSection id="atualizacoes" title="18. Atualizações desta Política">
        <p>
          Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças
          relevantes por e-mail ou aviso no sistema. O uso continuado da plataforma após
          a notificação implica aceitação das alterações.
        </p>
      </LegalSection>

      <LegalContactBlock email={DPO_EMAIL} />
    </LegalPageShell>
  )
}
