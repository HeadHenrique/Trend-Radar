# API Spec

## Estado atual

A fundação de banco de posts/snapshots existe, mas **não há repository de posts nem UI de Posts implementados ainda**.

`src/lib/database.types.ts` foi regenerado do schema real.

## Tabelas disponíveis

- `collection_runs`;
- `instagram_posts`;
- `post_metric_snapshots`;
- `profile_metric_snapshots`.

## Acesso frontend

### collection_runs

Sem acesso para `authenticated`.

### instagram_posts

SELECT somente para roles:

- viewer;
- editor;
- admin.

### snapshots

SELECT somente para roles válidas.

Frontend não possui INSERT/UPDATE/DELETE nessas entidades.

## Escrita server-side

Matriz efetiva:

- collection_runs: SELECT, INSERT, UPDATE;
- instagram_posts: SELECT, INSERT, UPDATE;
- post_metric_snapshots: SELECT, INSERT;
- profile_metric_snapshots: SELECT, INSERT.

Sem DELETE.

Snapshots sem UPDATE.

## Contrato provider-neutral futuro

O contrato arquitetural permanece:

`InstagramProviderPostResult`

e:

`InstagramProviderPostsResult`

A implementação do adapter/workflow de posts ainda não foi iniciada.

## Idempotência futura

O fluxo aprovado deverá:

1. criar `collection_run`;
2. chamar provider;
3. salvar `provider_run_id`;
4. reutilizar o mesmo run/job em retries;
5. upsert do post;
6. inserir snapshot;
7. finalizar run.

Nenhum desses passos foi implementado em n8n nesta etapa.
