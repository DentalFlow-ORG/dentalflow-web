# Google OAuth no DentalFlow

## Visão geral

O login com Google é iniciado no frontend por `GET /api/auth/google`, mas todo o fluxo OAuth roda no backend. O frontend nunca recebe `access_token`, `id_token` ou `client_secret` do Google.

Após o callback, o backend cria ou vincula o usuário DentalFlow por e-mail verificado, emite o mesmo `accessToken`/`refresh_token` já usado no login por senha e redireciona para o frontend.

## Google Cloud Console

1. Crie ou selecione um projeto no Google Cloud Console.
2. Configure a tela de consentimento OAuth.
3. Crie credenciais do tipo OAuth Client ID para aplicação web.
4. Adicione o redirect URI do backend:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Produção: `https://seu-dominio-api.com/api/auth/google/callback`
5. Use apenas os escopos `openid`, `email` e `profile`.

## Variáveis de ambiente

Backend:

```env
GOOGLE_AUTH_ENABLED="true"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"
FRONTEND_AUTH_SUCCESS_URL="http://localhost:5173/acessar/oauth/sucesso"
FRONTEND_AUTH_COMPLETE_PROFILE_URL="http://localhost:5173/acessar/completar-perfil"
```

Frontend:

```env
VITE_API_URL="http://localhost:3000/api"
```

Em produção, `GOOGLE_CALLBACK_URL`, `FRONTEND_AUTH_SUCCESS_URL` e `FRONTEND_AUTH_COMPLETE_PROFILE_URL` devem usar HTTPS.

## Desenvolvimento local

1. Configure as variáveis no backend.
2. Garanta que o redirect URI local esteja cadastrado no Google Cloud Console.
3. Inicie backend e frontend.
4. Acesse `/acessar` e clique em `Continuar com Google`.

Se `GOOGLE_AUTH_ENABLED` estiver desativado ou a configuração estiver incompleta, o backend não inicia o fluxo e a UI mostra uma falha amigável quando a API não estiver configurada.

## Conclusão de perfil

Quando o Google autentica um e-mail ainda inexistente no DentalFlow, o backend cria uma identidade temporária marcada como perfil incompleto. O usuário é redirecionado para `/acessar/completar-perfil` para informar os campos mínimos já exigidos pelo cadastro atual:

- nome e sobrenome do responsável;
- nome da clínica;
- aceite dos Termos de Uso e Política de Privacidade.

Enquanto `isProfileComplete=false`, rotas `/app` redirecionam para a conclusão de perfil. Ao concluir, o backend cria a clínica, altera o papel para `OWNER`, registra o aceite e emite uma nova sessão.

## Segurança

- O backend usa `state` com TTL para reduzir risco de CSRF no OAuth.
- O e-mail do Google precisa estar verificado.
- Tokens do Google não são persistidos para login simples.
- Usuários inativos, excluídos ou pacientes existentes não ganham acesso ao app via Google.
- Billing, RBAC e tenant guards continuam aplicados depois do login.
- Não há redirect dinâmico recebido do frontend; os destinos são variáveis fixas do backend.
