# Profile Foundation

## Status

**IMPLEMENTADO — ETAPA 2**

Migration aplicada em 30/09/2026:

`20260930195835_create_monitored_profiles_foundation`

Arquivo versionado:

`supabase/migrations/20260930195835_create_monitored_profiles_foundation.sql`

## Estrutura real

A tabela `public.monitored_profiles` contém:

- identidade: `id`, `instagram_username`, `instagram_external_id`;
- apresentação: `display_name`, `profile_picture_url`;
- classificação humana: `primary_market_code`, `profile_group`, `niche`, `category`, `priority`, `tags`, `active`;
- operação: `followers_count`, `monitoring_status`, `last_collected_at`, `next_collection_at`, `last_collection_error`;
- auditoria: `created_at`, `updated_at`, `created_by`, `updated_by`.

## Regras

### Mercado

`primary_market_code` aceita código uppercase de dois caracteres.

UI inicial:

- BR → Brasil;
- US → Estados Unidos.

### Grupo

`profile_group` é `TEXT + CHECK`:

- `own`;
- `competitor`;
- `reference`;
- `trendsetter`.

### Prioridade

- 1 = alta;
- 2 = média;
- 3 = baixa.

### Status

`active` representa intenção do usuário.

`monitoring_status` representa saúde operacional:

- `pending`;
- `healthy`;
- `error`.

A UI mostra **Pausado** quando `active = false`, sem gravar `paused`.

## Username

A application layer normaliza:

- `@usuario`;
- `usuario`;
- URLs válidas do Instagram.

Normalização não valida existência real.

Enquanto `instagram_external_id IS NULL`, editor/admin pode corrigir o username.

Depois da resolução, trigger no banco bloqueia alteração pelo cliente autenticado. Futuro backend/provider poderá sincronizar rename confirmado.

## Auditoria

`created_by` e `updated_by` são nullable, FK para `auth.users(id)` com `ON DELETE SET NULL`.

- `created_by`: preenchido por `auth.uid()` na criação humana;
- `updated_by`: atualizado por trigger apenas quando campos humanos mudam;
- atualização operacional sem usuário preserva `OLD.updated_by`;
- `updated_at`: atualizado em qualquer alteração real.

## Campos humanos

- `instagram_username` (com regra de resolução);
- `primary_market_code`;
- `profile_group`;
- `niche`;
- `category`;
- `priority`;
- `tags`;
- `active`.

## Campos operacionais/provider

- `instagram_external_id`;
- `display_name`;
- `profile_picture_url`;
- `followers_count`;
- `monitoring_status`;
- `last_collected_at`;
- `next_collection_at`;
- `last_collection_error`.

O frontend autenticado não possui UPDATE nesses campos.

## RLS

- anon: nenhum acesso;
- viewer: SELECT;
- editor: SELECT + INSERT + UPDATE dos campos humanos;
- admin: mesmas operações de negócio nesta fase;
- usuário autenticado sem `trend_radar_role` válido: nenhum acesso;
- DELETE: não disponibilizado.

Autorização usa `app_metadata.trend_radar_role`.

## Frontend

`/profiles` implementa:

- cadastro;
- edição dos campos humanos;
- pausa/reativação;
- busca por nome/@;
- filtros por grupo, mercado, prioridade e ativo/pausado;
- fallback de avatar;
- estados loading/empty/error/success;
- “Aguardando primeira coleta”;
- “Dados insuficientes”.

## Fora do escopo

Ainda não implementados:

- n8n;
- provider Instagram;
- scraping;
- posts;
- snapshots;
- Trend Engine;
- scores;
- oportunidades calculadas.
