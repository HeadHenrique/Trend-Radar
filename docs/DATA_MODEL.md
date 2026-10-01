# Data Model

## Estado real

Migrations aplicadas:

- `20260930195835_create_monitored_profiles_foundation`;
- `20261001041950_create_posts_snapshots_foundation`.

Estado atual:

- monitored_profiles = 1;
- collection_runs = 1;
- instagram_posts = 19;
- post_metric_snapshots = 19;
- profile_metric_snapshots = 0.

## Modelo atual aplicado

```text
monitored_profiles
  ├─< collection_runs
  ├─< instagram_posts
  │     └─< post_metric_snapshots
  └─< profile_metric_snapshots
```

Limitação conhecida:

`instagram_posts.monitored_profile_id` força um post canônico a pertencer a um único perfil monitorado.

## Modelo corretivo proposto — NÃO APLICADO

```text
monitored_profiles
  └─< monitored_profile_posts >─ instagram_posts
                                  └─< post_metric_snapshots

collection_runs
  ├─< post_metric_snapshots
  └─< profile_metric_snapshots
```

### instagram_posts

Passa a ser canônico/global.

Sem `monitored_profile_id`.

Campos novos propostos:

- author_instagram_username;
- author_instagram_external_id;
- hashtags.

### monitored_profile_posts

Relação N:N entre perfil monitorado e post.

PK:

`(monitored_profile_id, instagram_post_id)`

association_type:

- author;
- collaborator;
- discovered.

### Snapshots

`post_metric_snapshots` mantém `monitored_profile_id` como contexto da observação.

FK proposta:

`(monitored_profile_id, post_id) → monitored_profile_posts(...)`

A FK run/perfil continua garantindo que o run pertence ao mesmo perfil.

### profile snapshots

Sem mudança estrutural.

Documento principal:

`docs/POST_ASSOCIATIONS_FOUNDATION.md`
