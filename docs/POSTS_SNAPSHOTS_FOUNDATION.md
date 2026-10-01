# Posts & Snapshots Foundation

## Estado implementado

Migrations relevantes:

- `20261001041950_create_posts_snapshots_foundation`;
- `20261001201951_create_post_profile_associations`;
- `20261001202104_index_post_snapshot_profile_post_fk`.

## Modelo atual

```text
monitored_profiles
  ├─< collection_runs
  ├─< monitored_profile_posts >─ instagram_posts
  │                               └─< post_metric_snapshots
  └─< profile_metric_snapshots
```

## Posts

`instagram_posts` é canônico global e não pertence diretamente a um perfil monitorado.

Identidade global:

- instagram_media_id;
- instagram_shortcode;
- permalink.

Autoria observada:

- author_instagram_username;
- author_instagram_external_id.

Hashtags:

- hashtags text[] NULL.

## Associações

`monitored_profile_posts` liga perfil↔post.

association_type:

- author;
- collaborator;
- discovered.

## Post metric snapshots

Métricas temporais continuam em snapshots.

NULL significa indisponível/não observado.

ZERO significa zero realmente observado.

Integridade:

- associação perfil↔post deve existir;
- collection run deve pertencer ao mesmo perfil.

Snapshots continuam imutáveis para o collector:

- SELECT + INSERT;
- sem UPDATE;
- sem DELETE.

## Profile metric snapshots

Sem alteração estrutural na Etapa 3.3.2.

## Collection runs

Continuam server-side only.

Counters representam a coleta lógica original.

Replay terminal não deve sobrescrever counters/status/finished_at.

## Próximo passo

Validar o Posts Collector adaptado em execução controlada.

Até essa autorização:

- workflow não deve ser executado;
- Bright Data não deve ser chamada;
- Dc9H9yExV6q permanece não inserido.
