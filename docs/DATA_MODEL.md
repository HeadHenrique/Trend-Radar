# Data Model

## Estado real

Migrations aplicadas:

- `20260930195835_create_monitored_profiles_foundation`;
- `20261001041950_create_posts_snapshots_foundation`.

Tabelas de negócio/observação existentes:

- `public.monitored_profiles`;
- `public.collection_runs`;
- `public.instagram_posts`;
- `public.post_metric_snapshots`;
- `public.profile_metric_snapshots`.

Após a Etapa 3.2, as quatro novas tabelas permanecem vazias.

## Relações

```text
monitored_profiles
  ├─< collection_runs
  ├─< instagram_posts
  │     └─< post_metric_snapshots
  └─< profile_metric_snapshots

collection_runs
  ├─< post_metric_snapshots
  └─< profile_metric_snapshots
```

### collection_runs

Entidade operacional server-side.

Campos principais:

- `monitored_profile_id`;
- `collection_type`;
- `provider_key`;
- `orchestrator`;
- `provider_run_id`;
- `orchestrator_run_id`;
- `started_at` / `finished_at`;
- `status`;
- contadores;
- `error_message`.

Constraint temporal:

- `running` exige `finished_at IS NULL`;
- `success|partial|error` exige `finished_at IS NOT NULL`.

### instagram_posts

Entidade canônica de conteúdo observado do Instagram.

Identidade por prioridade:

1. `instagram_media_id`;
2. `instagram_shortcode`;
3. `permalink`.

Pelo menos uma identidade é obrigatória.

### post_metric_snapshots

Histórico temporal de métricas do post.

Inclui `monitored_profile_id` redundante propositalmente para integridade e consulta.

FKs compostas garantem que:

- post e snapshot pertencem ao mesmo perfil;
- run e snapshot pertencem ao mesmo perfil.

### profile_metric_snapshots

Histórico temporal do perfil.

FK composta garante que o run pertence ao mesmo perfil do snapshot.

### NULL vs ZERO

- `0` = zero observado;
- `NULL` = indisponível / não observado.

## Imutabilidade

Para o collector:

- post snapshots: SELECT + INSERT;
- profile snapshots: SELECT + INSERT;
- sem UPDATE;
- sem DELETE.

## Segurança

- `collection_runs`: server-side only;
- posts e snapshots: SELECT para `viewer|editor|admin` via RLS;
- frontend não escreve posts/snapshots;
- `service_role` teve grants automáticos revogados e recebeu apenas a matriz mínima aprovada.

Detalhes completos:

`docs/POSTS_SNAPSHOTS_FOUNDATION.md`
