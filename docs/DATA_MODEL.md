# Data Model

## Estado real

O banco continua com uma única tabela de negócio aplicada:

`public.monitored_profiles`

Migration existente:

`20260930195835_create_monitored_profiles_foundation`

A fundação de posts/snapshots permanece **DRAFT — NÃO APLICADA**.

## Modelo proposto após Etapa 3.1.1

```text
monitored_profiles
  ├─< instagram_posts
  │     └─< post_metric_snapshots
  │
  ├─< collection_runs
  │     ├─< post_metric_snapshots
  │     └─< profile_metric_snapshots
  │
  └─< profile_metric_snapshots
```

### collection_runs

Entidade operacional server-side.

Campos centrais:

- monitored_profile_id;
- collection_type;
- provider_key;
- orchestrator;
- provider_run_id;
- orchestrator_run_id;
- status;
- contadores;
- horários;
- erro sanitizado.

O run é criado antes da chamada ao provider e reutilizado em retries/polling.

### Integridade cross-profile

`collection_runs`:

`UNIQUE(id, monitored_profile_id)`

`instagram_posts`:

`UNIQUE(id, monitored_profile_id)`

`post_metric_snapshots` usa FKs compostas para garantir que post e run pertencem ao mesmo perfil.

`profile_metric_snapshots` usa FK composta para garantir que o run pertence ao mesmo perfil.

Nenhum trigger customizado é necessário para essa integridade.

### Snapshots

Snapshots são imutáveis para o collector:

- SELECT + INSERT;
- sem UPDATE;
- sem DELETE.

Um snapshot só pode existir quando pelo menos uma métrica foi observada.

### NULL vs ZERO

- `0` = zero observado;
- `NULL` = indisponível / não observado.

### Segurança

`collection_runs` não é exposta ao frontend no MVP.

`instagram_posts`, `post_metric_snapshots` e `profile_metric_snapshots` poderão ser lidos por roles internas via RLS.

O `service_role` ignora RLS, portanto o SQL futuro fará REVOKE explícito de todos os privilégios automáticos antes dos grants mínimos.

Detalhes e SQL draft:

`docs/POSTS_SNAPSHOTS_FOUNDATION.md`
