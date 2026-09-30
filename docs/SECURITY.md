# Security

## Estado implementado

### Frontend

- somente publishable key;
- nenhuma service role/secret no bundle;
- Auth por e-mail + senha;
- rotas internas protegidas;
- sessão autenticada sem papel válido recebe tela de acesso não autorizado e não carrega o shell;
- sem signup público na UI;
- configuração do Supabase no frontend depende exclusivamente de `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, sem fallback hardcoded.

### Autorização

Usa:

`app_metadata.trend_radar_role`

Papéis:

- viewer;
- editor;
- admin.

Nunca usar `user_metadata` para autorização.

### monitored_profiles

RLS habilitado.

- anon: sem acesso;
- viewer: leitura;
- editor/admin: leitura + criação + update humano;
- sem DELETE.

Privilégios de coluna impedem INSERT/UPDATE pelo frontend nos campos provider e de auditoria. O frontend pode alterar somente:

- instagram_username;
- primary_market_code;
- profile_group;
- niche;
- category;
- priority;
- tags;
- active.

Campos provider/auditoria permanecem somente leitura para clientes autenticados:

- instagram_external_id;
- display_name;
- profile_picture_url;
- followers_count;
- monitoring_status;
- last_collected_at;
- next_collection_at;
- last_collection_error;
- created_by;
- updated_by.

Validações estruturais e reais confirmaram:

- anon sem grants em `monitored_profiles`;
- authenticated sem DELETE;
- SELECT condicionado por RLS a `viewer|editor|admin`;
- INSERT/UPDATE condicionado por RLS a `editor|admin`;
- campos humanos com INSERT/UPDATE;
- campos provider e de auditoria sem INSERT/UPDATE;
- funções de trigger sem EXECUTE para anon/authenticated;
- cadastro real grava `created_by` com o usuário autenticado;
- edição humana atualiza `updated_at` e `updated_by`;
- pausa/reativação altera apenas `active` e preserva o estado operacional.

### Auditoria

`created_by` e `updated_by` usam `ON DELETE SET NULL`.

`updated_by` preserva o último editor humano quando uma atualização server-side não possui `auth.uid()`.

### Username do Instagram

Antes de existir `instagram_external_id`, o username pode ser corrigido pelo editor/admin.

Depois da resolução da identidade, o trigger `a_monitored_profiles_protect_resolved_username` bloqueia alteração do username feita por cliente autenticado.

Não foi criado `instagram_external_id` artificialmente para testar esse bloqueio.

### Primeiro admin

Existe um usuário interno real com `app_metadata.trend_radar_role = admin`.

Credenciais, e-mail e UUID não são versionados na documentação.

O fluxo real foi validado com:

- login;
- restauração de sessão após reload;
- logout;
- novo login.

Procedimento de criação permanece documentado em `docs/AUTH_SETUP.md`.

### Signup público

A aplicação não possui tela de signup.

O conector disponível não expõe a configuração administrativa de self-signup do Supabase Auth. A confirmação dessa configuração continua manual no Dashboard do Supabase.

Isso não altera RLS: mesmo um usuário autenticado sem `trend_radar_role` válido não acessa dados de negócio.

### Advisors

Security advisor em 2026-09-30:

- 1 WARN de projeto/Auth: `auth_leaked_password_protection` — Leaked Password Protection está desabilitado.
- Esse aviso não foi criado pela migration de `monitored_profiles` e não exige mudança de schema da Etapa 2.5.
- Referência: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

Performance advisor em 2026-09-30:

- 6 avisos INFO de índices ainda não utilizados:
  - monitored_profiles_primary_market_idx;
  - monitored_profiles_group_idx;
  - monitored_profiles_created_by_idx;
  - monitored_profiles_updated_by_idx;
  - monitored_profiles_tags_gin_idx;
  - monitored_profiles_collection_queue_idx.

Com apenas um perfil real e sem carga de coleta, esse resultado ainda não é evidência para remoção de índices.
