# Data Model

## Estado real

Em 01/10/2026, o banco continua com uma única tabela de negócio:

`public.monitored_profiles`

Migration aplicada:

`20260930195835_create_monitored_profiles_foundation`

Não existem ainda:

- `instagram_posts`;
- `post_metric_snapshots`;
- `profile_metric_snapshots`;
- `collection_runs`.

## monitored_profiles

Principais constraints:

- username lowercase;
- username unique;
- `primary_market_code` com dois caracteres uppercase;
- `profile_group` limitado a `own/competitor/reference/trendsetter`;
- prioridade entre 1 e 3;
- followers não negativo;
- `monitoring_status` em `pending/healthy/error`;
- erro de coleta limitado a 2000 caracteres.

FKs:

- `created_by → auth.users(id) ON DELETE SET NULL`;
- `updated_by → auth.users(id) ON DELETE SET NULL`.

O `followers_count` atual continua sendo cache da observação mais recente.

## Fundação proposta — ainda não aplicada

Etapa 3.1 propõe:

```text
monitored_profiles
  ├─< instagram_posts
  │     └─< post_metric_snapshots
  │
  ├─< profile_metric_snapshots
  │
  └─< collection_runs
        ├─< post_metric_snapshots
        └─< profile_metric_snapshots
```

Nome recomendado da tabela canônica de posts:

`instagram_posts`

Motivo: a plataforma é Instagram, mas o schema permanece independente do fornecedor/provider.

### Identidade de post

Prioridade:

1. `instagram_media_id`;
2. `instagram_shortcode`;
3. `permalink` canônico.

### Histórico temporal

Métricas não serão sobrescritas como única verdade.

- métricas de post → `post_metric_snapshots`;
- métricas de perfil → `profile_metric_snapshots`;
- rastreio/idempotência de coleta → `collection_runs`.

### NULL vs ZERO

- zero = zero observado;
- NULL = indisponível/não observado.

Detalhes completos e SQL draft:

`docs/POSTS_SNAPSHOTS_FOUNDATION.md`
