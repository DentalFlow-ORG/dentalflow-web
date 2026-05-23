import { companyInfo } from '@/config/company'

import { LegalPageShell } from '../components/LegalPageShell'
import { LegalPageHeader, LegalSection, LegalList, LegalTable } from '../components/LegalSection'

const LAST_UPDATED = companyInfo.legalLastUpdatedDate
const POLICY_VERSION = companyInfo.cookiePolicyVersion

export function CookiePolicyPage() {
  return (
    <LegalPageShell>
      <LegalPageHeader
        badge="Cookies"
        title="Política de Cookies"
        description="Informações sobre como utilizamos cookies e como você pode gerenciar suas preferências."
        lastUpdated={LAST_UPDATED}
      />

      <LegalSection id="o-que-sao" title="1. O que São Cookies">
        <p>
          Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando
          você visita um site. Utilizamos cookies e tecnologias similares (como
          armazenamento local) para garantir o funcionamento da plataforma e melhorar
          sua experiência.
        </p>
      </LegalSection>

      <LegalSection id="categorias" title="2. Categorias de Cookies que Utilizamos">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Sempre ativo
              </span>
              <h3 className="font-semibold text-slate-900">Cookies Necessários</h3>
            </div>
            <p className="mt-3 text-slate-600">
              Essenciais para o funcionamento da plataforma. Sem eles, serviços como
              autenticação e segurança não funcionam. Não podem ser desativados.
            </p>
            <LegalList
              items={[
                'Token de acesso (sessão autenticada)',
                'Token de atualização de sessão (renovação automática)',
                'Preferências de tema (claro/escuro)',
                'Estado de consentimento de cookies',
              ]}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Opcional
              </span>
              <h3 className="font-semibold text-slate-900">Cookies de Preferências</h3>
            </div>
            <p className="mt-3 text-slate-600">
              Permitem que a plataforma lembre suas escolhas e personalize a experiência.
            </p>
            <LegalList
              items={[
                'Preferências de exibição e filtros salvos',
                'Configurações de layout e visualização',
              ]}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Opcional
              </span>
              <h3 className="font-semibold text-slate-900">Cookies de Analytics</h3>
            </div>
            <p className="mt-3 text-slate-600">
              Coletam informações sobre como a plataforma é utilizada para que possamos
              melhorá-la. Os dados são agregados e não identificam usuários individuais.
            </p>
            <LegalList
              items={[
                'Páginas visitadas e fluxos de navegação',
                'Tempo de uso de funcionalidades',
                'Erros e problemas técnicos (sem dados pessoais)',
              ]}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Opcional
              </span>
              <h3 className="font-semibold text-slate-900">Cookies de Marketing</h3>
            </div>
            <p className="mt-3 text-slate-600">
              Usados para personalizar comunicações e medir a eficácia de campanhas.
              Atualmente não utilizados em produção.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="tabela" title="3. Tabela de Cookies">
        <LegalTable
          headers={['Nome', 'Categoria', 'Finalidade', 'Duração', 'Provedor']}
          rows={[
            ['dentalflow_access_token', 'Necessário', 'Autenticação JWT', 'Sessão', 'DentalFlow'],
            ['dentalflow_user', 'Necessário', 'Dados de sessão do usuário', 'Sessão', 'DentalFlow'],
            ['dentalflow.theme', 'Necessário', 'Preferência de tema claro/escuro', 'Persistente', 'DentalFlow'],
            [`dentalflow_cookie_consent_v${POLICY_VERSION}`, 'Necessário', 'Registro de consentimento de cookies', 'Persistente (1 ano)', 'DentalFlow'],
            ['dentalflow_preferences', 'Preferências', 'Configurações de exibição', 'Persistente', 'DentalFlow'],
            ['_analytics_*', 'Analytics', 'Métricas de uso (quando ativo)', 'Sessão/90 dias', 'DentalFlow/Provedor'],
          ]}
        />
      </LegalSection>

      <LegalSection id="cookies-terceiros" title="4. Cookies de Terceiros">
        <p>
          Terceiros como Stripe podem definir cookies ao processar pagamentos. Esses
          cookies são regidos pelas políticas de privacidade de cada provedor.
          A DentalFlow não controla o comportamento de cookies de terceiros.
        </p>
      </LegalSection>

      <LegalSection id="gerenciar" title="5. Como Gerenciar suas Preferências">
        <p>Você pode gerenciar suas preferências de cookies de três formas:</p>
        <LegalList
          ordered
          items={[
            'Banner de cookies: ao visitar a plataforma pela primeira vez, você verá um banner com opções de aceitar todos, recusar não essenciais ou personalizar.',
            'Central de preferências: acesse clicando em "Preferências de cookies" no rodapé do site.',
            'Configurações do navegador: você pode bloquear ou excluir cookies pelo seu navegador, mas isso pode impactar o funcionamento da plataforma.',
          ]}
        />
      </LegalSection>

      <LegalSection id="revogar" title="6. Como Revogar o Consentimento">
        <p>
          Você pode revogar seu consentimento a qualquer momento clicando em
          "Preferências de cookies" no rodapé. A revogação não afeta o tratamento
          realizado anteriormente com base no consentimento dado.
        </p>
        <p>
          Cookies necessários não podem ser desativados, pois são essenciais para a
          segurança e funcionamento do sistema de autenticação.
        </p>
      </LegalSection>

      <LegalSection id="atualizacoes" title="7. Atualizações desta Política">
        <p>
          Esta política pode ser atualizada. Em caso de mudanças relevantes, solicitaremos
          novo consentimento. A versão atual é{' '}
          <strong>v{POLICY_VERSION}</strong>.
        </p>
      </LegalSection>
    </LegalPageShell>
  )
}
