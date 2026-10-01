# Architecture

## Stack

- React;
- TypeScript;
- Vite;
- React Router;
- Supabase JS;
- Supabase Auth;
- PostgreSQL/RLS;
- n8n;
- Bright Data Instagram Profiles Scraper API;
- Vercel.

## Estado implementado

Hoje o produto possui:

```text
/login
  ↓
Supabase Auth
  ↓
ProtectedRoute
  ↓
React UI
  ↓
Profiles Repository
  ↓
Supabase Data API
  ↓
RLS + column privileges
  ↓
public.monitored_profiles
  ↑
n8n — Trend Radar — Profile Collector POC
  ↑
Instagram Provider
```

O workflow de perfil segue DRAFT/não publicado.

## Fundação proposta da Etapa 3.1 — não implementada

```text
monitored_profiles
  ↓
collection_runs
  ↓
Instagram Provider Adapter
  ↓
InstagramProviderPostsResult
  ↓
identity resolver / upsert
  ↓
instagram_posts
  ↓
post_metric_snapshots

profile collection
  ↓
profile_metric_snapshots
```

Princípios:

- entidades canônicas contêm dados observados;
- provider fica atrás de adapter;
- métricas históricas vivem em snapshots;
- `collection_run_id` dá idempotência aos snapshots;
- frontend faz somente SELECT nas futuras entidades observadas;
- escrita fica server-side/n8n;
- nenhum raw payload grande é persistido por padrão.

## Contratos propostos

### Post

`InstagramProviderPostResult`

Contém identidade, permalink, publicação, caption, tipo observável, duração/áudio/thumbnail quando disponíveis e métricas nullable.

### Batch

`InstagramProviderPostsResult`

Contém:

- profileUsername;
- fetchedAt;
- posts[];
- paginação opcional e provider-neutral.

## Recorrência futura

O Profile Collector atual usa:

`active=true AND monitoring_status=pending`

Para recorrência deverá evoluir para elegibilidade por `next_collection_at`, incluindo `pending`, `healthy` e `error` com backoff apropriado.

Nada disso foi aplicado nesta etapa.

Documento de arquitetura:

`docs/POSTS_SNAPSHOTS_FOUNDATION.md`
