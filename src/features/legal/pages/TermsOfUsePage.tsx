import { companyInfo, companyStatus } from '@/config/company'

import { LegalPageShell } from '../components/LegalPageShell'
import {
  LegalPageHeader,
  LegalSection,
  LegalList,
  LegalTOC,
  LegalContactBlock,
} from '../components/LegalSection'

const LAST_UPDATED = companyInfo.legalLastUpdatedDate
const isPlaceholderCnpj = !companyStatus.hasRealDocumentNumber

const TOC_ENTRIES = [
  { id: 'objeto', label: '1. Objeto' },
  { id: 'modelo-saas', label: '2. Modelo de Assinatura SaaS' },
  { id: 'responsabilidades-conta', label: '3. Responsabilidades da Conta' },
  { id: 'responsabilidades-papel', label: '4. Responsabilidades por Papel' },
  { id: 'dados-pacientes', label: '5. Dados de Pacientes' },
  { id: 'usos-proibidos', label: '6. Usos Proibidos' },
  { id: 'seguranca', label: '7. Obrigações de Segurança' },
  { id: 'pagamento', label: '8. Pagamento, Trial e Cancelamento' },
  { id: 'disponibilidade', label: '9. Disponibilidade e Manutenção' },
  { id: 'responsabilidade', label: '10. Limitação de Responsabilidade' },
  { id: 'propriedade-intelectual', label: '11. Propriedade Intelectual' },
  { id: 'rescisao', label: '12. Rescisão e Suspensão' },
  { id: 'legislacao', label: '13. Lei Aplicável e Foro' },
  { id: 'atualizacoes', label: '14. Atualizações dos Termos' },
]

export function TermsOfUsePage() {
  return (
    <LegalPageShell>
      <LegalPageHeader
        badge="Legal"
        title="Termos de Uso"
        description="Condições que regem o uso da plataforma DentalFlow por clínicas e profissionais de saúde."
        lastUpdated={LAST_UPDATED}
      />

      <LegalTOC entries={TOC_ENTRIES} />

      <LegalSection id="objeto" title="1. Objeto">
        <p>
          Estes Termos de Uso regulam o acesso e a utilização da plataforma DentalFlow,
          operada por {companyInfo.legalName}{!isPlaceholderCnpj && ` (CNPJ ${companyInfo.documentNumber})`}, doravante
          denominada "DentalFlow". Ao criar uma conta, o usuário declara ter lido,
          compreendido e concordado com estes termos.
        </p>
      </LegalSection>

      <LegalSection id="modelo-saas" title="2. Modelo de Assinatura SaaS">
        <p>
          A DentalFlow é oferecida como serviço por assinatura (SaaS — Software as a
          Service). O acesso à plataforma está condicionado ao pagamento das mensalidades
          ou ao período de trial ativo, conforme o plano contratado.
        </p>
        <LegalList
          items={[
            'O período de trial gratuito tem duração definida no momento do cadastro e não exige dados de pagamento para início.',
            'Após o trial, a continuidade do acesso requer a contratação de um plano pago.',
            'A cobrança é realizada antecipadamente no início de cada período de faturamento.',
            'A renovação é automática até o cancelamento explícito pelo responsável pela conta.',
          ]}
        />
      </LegalSection>

      <LegalSection id="responsabilidades-conta" title="3. Responsabilidades da Conta">
        <p>O titular da conta (OWNER/Proprietário) é responsável por:</p>
        <LegalList
          items={[
            'Manter as credenciais de acesso em sigilo.',
            'Gerenciar e supervisionar o acesso de membros da equipe à plataforma.',
            'Garantir que o uso da plataforma esteja em conformidade com a legislação aplicável, incluindo a LGPD.',
            'Obter os consentimentos necessários dos pacientes para o tratamento de seus dados na plataforma, quando exigido por lei.',
            'Manter os dados cadastrais (da clínica e dos usuários) atualizados.',
            'Notificar a DentalFlow imediatamente em caso de acesso não autorizado à conta.',
          ]}
        />
      </LegalSection>

      <LegalSection id="responsabilidades-papel" title="4. Responsabilidades por Papel">
        <p>
          A plataforma utiliza um sistema de controle de acesso por papel. Os limites de
          acesso de cada papel são:
        </p>
        <LegalList
          items={[
            'Proprietário (OWNER): acesso completo à clínica, incluindo configurações, equipe, financeiro e dados clínicos.',
            'Dentista/Profissional: acesso à agenda própria, prontuários de pacientes atendidos e dados clínicos necessários ao atendimento.',
            'Assistente: acesso a agendamentos, pacientes e funcionalidades administrativas; sem acesso ao financeiro completo nem a prontuários detalhados.',
            'O proprietário não deve conceder acesso além do necessário para a função de cada colaborador (princípio do menor privilégio).',
          ]}
        />
      </LegalSection>

      <LegalSection id="dados-pacientes" title="5. Dados de Pacientes — Responsabilidade da Clínica">
        <p>
          A clínica é a controladora dos dados de seus pacientes nos termos da LGPD.
          DentalFlow atua como operador (processador) desses dados. O titular da conta:
        </p>
        <LegalList
          items={[
            'É o responsável primário pelo tratamento dos dados de pacientes.',
            'Deve ter base legal adequada para inserir e processar dados de pacientes na plataforma.',
            'Deve atender às solicitações de exercício de direitos feitas pelos pacientes.',
            'Deve informar os pacientes sobre o uso da plataforma para gestão de seus dados de saúde.',
          ]}
        />
      </LegalSection>

      <LegalSection id="usos-proibidos" title="6. Usos Proibidos">
        <p>É expressamente vedado:</p>
        <LegalList
          items={[
            'Utilizar a plataforma para fins ilegais ou contrários à ética profissional.',
            'Inserir dados falsos, fraudulentos ou enganosos.',
            'Tentar acessar dados de outras clínicas ou usuários não autorizados.',
            'Compartilhar credenciais de acesso entre múltiplos usuários.',
            'Realizar engenharia reversa, descompilar ou tentar extrair o código-fonte da plataforma.',
            'Utilizar bots, scrapers ou automações não autorizadas.',
            'Sobrecarregar intencionalmente a infraestrutura da plataforma.',
            'Comercializar acesso à plataforma para terceiros sem autorização.',
            'Utilizar os dados obtidos pela plataforma para fins não contratados.',
          ]}
        />
      </LegalSection>

      <LegalSection id="seguranca" title="7. Obrigações de Segurança">
        <p>O usuário concorda em:</p>
        <LegalList
          items={[
            'Utilizar senhas seguras e não reutilizadas de outros serviços.',
            'Encerrar sessões em dispositivos compartilhados ou públicos.',
            'Reportar vulnerabilidades identificadas de forma responsável (ver nossa página de Segurança).',
            'Não registrar dados mais sensíveis do que o necessário para a finalidade de uso.',
          ]}
        />
      </LegalSection>

      <LegalSection id="pagamento" title="8. Pagamento, Trial, Cancelamento e Renovação">
        <LegalList
          items={[
            'Trial: período gratuito de avaliação conforme condições exibidas no cadastro, sem cobrança automática ao término (confirmação de pagamento é requerida).',
            'Cobrança: após contratação de plano pago, o valor é cobrado no início de cada ciclo de faturamento (mensal ou anual, conforme escolha).',
            'Renovação automática: a assinatura é renovada automaticamente. Você pode cancelar a qualquer momento antes da renovação para evitar novas cobranças.',
            'Cancelamento: o acesso é mantido até o fim do período já pago. Não há reembolso proporcional por período não utilizado, salvo determinação legal contrária.',
            'Alteração de plano: o upgrade é aplicado imediatamente; o downgrade é aplicado no próximo ciclo de faturamento.',
            'Inadimplência: após período de carência, o acesso pode ser suspenso até regularização.',
          ]}
        />
      </LegalSection>

      <LegalSection id="disponibilidade" title="9. Disponibilidade e Manutenção">
        <p>
          A DentalFlow emprega esforços razoáveis para manter a plataforma disponível e
          funcional. No entanto:
        </p>
        <LegalList
          items={[
            'Não garantimos disponibilidade ininterrupta.',
            'Manutenções programadas serão comunicadas com antecedência sempre que possível.',
            'Indisponibilidades por força maior, falhas de terceiros ou ataques cibernéticos não geram obrigações de indenização.',
          ]}
        />
      </LegalSection>

      <LegalSection id="responsabilidade" title="10. Limitação de Responsabilidade">
        <p>
          Na extensão permitida pela legislação brasileira (incluindo o Código de Defesa
          do Consumidor):
        </p>
        <LegalList
          items={[
            'A DentalFlow não se responsabiliza por danos indiretos, lucros cessantes ou perda de dados decorrentes do uso da plataforma.',
            'A responsabilidade total da DentalFlow por qualquer reclamação fica limitada ao valor pago pelo usuário nos 3 meses anteriores ao evento.',
            'Direitos do consumidor garantidos por lei não são afetados por esta cláusula.',
          ]}
        />
      </LegalSection>

      <LegalSection id="propriedade-intelectual" title="11. Propriedade Intelectual">
        <p>
          O código, design, marca, logotipos e conteúdos da plataforma DentalFlow são de
          propriedade da {companyInfo.legalName} ou de seus licenciadores. O usuário
          recebe licença limitada, não exclusiva e intransferível para uso da plataforma
          conforme estes termos. Os dados inseridos pelo usuário permanecem de sua
          propriedade.
        </p>
      </LegalSection>

      <LegalSection id="rescisao" title="12. Rescisão e Suspensão">
        <p>
          A DentalFlow pode suspender ou encerrar uma conta por violação destes termos,
          inadimplência, suspeita de uso fraudulento ou por determinação legal, com
          notificação prévia quando possível. O usuário pode cancelar sua conta a qualquer
          momento pelo painel de assinatura.
        </p>
      </LegalSection>

      <LegalSection id="legislacao" title="13. Lei Aplicável e Foro">
        <p>
          Estes Termos são regidos pela legislação brasileira, incluindo o Código de Defesa
          do Consumidor (Lei 8.078/1990) e a LGPD (Lei 13.709/2018). Eventuais disputas
          serão dirimidas pelo foro da comarca de domicílio do usuário, quando for
          consumidor, ou conforme acordado entre as partes.
        </p>
      </LegalSection>

      <LegalSection id="atualizacoes" title="14. Atualizações dos Termos">
        <p>
          Estes Termos podem ser atualizados. Notificaremos sobre mudanças relevantes com
          antecedência mínima de 30 dias. O uso continuado após a notificação implica
          aceitação das alterações. Em caso de discordância, o usuário pode cancelar a
          conta antes da entrada em vigor das mudanças.
        </p>
      </LegalSection>

      <LegalContactBlock email={companyInfo.supportEmail} />
    </LegalPageShell>
  )
}
