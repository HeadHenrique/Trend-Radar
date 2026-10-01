# Architecture

## Stack

- React + TypeScript + Vite;
- Supabase Auth;
- PostgreSQL/RLS;
- n8n;
- provider Instagram desacoplado por adapter;
- Vercel.

## Estado implementado

```text
Frontend
  ↓
Supabase Auth + RLS
  ↓
monitored_profiles

Camada observada
  ├─ collection_runs        (server-side only)
  ├─ instagram_posts
  ├─ post_metric_snapshots
  └─ profile_metric_snapshots
```

A fundação de banco foi implementada pela migration:

`20261001041950_create_posts_snapshots_foundation`

## Integridade

`collection_runs` e `instagram_posts` possuem chave candidata composta:

`(id, monitored_profile_id)`

Snapshots usam FKs compostas para impedir cruzamento entre perfis.

## Segurança

Frontend:

- SELECT em posts e snapshots somente com role `viewer|editor|admin`;
- sem acesso a `collection_runs`;
- sem escrita nas novas tabelas.

Collector server-side:

- `collection_runs`: SELECT/INSERT/UPDATE;
- `instagram_posts`: SELECT/INSERT/UPDATE;
- snapshots: SELECT/INSERT;
- sem DELETE;
- sem UPDATE de snapshots.

Como `service_role` ignora RLS, os GRANTs mínimos são a principal barreira de escrita do collector.

## Função/trigger

`set_observed_entity_updated_at()`:

- SECURITY INVOKER;
- EXECUTE direto revogado de PUBLIC/anon/authenticated/service_role;
- utilizada somente pelo trigger de `instagram_posts.updated_at`;
- funcionamento validado em transação com rollback.

## n8n

Nenhuma alteração foi feita na Etapa 3.2.

O Profile Collector existente permanece como estava.

A primeira ingestão real de posts requer autorização separada.
