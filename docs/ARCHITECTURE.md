# Architecture

## Estado implementado

A ingestão real de posts existe e permanece DRAFT no n8n.

Banco atual:

- monitored_profiles;
- collection_runs;
- instagram_posts;
- post_metric_snapshots;
- profile_metric_snapshots.

## Correção arquitetural proposta — Etapa 3.3.1

A mídia do Instagram deve ser globalmente canônica.

```text
provider
  ↓
instagram_posts
  ↓
monitored_profile_posts
  ↑
monitored_profiles
```

Isso permite:

```text
post ABC
  ↔ Leonardo
  ↔ José
  ↔ outro perfil monitorado
```

sem duplicar a mídia.

## Associação e evidência

Tipos:

- author;
- collaborator;
- discovered.

A evidência deve ser conservadora.

No post `Dc9H9yExV6q`, o payload já coletado contém `coauthor_producers` com `leonardofroese`, portanto a associação futura é collaborator.

## Snapshots

Post snapshots continuam contextualizados por perfil/run:

```text
(monitored_profile_id, post_id)
→ monitored_profile_posts

(collection_run_id, monitored_profile_id)
→ collection_runs
```

## Trend Engine futuro

Creator Breadth, Adoption Velocity e participação de concorrentes/referências deverão usar `monitored_profile_posts`, opcionalmente filtrando por `association_type`.

Não usar `instagram_posts.monitored_profile_id`.

## Collection runs

Counters representam o resultado da coleta lógica original.

Replay técnico de run terminal é no-op para:

- status;
- finished_at;
- received_count;
- inserted_count;
- updated_count.

Detalhes:

`docs/POST_ASSOCIATIONS_FOUNDATION.md`
