# Security

## Estado implementado

### Frontend

- somente publishable key;
- nenhuma service role/secret no bundle;
- Auth por e-mail + senha;
- rotas internas protegidas;
- sem signup público na UI.

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

Privilégios de coluna impedem UPDATE pelo frontend em:

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

Testes estruturais confirmaram:

- anon sem SELECT/INSERT/UPDATE/DELETE;
- authenticated sem DELETE;
- campos humanos com UPDATE;
- campos provider sem UPDATE;
- created_by/updated_by sem UPDATE;
- funções de trigger sem EXECUTE para anon/authenticated.

### Auditoria

`created_by` e `updated_by` usam `ON DELETE SET NULL`.

`updated_by` preserva o último editor humano quando uma atualização server-side não possui `auth.uid()`.

### Primeiro admin

Procedimento detalhado:

`docs/AUTH_SETUP.md`

Criar o usuário real no Supabase Auth e atribuir `trend_radar_role = admin` por Admin API/server-side ou mecanismo administrativo equivalente.

Nunca permitir que o próprio frontend atualize `app_metadata`.

### Signup público

A aplicação não possui tela de signup.

Como o conector atual não expõe a configuração administrativa do Supabase Auth, ainda é necessário **verificar manualmente** no Dashboard que self-signup público está desabilitado se o ambiente deve ser estritamente interno.

Isso não altera RLS: mesmo um usuário autenticado sem `trend_radar_role` válido não acessa dados de negócio.

### Advisors

Security advisor após a migration: **0 findings**.

Performance advisor: 6 avisos INFO de índices ainda não utilizados:

- monitored_profiles_primary_market_idx;
- monitored_profiles_group_idx;
- monitored_profiles_created_by_idx;
- monitored_profiles_updated_by_idx;
- monitored_profiles_tags_gin_idx;
- monitored_profiles_collection_queue_idx.

A tabela ainda está vazia, então esse resultado é esperado. Os índices não foram removidos antes de haver carga real para medir uso.
