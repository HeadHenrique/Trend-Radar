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

### Auditoria

`created_by` e `updated_by` usam `ON DELETE SET NULL`.

`updated_by` preserva o último editor humano quando uma atualização server-side não possui `auth.uid()`.

### Primeiro admin

Crie o usuário real no Supabase Auth e atribua `trend_radar_role = admin` por Admin API/server-side ou mecanismo administrativo equivalente.

Nunca permitir que o próprio frontend atualize `app_metadata`.

### Advisors

Security advisor após a migration: sem findings.

Performance advisor: informou índices ainda não utilizados. Isso é esperado com a tabela vazia e não justifica removê-los antes da operação real.
