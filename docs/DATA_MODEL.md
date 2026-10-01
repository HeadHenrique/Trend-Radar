# Data Model

## Migrations aplicadas

- `20260930195835_create_monitored_profiles_foundation`
- `20261001041950_create_posts_snapshots_foundation`
- `20261001201951_create_post_profile_associations`
- `20261001202104_index_post_snapshot_profile_post_fk`

## Estado atual

- monitored_profiles = 1
- collection_runs = 1
- instagram_posts = 19
- monitored_profile_posts = 19
- post_metric_snapshots = 19
- profile_metric_snapshots = 0

## Relações

```text
monitored_profiles
  ├─< collection_runs
  ├─< monitored_profile_posts >─ instagram_posts
  │                               └─< post_metric_snapshots
  └─< profile_metric_snapshots

collection_runs
  ├─< post_metric_snapshots
  └─< profile_metric_snapshots
```

## instagram_posts

Post canônico global.

Não possui mais `monitored_profile_id`.

Novos campos:

- author_instagram_username text NULL
- author_instagram_external_id text NULL
- hashtags text[] NULL

## monitored_profile_posts

PK:

`(monitored_profile_id, instagram_post_id)`

Campos:

- association_type
- first_seen_at
- last_seen_at
- created_at

Tipos:

- author
- collaborator
- discovered

## post_metric_snapshots

Continua contendo `monitored_profile_id` como contexto da observação/run.

FK principal:

`(monitored_profile_id, post_id) → monitored_profile_posts(...)`

FK de run:

`(collection_run_id, monitored_profile_id) → collection_runs(...)`

Likes/comments/views/plays/shares/saves são métricas da mídia canônica. Agregações futuras não devem duplicar a mesma mídia só por múltiplas associações.

## Backfill

19 posts antigos → 19 associações `author`.

IDs, captions, timestamps e snapshots preservados.

## Run histórico

Não reparado nesta etapa.

Estado persistido:

- received=20
- inserted=0
- updated=19

Resultado lógico original documentado:

- received=20
- inserted=19
- updated=0
