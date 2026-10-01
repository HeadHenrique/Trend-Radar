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


## Etapa 3.2 — Posts e snapshots

Migration:

`20261001041950_create_posts_snapshots_foundation`

### collection_runs

- RLS habilitado;
- sem GRANT para anon/authenticated;
- sem policy para authenticated;
- service_role: SELECT/INSERT/UPDATE;
- sem DELETE.

O INFO `rls_enabled_no_policy` do Security Advisor é intencional para esta tabela server-side only.

### instagram_posts

- authenticated: SELECT;
- RLS permite SELECT somente para viewer/editor/admin;
- service_role: SELECT/INSERT/UPDATE;
- sem DELETE.

### snapshots

`post_metric_snapshots` e `profile_metric_snapshots`:

- authenticated: SELECT condicionado por role válida;
- service_role: SELECT/INSERT;
- sem UPDATE;
- sem DELETE.

### service_role

As quatro tabelas executam REVOKE ALL explícito de PUBLIC/anon/authenticated/service_role antes dos grants mínimos.

Como service_role possui BYPASSRLS, a proteção do collector depende principalmente dessa matriz de grants.

### Função

`set_observed_entity_updated_at()`:

- SECURITY INVOKER;
- EXECUTE direto revogado de PUBLIC, anon, authenticated e service_role;
- trigger validado com sucesso.

### Testes

Executados em transações com ROLLBACK:

- status/finished_at;
- cross-profile post snapshot;
- cross-profile profile snapshot;
- trigger updated_at;
- viewer/editor/admin;
- role inválida;
- collection_runs inacessível ao authenticated.

Nenhum dado de teste persistiu.

### Advisors 01/10/2026

Security:

- INFO `rls_enabled_no_policy` em collection_runs: intencional;
- WARN `auth_leaked_password_protection`: pré-existente, fora do escopo desta migration.

Performance:

- 3 INFO `unindexed_foreign_keys` em FKs compostas de snapshots;
- não corrigidos nesta etapa porque parent IDs não são fluxo de UPDATE/DELETE no MVP e não há necessidade comprovada de novos índices;
- unused indexes em tabelas novas/vazias são esperados.


## Etapa 3.3.2 — monitored_profile_posts

Migration:

`20261001201951_create_post_profile_associations`

RLS:

- habilitado.

Grants:

- anon: nenhum;
- authenticated: SELECT;
- authenticated: sem INSERT/UPDATE/DELETE;
- service_role: SELECT/INSERT/UPDATE;
- service_role: sem DELETE.

Policy:

- SELECT somente para viewer/editor/admin.

Testes reais em transação com ROLLBACK:

- viewer leu as 19 associações;
- role inválida leu 0;
- authenticated não conseguiu INSERT.

Integridade:

- snapshot sem associação perfil↔post falhou;
- após associação temporária válida, snapshot passou;
- rollback removeu todos os dados temporários.

Advisor:

- nenhum finding de segurança novo causado pela migration;
- collection_runs sem policy continua intencional/server-side only;
- leaked password protection continua fora do escopo.

Performance:

- a nova FK de snapshots gerou INFO de falta de índice;
- corrigido por `20261001202104_index_post_snapshot_profile_post_fk`;
- o finding novo desapareceu após reexecutar o advisor.
