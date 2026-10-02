# Data Model

## Migrations aplicadas

- `20260930195835_create_monitored_profiles_foundation`
- `20261001041950_create_posts_snapshots_foundation`
- `20261001201951_create_post_profile_associations`
- `20261001202104_index_post_snapshot_profile_post_fk`
- `20261002151345_add_collection_purpose_nullable`
- `20261002151409_enforce_collection_purpose`

## Estado atual — Etapa 4.6

- monitored_profiles = 3
- collection_runs = 10
- instagram_posts = 60
- monitored_profile_posts = 60
- post_metric_snapshots = 83
- profile_metric_snapshots = 3

Execução manual de validação da recorrência:

- n8n execution = 18;
- nenhum perfil elegível;
- 0 novos collection_runs;
- 0 provider jobs;
- 0 alterações de posts/snapshots.

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

## collection_runs

Campos de classificação:

### collection_type

Classificação técnica coarse:

- profile
- posts
- profile_and_posts

### collection_purpose

Propósito operacional obrigatório:

- profile_metadata
- posts_snapshot
- posts_reprocess
- post_metrics_enrichment
- post_metrics_diagnostic

`collection_purpose` é NOT NULL.

Compatibilidade:

```text
profile_metadata
→ profile | profile_and_posts

posts_snapshot
posts_reprocess
post_metrics_enrichment
post_metrics_diagnostic
→ posts | profile_and_posts
```

Distribuição histórica atual:

- profile_metadata = 3;
- posts_snapshot = 4;
- posts_reprocess = 1;
- post_metrics_enrichment = 1;
- post_metrics_diagnostic = 1.

## instagram_posts

Post canônico global.

Não possui `monitored_profile_id`.

Campos de identidade:

- instagram_media_id;
- instagram_shortcode;
- permalink.

Campos adicionais:

- author_instagram_username;
- author_instagram_external_id;
- hashtags.

## monitored_profile_posts

PK:

`(monitored_profile_id, instagram_post_id)`

Association types:

- author;
- collaborator;
- discovered.

## post_metric_snapshots

Contexto:

`post + monitored_profile + collection_run`

Métricas:

- likes;
- comments;
- views;
- plays;
- shares;
- saves.

NULL continua significando não observado.

## profile_metric_snapshots

Métricas:

- followers_count;
- following_count;
- posts_count.

Profile Collector é source of truth de followers.

## Recorrência de posts

O relógio usa somente:

```text
collection_purpose = posts_snapshot
status IN (success, partial)
finished_at
```

Ignorados no relógio:

- posts_reprocess;
- post_metrics_enrichment;
- post_metrics_diagnostic.

Intervalos:

- priority 1 = 24h;
- priority 2 = 72h;
- priority 3 = 7d.

Error posts_snapshot não avança o relógio.

Se o último error for mais recente que o último success/partial:

- backoff de 6h;
- depois disso a elegibilidade volta a depender do onboarding/due_at.
